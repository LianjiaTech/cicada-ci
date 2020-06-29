import { execSync } from 'child_process';
import * as fs from 'fs';
import * as md5 from 'md5';
import {
  GithubCommit,
  PackageSize,
  BuildStatus,
} from '~/db/entities/build-record.entity';
import { Project } from '~/db/entities/project.entity';
import { Job } from '~/db/entities/job.entity';
import globalTaskConfig from '~/configs/build-task';
import EventBus, { BUILD_EVENTS } from '~/utils/event-bus';
import { CommonTask, throttle } from '~/utils/common-task';

export interface BuildTaskConfig {
  id: number;
  project: Project;
  job: Job;
  branch: string;
  commit: GithubCommit;
}

const { workspace, packspace, cachespace } = globalTaskConfig;

const LOG_UPDATE_INTERVAL = 3; // log更新时长（秒）
const TASK_TIMEOUT = 1000; // 任务超时时限 (秒)

export class BuildTaskFactory {
  private static pool: Map<number, BuildTask> = new Map();

  public static getTask(config: BuildTaskConfig): BuildTask {
    const { id } = config;
    const pool = BuildTaskFactory.pool;
    let task;
    if (pool.has(id)) {
      task = pool.get(id);
    } else {
      task = new BuildTask(config);
      pool.set(id, task);
    }
    return task;
  }

  public static removeTask(id: number) {
    const pool = BuildTaskFactory.pool;
    pool.delete(id);
  }
}

class BuildTask extends CommonTask {
  protected status: BuildStatus;
  protected endStatus: BuildStatus[];
  private package_sizes: PackageSize[];
  private buildCwd: string;
  private throttleLog: (callback: () => void) => void;
  private timer: NodeJS.Timeout;
  private cache_id: string;
  private pack_from_cache: boolean;

  constructor(private readonly config: BuildTaskConfig) {
    super();
  }

  public async start() {
    this.init();
    this.initTimeout();
    EventBus.emit(BUILD_EVENTS.START, {
      id: this.config.id,
      job_id: this.config.job.id,
      status: this.status,
    });
    await this.stepRepoInit();
    const cacheHitted = await this.stepCacheCompare();
    if (cacheHitted) {
      await this.stepCache2Pack();
    } else {
      await this.stepInstall();
      await this.stepBuild();
      await this.stepPack();
      await this.stepPack2Cache();
    }
    this.stepEnd();
  }

  public async abort() {
    this.killWorkingProcess();
    //in case lost task
    if (!this.log) {
      this.init();
    }
    this.addTitleLog('BUILD ABORTED');
    this.end();
    clearTimeout(this.timer);
    this.status = BuildStatus.ABORT;
    const { log, duration, status, config } = this;
    EventBus.emit(BUILD_EVENTS.ABORT, {
      id: config.id,
      job_id: config.job.id,
      log,
      duration,
      status,
    });
    BuildTaskFactory.removeTask(this.config.id);
  }

  public async addLog(log = '') {
    super.addLog(log);

    const update = () => {
      if (this.isEnd()) {
        return;
      }
      EventBus.emit(BUILD_EVENTS.LOG, {
        id: this.config.id,
        log: this.log,
      });
    };
    this.throttleLog(update);
  }

  protected init() {
    super.init();
    this.package_sizes = [];
    this.status = BuildStatus.PROCESSING;
    this.endStatus = [
      BuildStatus.SUCCESS,
      BuildStatus.ABORT,
      BuildStatus.FAIL,
      BuildStatus.TIMEOUT,
    ];
    this.throttleLog = throttle(LOG_UPDATE_INTERVAL);
    this.cache_id = '';
    this.pack_from_cache = false;
    this.prepareSpaces();
  }

  private initTimeout() {
    this.timer = setTimeout(() => {
      this.timeout();
    }, TASK_TIMEOUT * 1000);
  }

  private timeout() {
    this.killWorkingProcess();
    this.end();
    this.status = BuildStatus.TIMEOUT;
    this.addTitleLog('BUILD TASK TIMEOUT');
    const { log, duration, status, config } = this;
    EventBus.emit(BUILD_EVENTS.TIMEOUT, {
      id: config.id,
      job_id: config.job.id,
      log,
      duration,
      status,
    });
    BuildTaskFactory.removeTask(config.id);
  }

  protected fail() {
    //todo kill sub process
    this.end();
    this.killWorkingProcess();
    clearTimeout(this.timer);
    this.status = BuildStatus.FAIL;
    this.addTitleLog('BUILD TASK FAILED');
    const { log, duration, status, config } = this;
    EventBus.emit(BUILD_EVENTS.FAIL, {
      id: config.id,
      job_id: config.job.id,
      log,
      duration,
      status,
    });
    BuildTaskFactory.removeTask(config.id);
  }

  private succeed() {
    this.end();
    clearTimeout(this.timer);
    this.status = BuildStatus.SUCCESS;
    this.addTitleLog('ALL BUILD TASKS FINISHED');
    const {
      log,
      duration,
      package_sizes,
      status,
      config,
      pack_from_cache,
    } = this;
    EventBus.emit(BUILD_EVENTS.SUCCESS, {
      id: config.id,
      job_id: config.job.id,
      log,
      duration,
      package_sizes,
      status,
      extra: {
        pack_from_cache,
      },
    });
    BuildTaskFactory.removeTask(config.id);
  }

  private updatePackageSizes(distCwd: string) {
    const { packagers } = this.config.job;
    this.package_sizes = packagers.map(({ package_name }) => {
      const stats = fs.statSync(`${distCwd}/${package_name}`);
      return {
        package_name,
        size: stats.size,
      };
    });
  }

  private prepareSpaces() {
    if (!fs.existsSync(workspace)) {
      execSync(`mkdir -p ${workspace}`);
    }
    if (!fs.existsSync(packspace)) {
      execSync(`mkdir -p ${packspace}`);
    }
    if (!fs.existsSync(cachespace)) {
      execSync(`mkdir -p ${cachespace}`);
    }
  }

  private async stepRepoInit() {
    const {
      project,
      job: { packagers },
      branch,
      commit,
    } = this.config;
    const cloneUrl = project.clone_with_ssh
      ? project.ssh_url
      : project.repo_url;
    this.buildCwd = `${workspace}/${project.id}/${encodeURIComponent(branch)}`;
    const mkdirCmd = {
      name: '初始化项目工作空间',
      cmd: `mkdir -p ${this.buildCwd}`,
      cwd: '',
    };
    const cleanUpCmds = packagers.map(({ dist_path }) => ({
      name: '清理产物缓存',
      cmd: `rm -rf ${dist_path}`,
      cwd: this.buildCwd,
    }));
    const stepCmds = [
      mkdirCmd,
      ...cleanUpCmds,
      {
        name: '初始化代码仓库信息',
        //prune origin: clear remote stalled branches
        cmd: `if test -d .git;
          then git config remote.origin.url ${cloneUrl} && git remote prune origin && git fetch --all -q;
          else echo ${cloneUrl} && git clone ${cloneUrl} .;
        fi`,
        cwd: this.buildCwd,
      },
      {
        name: '检出提交代码',
        cmd: `git checkout ${branch} && 
        git reset --hard ${commit.id} && git clean -f -d`,
        cwd: this.buildCwd,
      },
    ];
    await this.execCommandsInOrder(stepCmds, '步骤: 代码初始化');
  }

  private generateCacheId() {
    const { commit, project, job } = this.config;
    const tree_id =
      commit.tree_id ||
      execSync(`git cat-file commit ${commit.id}|head -1|awk '{print $2}'`, {
        cwd: this.buildCwd,
      })
        .toString()
        .replace(/\n/, '');
    if (tree_id) {
      const builderHash = md5(
        `${project.repo_url}${job.builder.build_scripts}`,
      );
      this.cache_id = `${builderHash.substring(0, 10)}_${tree_id.substring(
        0,
        10,
      )}`;
      this.addLog(`Generate cache id: ${this.cache_id}`);
    }
  }

  private cachePackageExists() {
    const { project, job } = this.config;
    const { packagers } = job;
    const cacheCwd = `${cachespace}/${project.id}`;
    return (
      packagers.length &&
      packagers.every(({ package_name }) => {
        const cacheFilePath = `${cacheCwd}/${this.cache_id}_${package_name}`;
        const exists = fs.existsSync(cacheFilePath);
        this.addLog(
          `cache file ${this.cache_id}_${package_name} exists: ${exists}`,
        );
        return exists;
      })
    );
  }

  private async stepCacheCompare() {
    if (this.isEnd()) {
      return;
    }
    if (this.config.job.disable_cache) {
      return false;
    }
    this.addTitleLog('步骤: 对比缓存包', 'START');
    try {
      this.generateCacheId();
      if (!this.cache_id) {
        return false;
      }
      const exists = this.cachePackageExists();
      this.addTitleLog('步骤: 对比缓存包', 'END');
      return exists;
    } catch (e) {
      console.log('cache compare error:' + e);
      this.addTitleLog('步骤: 对比缓存包', 'FAIL');
    }
  }

  private async stepInstall() {
    if (this.isEnd()) {
      return;
    }
    const { install_scripts } = this.config.job.builder;
    await this.execScripts({
      scriptName: 'install_scripts',
      scripts: install_scripts,
      cwd: this.buildCwd,
      stepName: '步骤: 安装依赖',
    });
  }

  private async stepBuild() {
    if (this.isEnd()) {
      return;
    }
    const { build_scripts } = this.config.job.builder;
    await this.execScripts({
      scriptName: 'build_scripts',
      scripts: build_scripts,
      cwd: this.buildCwd,
      stepName: '步骤: 执行构建',
    });
  }

  private async stepPack() {
    if (this.isEnd()) {
      return;
    }
    const { id, project, job } = this.config;
    const { packagers } = job;
    const packCwd = `${packspace}/${project.id}/${id}`;
    //todo check dist exist

    const packCmds = packagers.map(({ package_name, dist_path }) => ({
      cwd: `${this.buildCwd}`,
      cmd: `tar -C ./${dist_path} -zcf ${package_name} .`,
    }));
    const storageCmds = packagers.map(({ package_name }) => ({
      cwd: packCwd,
      cmd: `mv ${this.buildCwd}/${package_name} ${packCwd}`,
    }));
    execSync(`mkdir -p ${packCwd}`);
    await this.execCommandsInOrder(
      [...packCmds, ...storageCmds],
      '步骤: 打包产物',
    );
    this.updatePackageSizes(packCwd);
    this.pack_from_cache = false;
  }

  private async stepPack2Cache() {
    if (this.isEnd()) {
      return;
    }
    const { project, job, id } = this.config;
    const { packagers } = job;
    const cacheCwd = `${cachespace}/${project.id}`;
    const packCwd = `${packspace}/${project.id}/${id}`;
    const cmds = packagers.map(({ package_name }) => {
      const cacheFile = `${this.cache_id}_${package_name}`;
      return {
        cwd: packCwd,
        cmd: `cp -f ${package_name} ${cacheCwd}/${cacheFile}`,
      };
    });
    execSync(`mkdir -p ${cacheCwd}`);
    await this.execCommandsInOrder(cmds, '步骤: 将打包产物存入缓存');
  }

  private async stepCache2Pack() {
    if (this.isEnd()) {
      return;
    }
    const { project, job, id } = this.config;
    const { packagers } = job;
    const cacheCwd = `${cachespace}/${project.id}`;
    const packCwd = `${packspace}/${project.id}/${id}`;
    const cmds = packagers.map(({ package_name }) => {
      const cacheFile = `${this.cache_id}_${package_name}`;
      return {
        cwd: cacheCwd,
        cmd: `cp -f ${cacheFile} ${packCwd}/${package_name}`,
      };
    });
    execSync(`mkdir -p ${packCwd}`);
    await this.execCommandsInOrder(cmds, '步骤: 从缓存获取打包产物');
    this.updatePackageSizes(packCwd);
    this.pack_from_cache = true;
  }

  private stepEnd() {
    if (this.isEnd()) {
      return;
    }
    this.succeed();
  }
}
