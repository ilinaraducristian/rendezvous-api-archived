enum SocketIoEvents {
  newMember = 'new-member',
  memberLeft = 'member-left',
  serverUpdate = 'server-update',
  serverDeleted = 'server-deleted',
  newChannel = 'new-channel',
  channelUpdate = 'channel-update',
  channelDeleted = 'channel-deleted',
  newGroup = 'new-group',
  groupUpdate = 'group-update',
  groupDeleted = 'group-deleted',
  userOnline = 'user-online',
  userOffline = 'user-offline',
}

export default SocketIoEvents;