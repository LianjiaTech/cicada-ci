import { DeployStatus } from '~/db/entities/deploy-record.entity';
import { CommonTask, throttle } from '~/utils/common-task';
import globalTaskConfig from '~/configs/build-task';
import EventBus, { DEPLOY_EVENTS } from '~/utils/event-bus';

const { packspace } = globalTaskConfig;

export interface DeployTaskConfig {
  id: number;
  build_id: number;
  project_id: number;
  deploy_scripts: string;
}

const LOG_UPDATE_INTERVAL = 3; // log更新时长（秒）
const TASK_TIMEOUT = 1000; // 任务超时时限 (秒)

export class DeployTaskFactory {
  private static pool: Map<number, DeployTask> = new Map();

  public static getTask(config: DeployTaskConfig): DeployTask {
    const { id } = config;
    const pool = DeployTaskFactory.pool;
    let task;
    if (pool.has(id)) {
      task = pool.get(id);
    } else {
      task = new DeployTask(config);
      pool.set(id, task);
    }
    return task;
  }

  public static removeTask(id: number) {
    const pool = DeployTaskFactory.pool;
    pool.delete(id);
  }
}

class DeployTask extends CommonTask {
  protected status: DeployStatus;
  protected endStatus: DeployStatus[];
  private timer: NodeJS.Timeout;
  private throttleLog: (callback: () => void) => void;

  constructor(private readonly config: DeployTaskConfig) {
    super();
  }

  public async start() {
    this.init();
    this.initTimeout();
    const { config, status } = this;
    EventBus.emit(DEPLOY_EVENTS.START, {
      id: config.id,
      build_id: config.build_id,
      status: status,
    });
    await this.stepBeforeDeploy();
    await this.stepDeployCommands();
    await this.stepAfterDeploy();
    this.stepEnd();
  }

  public async abort() {
    this.killWorkingProcess();
    //in case lost task
    if (!this.log) {
      this.init();
    }
    this.addTitleLog('DEPLOY ABORTED');
    this.end();
    clearTimeout(this.timer);
    this.status = DeployStatus.ABORT;
    const { log, duration, status, config } = this;
    EventBus.emit(DEPLOY_EVENTS.ABORT, {
      id: config.id,
      build_id: config.build_id,
      log,
      duration,
      status,
    });
    DeployTaskFactory.removeTask(this.config.id);
  }

  public async addLog(log = '') {
    super.addLog(log);
    const update = () => {
      if (this.isEnd()) {
        return;
      }
      EventBus.emit(DEPLOY_EVENTS.LOG, {
        id: this.config.id,
        log: this.log,
      });
    };
    this.throttleLog(update);
  }

  private initTimeout() {
    this.timer = setTimeout(() => {
      this.timeout();
    }, TASK_TIMEOUT * 1000);
  }

  private timeout() {
    this.end();
    this.killWorkingProcess();
    this.status = DeployStatus.TIMEOUT;
    this.addTitleLog('DEPLOY TASK TIMEOUT');
    const { log, duration, status, config } = this;
    EventBus.emit(DEPLOY_EVENTS.TIMEOUT, {
      id: config.id,
      build_id: config.build_id,
      log,
      duration,
      status,
    });
    DeployTaskFactory.removeTask(config.id);
  }

  protected fail() {
    this.end();
    this.killWorkingProcess();
    clearTimeout(this.timer);
    this.status = DeployStatus.FAIL;
    this.addTitleLog('DEPLOY TASK FAILED');
    const { log, duration, status, config } = this;
    EventBus.emit(DEPLOY_EVENTS.FAIL, {
      id: config.id,
      build_id: config.build_id,
      log,
      duration,
      status,
    });
    DeployTaskFactory.removeTask(config.id);
  }

  private succeed() {
    this.end();
    clearTimeout(this.timer);
    this.status = DeployStatus.SUCCESS;
    this.addTitleLog('ALL DEPLOY TASKS FINISHED');
    const { log, duration, status, config } = this;
    EventBus.emit(DEPLOY_EVENTS.SUCCESS, {
      id: config.id,
      build_id: config.build_id,
      log,
      duration,
      status,
    });
    DeployTaskFactory.removeTask(config.id);
  }

  protected init() {
    super.init();
    this.status = DeployStatus.PROCESSING;
    this.endStatus = [
      DeployStatus.SUCCESS,
      DeployStatus.ABORT,
      DeployStatus.FAIL,
      DeployStatus.TIMEOUT,
    ];
    this.throttleLog = throttle(LOG_UPDATE_INTERVAL);
  }

  private async stepBeforeDeploy() {
    const { project_id, build_id, id } = this.config;
    const cwd = `${packspace}/${project_id}/${build_id}`;
    await this.execCommandsInOrder(
      [
        { cmd: `mkdir -p ./${id}`, cwd },
        { cmd: `find . -maxdepth 1 -type f -exec cp {} ./${id}/ \\;`, cwd },
      ],
      '步骤: 创建发布空间',
    );
  }

  private async stepDeployCommands() {
    const { deploy_scripts, project_id, build_id, id } = this.config;
    const cwd = `${packspace}/${project_id}/${build_id}/${id}`;
    await this.execScripts({
      scriptName: 'deploy_scripts',
      scripts: deploy_scripts,
      cwd,
      stepName: '步骤: 执行发布',
    });
  }

  private async stepAfterDeploy() {
    const { project_id, build_id, id } = this.config;
    const cwd = `${packspace}/${project_id}/${build_id}`;
    await this.execCommandsInOrder(
      [{ cmd: `rm -Rf ./${id}`, cwd }],
      '步骤: 清理发布空间',
    );
  }

  private stepEnd() {
    if (this.isEnd()) {
      return;
    }
    this.succeed();
  }
}
