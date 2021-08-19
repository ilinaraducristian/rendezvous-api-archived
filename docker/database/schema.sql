DROP DATABASE IF EXISTS capp;
CREATE DATABASE capp;
USE capp;

DELIMITER $$

CREATE TABLE servers
(
    id             int PRIMARY KEY AUTO_INCREMENT,
    name           varchar(255) NOT NULL,
    user_id        char(36)     NOT NULL COMMENT 'owner',
    invitation     char(36),
    invitation_exp datetime,
    CHECK (
            (invitation IS NULL AND invitation_exp IS NULL) OR
            (invitation IS NOT NULL AND invitation_exp IS NOT NULL)
        )
)$$

CREATE TABLE `groups`
(
    id        int PRIMARY KEY AUTO_INCREMENT,
    server_id int          NOT NULL,
    name      varchar(255) NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers (id)
)$$

CREATE TABLE channels
(
    id        int PRIMARY KEY AUTO_INCREMENT,
    server_id int                    NOT NULL,
    group_id  int,
    type      enum ('text', 'voice') NOT NULL,
    name      varchar(255)           NOT NULL,
    `order`   int unsigned           NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers (id),
    FOREIGN KEY (group_id) REFERENCES `groups` (id)
)$$

CREATE TABLE members
(
    id        int PRIMARY KEY AUTO_INCREMENT,
    server_id int      NOT NULL,
    user_id   char(36) NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers (id)
)$$

CREATE TABLE messages
(
    id         int PRIMARY KEY AUTO_INCREMENT,
    server_id  int          NOT NULL,
    channel_id int          NOT NULL,
    user_id    char(36)     NOT NULL,
    timestamp  datetime     NOT NULL DEFAULT NOW(),
    text       varchar(255) NOT NULL,
    is_reply   boolean      NOT NULL,
    reply_id   int,
    FOREIGN KEY (server_id) REFERENCES servers (id),
    FOREIGN KEY (channel_id) REFERENCES channels (id),
    FOREIGN KEY (reply_id) REFERENCES messages (id) ON DELETE SET NULL
)$$

CREATE UNIQUE INDEX unique_member
    ON members (server_id, user_id)$$

CREATE TRIGGER trigger_before_delete_on_servers
    BEFORE DELETE
    ON servers
    FOR EACH ROW
BEGIN
    DELETE FROM members WHERE server_id = OLD.id;
    DELETE messages
    FROM messages,
         channels
    WHERE channels.server_id = OLD.id
      AND channels.type = 'text'
      AND messages.channel_id = channels.id;
    DELETE FROM channels WHERE channels.server_id = OLD.id;
    DELETE FROM `groups` WHERE `groups`.server_id = OLD.id;
END $$

CREATE TRIGGER trigger_before_insert_on_groups
    BEFORE INSERT
    ON `groups`
    FOR EACH ROW
BEGIN
    IF (LENGTH(TRIM(NEW.name)) = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Group name must not be empty';
    END IF;
END $$

CREATE TRIGGER trigger_before_insert_on_channels
    BEFORE INSERT
    ON channels
    FOR EACH ROW
BEGIN
    IF (LENGTH(TRIM(NEW.name)) = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Channel name must not be empty';
    END IF;
END $$

CREATE TRIGGER trigger_before_insert_on_messages
    BEFORE INSERT
    ON messages
    FOR EACH ROW
BEGIN
    SELECT type INTO @TYPE FROM channels WHERE NEW.channel_id = id;
    IF (@TYPE IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Channel doesn\'t exist';
    ELSEIF (@TYPE = 'voice') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Voice channels can\'t contain text messages';
    ELSEIF (LENGTH(TRIM(NEW.text)) = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Message text must not be empty';
    END IF;
END $$

CREATE VIEW servers_view
AS
SELECT s.id, s.name, s.user_id as userId, s.invitation, s.invitation_exp as invitationExp
FROM servers s $$

CREATE VIEW groups_view
AS
SELECT g.id, g.server_id as serverId, g.name
FROM `groups` g $$

CREATE VIEW channels_view
AS
SELECT c.id, c.server_id as serverId, c.group_id as groupId, c.type, c.name, c.`order`
FROM channels c $$

CREATE VIEW members_view
AS
SELECT m1.id,
       m1.server_id as serverId,
       m1.user_id   as userId
FROM members m1 $$

CREATE VIEW messages_view
AS
SELECT m.id,
       m.server_id  as serverId,
       m.channel_id as channelId,
       m.user_id    as userId,
       m.timestamp,
       m.text,
       m.is_reply   as isReply,
       m.reply_id   as replyId
FROM messages m;

CREATE FUNCTION is_member(userId char(36), serverId int) RETURNS BOOLEAN DETERMINISTIC
    READS SQL DATA
BEGIN
    SELECT id INTO @memberId FROM members m WHERE userId = m.user_id AND serverId = m.server_id;

    IF (@memberId IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User is not part of this server';
    END IF;
    RETURN TRUE;
END $$

CREATE PROCEDURE get_user_data(userId char(36))
BEGIN
    SELECT s.id, s.name, s.userId, s.invitation, s.invitationExp
    FROM servers_view s
             JOIN members m ON s.id = m.server_id
        AND m.user_id = userId;

    SELECT g.id, g.serverId, g.name
    FROM groups_view g
             JOIN members m ON g.serverId = m.server_id
        AND m.user_id = userId;

    SELECT c.id, c.serverId, c.groupId, c.type, c.name
    FROM channels_view c
             JOIN members m ON c.serverId = m.server_id
        AND m.user_id = userId;

    SELECT m1.id, m1.serverId, m1.userId
    FROM members_view m1
             JOIN members m2 ON m1.serverId = m2.server_id
    WHERE m2.user_id = userId;
END $$

CREATE FUNCTION create_invitation(userId char(36), serverId int) RETURNS char(36)
    MODIFIES SQL DATA DETERMINISTIC
BEGIN
    SELECT s.invitation, s.invitation_exp, m.user_id
    INTO @INVITATION, @INVITATION_EXP, @memberId
    FROM servers s
             JOIN members m ON s.id = m.server_id
    WHERE userId = m.user_id
      AND s.id = serverId;
    IF (@memberId IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User is not a member of this server';
    END IF;
    IF (@INVITATION IS NOT NULL AND @INVITATION_EXP > NOW()) THEN
        RETURN @INVITATION;
    END IF;
    SET @INVITATION = UUID();
    UPDATE servers s
    SET invitation     = @INVITATION,
        invitation_exp = DATE_ADD(NOW(), INTERVAL 7 DAY)
    WHERE serverId = s.id;
    RETURN @INVITATION;
END $$

CREATE PROCEDURE join_server(userId char(36), invitation char(36))
BEGIN
    SELECT s.id, s.invitation, s.invitation_exp, m.user_id
    INTO @serverId, @invitation, @invitationExp, @memberId
    FROM servers s
             LEFT JOIN members m ON s.id = m.server_id AND userId = m.user_id
    WHERE invitation = s.invitation;
    IF (@invitation IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Bad invitation';
    END IF;
    IF (@memberId IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User already a member of this server';
    END IF;
    IF (@invitationExp < NOW()) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invitation expired';
    END IF;

    INSERT INTO members (server_id, user_id) VALUES (@serverId, userId);

    SELECT s.id, s.name, s.userId, s.invitation, s.invitationExp
    FROM servers_view s
    WHERE id = @serverId;

    SELECT g.id, g.serverId, g.name
    FROM groups_view g
    WHERE g.serverId = @serverId;

    SELECT c.id, c.serverId, c.groupId, c.type, c.name, c.`order`
    FROM channels_view c
    WHERE c.serverId = @serverId;

    SELECT m1.id, m1.serverId, m1.userId
    FROM members_view m1
             JOIN members m2 ON m1.serverId = @serverId
    WHERE m2.user_id = userId;
END $$

CREATE PROCEDURE send_message(userId char(36), channelId int, message varchar(255), isReply boolean, replyId int)
BEGIN

    SELECT c.server_id INTO @serverId FROM channels c WHERE c.id = channelId;

    IF (@serverId IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Channel doesnt exist';
    END IF;

    SELECT m.id
    INTO @memberId
    FROM members m
    WHERE m.user_id = userId
      AND m.server_id = @serverId;

    IF (@memberId IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User is not a member of this server';
    END IF;

    INSERT INTO messages (server_id, channel_id, user_id, text, is_reply, reply_id)
    VALUES (@serverId, channelId, userId, message, isReply, replyId);

    SELECT * FROM messages_view m WHERE m.id = LAST_INSERT_ID();

END $$

CREATE PROCEDURE create_server(userId char(36), serverName varchar(255))
BEGIN
    SET @serverName = TRIM(serverName);
    SET @group1Name = 'Text channels';
    SET @group2Name = 'Voice channels';
    SET @channel1Name = 'general';
    SET @channel2Name = 'General';

    IF (LENGTH(@serverName) = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Server name must not be empty';
    END IF;
    INSERT INTO servers (name, user_id) VALUES (@serverName, userId);
    SET @serverId = LAST_INSERT_ID();
    INSERT INTO `groups` (server_id, name) VALUES (@serverId, @group1Name);
    SET @group1Id = LAST_INSERT_ID();
    INSERT INTO `groups` (server_id, name) VALUES (@serverId, @group2Name);
    SET @group2Id = LAST_INSERT_ID();
    INSERT INTO channels (server_id, group_id, type, name, `order`)
    VALUES (@serverId, @group1Id, 'text', @channel1Name, 0);
    INSERT INTO channels (server_id, group_id, type, name, `order`)
    VALUES (@serverId, @group2Id, 'voice', @channel2Name, 0);

    INSERT INTO members (server_id, user_id) VALUES (@serverId, userId);

    SELECT s.id, s.name, s.userId, s.invitation, s.invitationExp
    FROM servers_view s
    WHERE id = @serverId;

    SELECT g.id, g.serverId, g.name
    FROM groups_view g
    WHERE g.serverId = @serverId;

    SELECT c.id, c.serverId, c.groupId, c.type, c.name, c.`order`
    FROM channels_view c
    WHERE c.serverId = @serverId;

    SELECT m1.id, m1.serverId, m1.userId
    FROM members_view m1
    WHERE m1.serverId = @serverId;

END $$

CREATE FUNCTION create_channel(userId char(36), serverId int, groupId int, channelType enum ('text', 'voice'),
                               channelName varchar(255)) RETURNS int DETERMINISTIC
    MODIFIES SQL DATA
BEGIN
    SET @channelName = TRIM(channelName);

    IF (LENGTH(@channelName) = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Channel name must not be empty';
    END IF;

    SELECT is_member(userId, serverId) INTO @isMember;

    IF (groupId IS NOT NULL) THEN
        SELECT id INTO @groupId FROM `groups` g WHERE groupId = g.id;

        IF (@groupId IS NULL) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Group doesnt exist';
        END IF;
    END IF;

    SELECT c.`order`
    INTO @lastChannelOrder
    FROM channels c
    WHERE server_id = serverId
      AND group_id = c.group_id
    ORDER BY c.`order` DESC
    LIMIT 1;

    INSERT INTO channels (server_id, group_id, type, name, `order`)
    VALUES (serverId, groupId, channelType, channelName, @lastChannelOrder + 1);

    RETURN LAST_INSERT_ID();

END $$

# CREATE PROCEDURE move_channel(userId char(36), serverId int, groupId int, channelId int, channelOrder int)
# BEGIN
#
#     SELECT is_member(userId, serverId);
#
#     START TRANSACTION;
#     UPDATE channels c SET c.`order` = channelOrder WHERE c.id = channelId;
#     SELECT (SUM(c.`order`) = COUNT(*) - 1) INTO @eq FROM channels c WHERE c.group_id = groupId;
#     IF @eq = FALSE THEN
#         ROLLBACK;
#     ELSE
#         COMMIT;
#     END IF;
#
# END
$$

CREATE FUNCTION create_group(userId char(36), serverId int, groupName varchar(255)) RETURNS int DETERMINISTIC
    MODIFIES SQL DATA
BEGIN
    SET @groupName = TRIM(groupName);

    IF (LENGTH(@groupName) = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Group name must not be empty';
    END IF;

    SELECT is_member(userId, serverId) INTO @isMember;

    INSERT INTO `groups` (server_id, name) VALUES (serverId, groupName);

    RETURN LAST_INSERT_ID();

END $$

CREATE PROCEDURE get_messages(userId char(36), serverId int, channelId int, offset int)
BEGIN

    SELECT m.id
    INTO @MEMBER_ID
    FROM members m
    WHERE m.user_id = userId
      and m.server_id = serverId;

    IF (@MEMBER_ID IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User is not a member of this server';
    END IF;

    SELECT m.id,
           m.serverId,
           m.channelId,
           m.userId,
           m.timestamp,
           m.text,
           m.isReply,
           m.replyId
    FROM messages_view m
             JOIN channels c ON m.channelId = c.id
    WHERE c.id = channelId
    ORDER BY timestamp DESC, m.id DESC
    LIMIT 30 OFFSET offset;

END $$