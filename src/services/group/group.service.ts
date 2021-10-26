import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseService } from '../database/database.service';
import { GroupEntity } from '../../entities/group.entity';
import { MoveGroupRequest } from '../../dtos/group.dto';

@Injectable()
export class GroupService {

  constructor(
    private readonly databaseService: DatabaseService,
    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,
  ) {
  }

  async createGroup(
    userId: string,
    serverId: number,
    name: string,
  ): Promise<number> {

    // check if user/member has access
    const canCreateGroups = await this.databaseService.user_has_permission(userId, serverId, 'createGroups');
    if (!canCreateGroups) throw new Error('User doesnt have permission to create groups in this server');

    return this.databaseService.create_group(userId, serverId, name)
      .then((result) => Object.values(result[0])[0]);
  }

  async moveGroup(userId: string, { serverId, groupId, order }: MoveGroupRequest) {

    // check if user/member has access
    const canMoveGroups = await this.databaseService.user_has_permission(userId, serverId, 'moveGroups');
    if (!canMoveGroups) throw new Error('User doesnt have permission to move groups in this server');

    const findGroups = () => {
      return this.groupRepository.find({ where: { server_id: serverId } });
    };
    let serverGroups = await findGroups();
    const groupIndex = serverGroups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) return;
    const group = serverGroups[groupIndex];
    if (group.order === order || group.order + 1 === order) return;
    serverGroups[groupIndex] = undefined;
    serverGroups.splice(order, 0, group);
    serverGroups.splice(serverGroups.findIndex(group => group === undefined), 1);
    serverGroups = serverGroups.map((group, index) => ({ ...group, order: index }));
    await Promise.all(serverGroups.map(({ id, order }) => this.groupRepository.update(id, { order })));
    return findGroups();
  }

}
