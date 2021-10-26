DROP DATABASE IF EXISTS rendezvous;
CREATE DATABASE rendezvous;
USE rendezvous;

DELIMITER $$

CREATE TABLE servers
(
    id             int PRIMARY KEY AUTO_INCREMENT,
    name           varchar(255) NOT NULL,
    user_id        char(36)     NOT NULL COMMENT ' owner ',
    image_md5      char(32),
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
    `order`   int unsigned NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers (id) ON DELETE CASCADE
)$$

CREATE TABLE channels
(
    id        int PRIMARY KEY AUTO_INCREMENT,
    server_id int                    NOT NULL,
    group_id  int,
    type      enum ('text', 'voice') NOT NULL,
    name      varchar(255)           NOT NULL,
    `order`   int unsigned           NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups` (id) ON DELETE CASCADE
)$$

CREATE TABLE friendships
(
    id       int PRIMARY KEY AUTO_INCREMENT,
    user1_id char(36) NOT NULL,
    user2_id char(36) NOT NULL
)$$

CREATE TABLE friend_requests
(
    #     user1 sends a friend request to user2
    id       int PRIMARY KEY AUTO_INCREMENT,
    user1_id char(36)                                 NOT NULL,
    user2_id char(36)                                 NOT NULL,
    status   enum ('pending', 'accepted', 'declined') NOT NULL
)$$

CREATE TABLE members
(
    id        int PRIMARY KEY AUTO_INCREMENT,
    server_id int      NOT NULL,
    user_id   char(36) NOT NULL,
    `order`   int      NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers (id) ON DELETE CASCADE
)$$

CREATE TABLE messages
(
    id            int PRIMARY KEY AUTO_INCREMENT,
    friendship_id int,
    server_id     int,
    channel_id    int,
    user_id       char(36)     NOT NULL,
    timestamp     datetime     NOT NULL DEFAULT NOW(),
    text          varchar(255) NOT NULL,
    is_reply      boolean      NOT NULL,
    reply_id      int,
    image_md5     char(32),
    FOREIGN KEY (friendship_id) REFERENCES friendships (id) ON DELETE CASCADE,
    FOREIGN KEY (server_id) REFERENCES servers (id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES messages (id) ON DELETE SET NULL,
    CHECK (
            ((friendship_id IS NOT NULL) AND (server_id IS NULL) AND (channel_id IS NULL)) OR
            ((friendship_id IS NULL) AND (server_id IS NOT NULL) AND (channel_id IS NOT NULL))
        )
)$$

CREATE TABLE roles
(
    id                int PRIMARY KEY AUTO_INCREMENT,
    server_id         int          NOT NULL,
    name              varchar(255) NOT NULL DEFAULT 'everyone',
    rename_server     boolean      NOT NULL DEFAULT true,
    create_invitation boolean      NOT NULL DEFAULT true,
    delete_server     boolean      NOT NULL DEFAULT true,
    create_channels   boolean      NOT NULL DEFAULT true,
    create_groups     boolean      NOT NULL DEFAULT true,
    delete_channels   boolean      NOT NULL DEFAULT true,
    delete_groups     boolean      NOT NULL DEFAULT true,
    move_channels     boolean      NOT NULL DEFAULT true,
    move_groups       boolean      NOT NULL DEFAULT true,
    read_messages     boolean      NOT NULL DEFAULT true,
    write_messages    boolean      NOT NULL DEFAULT true,
    FOREIGN KEY (server_id) REFERENCES servers (id) ON DELETE CASCADE
)$$

CREATE TABLE members_roles
(
    id        int PRIMARY KEY AUTO_INCREMENT,
    member_id int NOT NULL,
    server_id int NOT NULL,
    role_id   int NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
)$$

CREATE VIEW roles_view AS
SELECT id,
       server_id         as serverId,
       name,
       rename_server     as renameServer,
       create_invitation as createInvitation,
       delete_server     as deleteServer,
       create_channels   as createChannels,
       create_groups     as createGroups,
       delete_channels   as deleteChannels,
       delete_groups     as deleteGroups,
       move_channels     as moveChannels,
       move_groups       as moveGroups,
       read_messages     as readMessages,
       write_messages    as writeMessages
FROM roles;

CREATE VIEW members_roles_view AS
SELECT id,
       member_id as memberId,
       server_id as serverId,
       role_id   as roleId
FROM members_roles;

CREATE VIEW member_roles_for_server AS
SELECT r.id              as roleId,
       name,
       m.user_id         as userId,
       m.server_id       as serverId,
       rename_server     as renameServer,
       create_invitation as createInvitation,
       delete_server     as deleteServer,
       create_channels   as createChannels,
       create_groups     as createGroups,
       delete_channels   as deleteChannels,
       delete_groups     as deleteGroups,
       move_channels     as moveChannels,
       move_groups       as moveGroups,
       read_messages     as readMessages,
       write_messages    as writeMessages
FROM members_roles mr
         JOIN members m on mr.member_id = m.id
         JOIN roles r on mr.role_id = r.id AND m.server_id = r.server_id
$$

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
    IF (NEW.channel_id IS NOT NULL) THEN
        SELECT type INTO @TYPE FROM channels WHERE NEW.channel_id = id;
        IF (@TYPE IS NULL) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Channel doesn\'t exist';
        ELSEIF (@TYPE = 'voice') THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Voice channels can\'t contain text messages';
        END IF;
    ELSEIF (LENGTH(TRIM(NEW.text)) = 0 AND NEW.image_md5 IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Message text must not be empty';
    END IF;
END $$

CREATE VIEW servers_view
AS
SELECT s.id, s.name, s.user_id as userId, s.image_md5 as imageMd5, s.invitation, s.invitation_exp as invitationExp
FROM servers s $$

CREATE VIEW groups_view
AS
SELECT g.id, g.server_id as serverId, g.name, g.`order`
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
       m.friendship_id as friendshipId,
       m.server_id     as serverId,
       m.channel_id    as channelId,
       m.user_id       as userId,
       m.timestamp,
       m.text,
       m.is_reply      as isReply,
       m.reply_id      as replyId,
       m.image_md5     as imageMd5
FROM messages m;

CREATE VIEW friendships_view
AS
SELECT f.id,
       f.user1_id as user1Id,
       f.user2_id as user2Id
FROM friendships f;

CREATE VIEW friends_view
AS
SELECT f.id,
       f.user1_id as user1Id,
       f.user2_id as user2Id
FROM friendships f;

CREATE VIEW friend_requests_view
AS
SELECT f.id,
       f.user1_id as user1Id,
       f.user2_id as user2Id,
       f.status
FROM friend_requests f;

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

CREATE FUNCTION send_friend_request(userId char(36), user2Id char(36)) RETURNS int
    MODIFIES SQL DATA DETERMINISTIC
BEGIN
    IF (userId = user2Id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'You cant be friend with yourself';
    END IF;
    SELECT f.id INTO @friendshipId FROM friendships f WHERE user1_id = userId OR user2_id = user2Id;
    IF (@friendshipId IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'You are already friends';
    END IF;
    SELECT f.id, f.status
    INTO @friendshipInvitationId1, @friendshipInvitationStatus1
    FROM friend_requests f
    WHERE user1_id = userId;

    SELECT f.id, f.status
    INTO @friendshipInvitationId2, @friendshipInvitationStatus2
    FROM friend_requests f
    WHERE user2_id = userId;

    IF (@friendshipInvitationId1 IS NOT NULL OR @friendshipInvitationId2 IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invitation has already been sent or received';
    END IF;

    INSERT INTO friend_requests (user1_id, user2_id, status) VALUES (userId, user2Id, 'pending');

    RETURN LAST_INSERT_ID();
END $$

CREATE PROCEDURE change_friend_request(userId char(36), friendRequestId int, accept boolean)
BEGIN
    SELECT f.user1_id, f.user2_id, f.status
    INTO @user1Id, @user2Id, @status
    FROM friend_requests f
    WHERE id = friendRequestId;
    IF (@user2Id IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Friend request doesnt exist';
    ELSEIF (@user1Id = userId) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'The accepting party must be the second user';
    ELSEIF (@status = 'accepted') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invitation already accepted';
    ELSEIF (@status = 'declined') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invitation already declined';
    END IF;
    IF (accept) THEN
        UPDATE friend_requests SET status = 'accepted' WHERE id = friendRequestId;
        INSERT INTO friendships (user1_id, user2_id) VALUES (@user1Id, @user2Id);
    ELSE
        UPDATE friend_requests SET status = 'declined' WHERE id = friendRequestId;
    END IF;
END $$

CREATE PROCEDURE get_user_data(userId char(36))
BEGIN
    SELECT s.id, s.name, s.userId, s.imageMd5, s.invitation, s.invitationExp, m.`order`
    FROM servers_view s
             JOIN members m ON s.id = m.server_id
        AND m.user_id = userId;

    SELECT r.id,
           r.serverId,
           r.name,
           r.renameServer,
           r.createInvitation,
           r.deleteServer,
           r.createChannels,
           r.createGroups,
           r.deleteChannels,
           r.deleteGroups,
           r.moveChannels,
           r.moveGroups,
           r.readMessages,
           r.writeMessages
    FROM roles_view r
             JOIN servers s ON r.serverId = s.id
             JOIN members m ON s.id = m.server_id AND m.user_id = userId;

    SELECT mr.id,
           mr.memberId,
           mr.serverId,
           mr.roleId
    FROM members_roles_view mr
             JOIN servers s ON mr.serverId = s.id
             JOIN members m ON s.id = m.server_id AND m.user_id = userId;

    SELECT g.id, g.serverId, g.name, g.`order`
    FROM groups_view g
             JOIN members m ON g.serverId = m.server_id
        AND m.user_id = userId;

    SELECT c.id, c.serverId, c.groupId, c.`order`, c.type, c.name
    FROM channels_view c
             JOIN members m ON c.serverId = m.server_id
        AND m.user_id = userId;

    SELECT m1.id, m1.serverId, m1.userId
    FROM members_view m1
             JOIN members m2 ON m1.serverId = m2.server_id
    WHERE m2.user_id = userId;

    SELECT f.id, f.user1Id, f.user2Id FROM friends_view f WHERE f.user1Id = userId OR f.user2Id = userId;

    SELECT f.id, f.user1Id, f.user2Id, f.status
    FROM friend_requests_view f
    WHERE (user1Id = userId OR user2Id = userId)
      AND (f.status = 'pending');
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

    SELECT MAX(`order`)
    INTO @lastServerOrder
    FROM servers s
             JOIN members m on s.id = m.server_id
    WHERE m.user_id = userId;

    INSERT INTO members (server_id, user_id, `order`) VALUES (@serverId, userId, IFNULL(@lastServerOrder + 1, 0));

    SET @memberId = LAST_INSERT_ID();

    SELECT id INTO @roleId FROM roles r WHERE r.server_id = @serverId AND r.name = 'everyone';

    INSERT INTO members_roles (member_id, server_id, role_id) VALUES (@memberId, @serverId, @roleId);

    SELECT s.id, s.name, s.userId, s.imageMd5, s.invitation, s.invitationExp, m.`order`
    FROM servers_view s
             JOIN members m ON m.user_id = userId AND m.server_id = @serverId
    WHERE s.id = @serverId;

    SELECT r.id,
           r.serverId,
           r.name,
           r.renameServer,
           r.createInvitation,
           r.deleteServer,
           r.createChannels,
           r.createGroups,
           r.deleteChannels,
           r.deleteGroups,
           r.moveChannels,
           r.moveGroups,
           r.readMessages,
           r.writeMessages
    FROM roles_view r
    WHERE r.serverId = @serverId;

    SELECT mr.id,
           mr.memberId,
           mr.serverId,
           mr.roleId
    FROM members_roles_view mr
    WHERE mr.serverId = @serverId;

    SELECT g.id, g.serverId, g.name, g.`order`
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

CREATE PROCEDURE send_message(userId char(36), friendship int, channelId int, message varchar(255), isReply boolean,
                              replyId int, imageMd5 char(32))
BEGIN

    IF (friendship IS NULL) THEN
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

        INSERT INTO messages (server_id, channel_id, user_id, text, is_reply, reply_id, image_md5)
        VALUES (@serverId, channelId, userId, message, isReply, replyId, imageMd5);
    ELSE
        INSERT INTO messages (friendship_id, server_id, channel_id, user_id, text, is_reply, reply_id, image_md5)
        VALUES (friendship, NULL, channelId, userId, message, isReply, replyId, imageMd5);
    END IF;

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
    INSERT INTO `groups` (server_id, name, `order`) VALUES (@serverId, @group1Name, 0);
    SET @group1Id = LAST_INSERT_ID();
    INSERT INTO `groups` (server_id, name, `order`) VALUES (@serverId, @group2Name, 1);
    SET @group2Id = LAST_INSERT_ID();
    INSERT INTO channels (server_id, group_id, type, name, `order`)
    VALUES (@serverId, @group1Id, 'text', @channel1Name, 0);
    INSERT INTO channels (server_id, group_id, type, name, `order`)
    VALUES (@serverId, @group2Id, 'voice', @channel2Name, 0);

    SELECT MAX(`order`)
    INTO @lastServerOrder
    FROM servers s
             JOIN members m on s.id = m.server_id
    WHERE m.user_id = userId;

    INSERT INTO members (server_id, user_id, `order`) VALUES (@serverId, userId, IFNULL(@lastServerOrder + 1, 0));

    SET @memberId = LAST_INSERT_ID();

    INSERT INTO roles (server_id) VALUES (@serverId);
    SET @roleId = LAST_INSERT_ID();
    INSERT INTO members_roles (member_id, server_id, role_id) VALUES (@memberId, @serverId, @roleId);

    INSERT INTO roles (server_id, name) VALUES (@serverId, 'admin');
    SET @roleId = LAST_INSERT_ID();
    INSERT INTO members_roles (member_id, server_id, role_id) VALUES (@memberId, @serverId, @roleId);

    SELECT s.id, s.name, s.userId, s.imageMd5, s.invitation, s.invitationExp, IFNULL(@lastServerOrder, 0) as `order`
    FROM servers_view s
    WHERE id = @serverId;

    SELECT *
    FROM roles_view r
    WHERE r.serverId = @serverId;

    SELECT *
    FROM members_roles_view mr
    WHERE mr.serverId = @serverId;

    SELECT g.id, g.serverId, g.name, g.`order`
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

    SELECT MAX(`order`)
    INTO @lastChannelOrder
    FROM channels c
    WHERE server_id = serverId
      AND group_id = c.group_id;

    INSERT INTO channels (server_id, group_id, type, name, `order`)
    VALUES (serverId, groupId, channelType, channelName, @lastChannelOrder + 1);

    RETURN LAST_INSERT_ID();

END $$

CREATE FUNCTION create_group(userId char(36), serverId int, groupName varchar(255)) RETURNS int DETERMINISTIC
    MODIFIES SQL DATA
BEGIN
    SET @groupName = TRIM(groupName);

    IF (LENGTH(@groupName) = 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Group name must not be empty';
    END IF;

    SELECT is_member(userId, serverId) INTO @isMember;

    SELECT MAX(`order`)
    INTO @lastGroupOrder
    FROM `groups` g
    WHERE server_id = serverId;

    INSERT INTO `groups` (server_id, name, `order`) VALUES (serverId, groupName, @lastGroupOrder);

    RETURN LAST_INSERT_ID();

END $$

CREATE PROCEDURE get_messages(userId char(36), friendshipId int, serverId int, channelId int, offset int)
BEGIN

    IF (friendshipId IS NULL) THEN
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
               m.friendshipId,
               m.serverId,
               m.channelId,
               m.userId,
               m.timestamp,
               m.text,
               m.isReply,
               m.replyId,
               m.imageMd5
        FROM messages_view m
                 JOIN channels c ON m.channelId = c.id
        WHERE c.id = channelId
        ORDER BY timestamp DESC, m.id DESC
        LIMIT 30 OFFSET offset;
    ELSE
        SELECT m.id,
               m.friendshipId,
               m.serverId,
               m.channelId,
               m.userId,
               m.timestamp,
               m.text,
               m.isReply,
               m.replyId,
               m.imageMd5
        FROM messages_view m
        WHERE m.friendshipId = friendshipId
        ORDER BY timestamp DESC, m.id DESC
        LIMIT 30 OFFSET offset;
    END IF;
END $$