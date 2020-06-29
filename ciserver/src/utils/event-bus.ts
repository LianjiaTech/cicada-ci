import * as events from 'events';

class MyEmitter extends events.EventEmitter {
  constructor() {
    super();
  }
}

export default new MyEmitter();

export enum BUILD_EVENTS {
  START = 'build.start',
  LOG = 'build.log',
  SUCCESS = 'build.success',
  FAIL = 'build.fail',
  ABORT = 'build.abort',
  TIMEOUT = 'build.timeout',
}

export enum BUILD_SOCKET_EVENTS {
  STATUS = 'build.socket.status',
  LOG = 'build.socket.log',
}

export enum DEPLOY_EVENTS {
  START = 'deploy.start',
  LOG = 'deploy.log',
  SUCCESS = 'deploy.success',
  FAIL = 'deploy.fail',
  ABORT = 'deploy.abort',
  TIMEOUT = 'deploy.timeout',
}

export enum DEPLOY_SOCKET_EVENTS {
  STATUS = 'deploy.socket.status',
  LOG = 'deploy.socket.log',
}
