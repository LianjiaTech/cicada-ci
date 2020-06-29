import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from 'winston';
import EventBus, {
  BUILD_SOCKET_EVENTS,
  DEPLOY_SOCKET_EVENTS,
} from '~/utils/event-bus';
import { Inject } from '@nestjs/common';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  afterInit() {
    const handleBuildStatusChange = ({ id, job_id }) => {
      this.server.emit('build.status.change', { id, job_id });
    };
    const handleBuildLogChange = ({ id }) => {
      this.server.emit('build.log.change', { id });
    };
    const handleDeployStatusChange = ({ id, build_id }) => {
      this.server.emit('deploy.status.change', { id, build_id });
    };
    const handleDeployLogChange = ({ id, build_id }) => {
      this.server.emit('deploy.log.change', { id, build_id });
    };
    EventBus.on(BUILD_SOCKET_EVENTS.STATUS, handleBuildStatusChange);
    EventBus.on(BUILD_SOCKET_EVENTS.LOG, handleBuildLogChange);
    EventBus.on(DEPLOY_SOCKET_EVENTS.STATUS, handleDeployStatusChange);
    EventBus.on(DEPLOY_SOCKET_EVENTS.LOG, handleDeployLogChange);
  }

  handleConnection(client: SocketIO.Client) {
    //console.log('connect', client.id);
  }

  handleDisconnect(client: SocketIO.Client) {
    //console.log('disconnect', client.id);
  }
}
