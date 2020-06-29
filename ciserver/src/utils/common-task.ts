import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { spawnPromise, ProcessCloseDto } from '~/utils/child-process';

export const throttle = (timeout: number) => {
  let startTime = Date.now();
  let timer: NodeJS.Timeout = null;
  return (callback: () => void) => {
    let now = Date.now();
    clearTimeout(timer);
    if (now - startTime > timeout * 1000) {
      callback();
      startTime = now;
    } else {
      timer = setTimeout(callback, timeout * 1000);
    }
  };
};

export interface ProcessCommand {
  name?: string;
  cmd: string;
  cwd: string;
}

export class CommonTask {
  protected status: unknown;
  protected duration: number;
  protected log: string;
  protected endStatus: unknown[];
  protected startTime: Date;
  protected endTime: Date;
  protected workingProcess: ChildProcessWithoutNullStreams;

  protected init() {
    this.log = '';
    this.duration = 0;
    this.startTime = new Date();
    this.endTime = new Date();
  }

  protected isEnd(): boolean {
    return this.endStatus.includes(this.status);
  }

  protected end() {
    this.endTime = new Date();
    this.duration = (this.endTime.getTime() - this.startTime.getTime()) / 1000; //seconds
  }

  protected fail() {}

  protected createWorkingProcess(
    { cwd, customEnv } = { cwd: '', customEnv: {} },
  ) {
    const env = Object.assign({}, process.env, customEnv);
    delete env['NODE_ENV']; //keep node_env pure
    this.workingProcess = spawn('bash', { detached: true, env, cwd });
    //todo set pid to redis to prevent subprocess island
  }

  protected killWorkingProcess() {
    //todo get pid from redis
    if (this.workingProcess) {
      try {
        this.workingProcess.kill();
      } catch (e) {}
      console.log('killing', this.workingProcess.pid);
    }
  }

  protected addLog(log = '') {
    const time = new Date().toTimeString().split(' ')[0];
    if (log.substr(-1) !== '\n') {
      log += '\n';
    }
    this.log += `[${time}] ${log}`;
  }

  protected addTitleLog(title = '', status = '') {
    const log = `------------- ${title} ${status} -------------`;
    this.addLog(log);
  }

  protected isFatalError(msg = ''): boolean {
    const keywordsReg = /\b(Error|fatal|ERR|bash)(?!\.)\b/;
    return keywordsReg.test(msg);
  }

  //用于顺序执行多个命令，每个命令可以有独立的名称与cwd
  protected async execCommandsInOrder(
    cmds: ProcessCommand[],
    stepName?: string,
  ) {
    if (!cmds || !cmds.length) {
      return;
    }
    if (stepName) {
      this.addTitleLog(stepName, 'START');
    }
    for (let i = 0; i < cmds.length; i++) {
      if (this.isEnd()) {
        break;
      }
      this.createWorkingProcess({ cwd: cmds[i].cwd, customEnv: {} });
      let isFail = false;
      await spawnPromise({
        subProcess: this.workingProcess,
        execType: 'commands',
        commands: [cmds[i].cmd],
        onStdout: stdout => {
          this.addLog(stdout);
        },
        onStderr: stderr => {
          const isFatalError = this.isFatalError(stderr);
          this.addLog('stderr warning: ' + stderr);
          if (isFatalError) {
            isFail = true;
          }
        },
      }).catch((error: Error | ProcessCloseDto) => {
        //todo error handler
        if ((error as ProcessCloseDto).signal) {
          this.addLog(
            `spawn error, code: ${(error as ProcessCloseDto).code}, signal: ${
              (error as ProcessCloseDto).signal
            }`,
          );
        } else {
          this.addLog(`spawn error, error: ${JSON.stringify(error)}`);
        }
        isFail = true;
      });
      if (isFail) {
        this.addTitleLog(stepName, 'FAIL');
        this.fail();
        return;
      }
    }
    if (stepName) {
      this.addTitleLog(stepName, 'END');
    }
  }

  //用于执行一段命令脚本，脚本中的多行命令可以保留上下文
  protected async execScripts({
    scriptName = '',
    scripts = '',
    cwd = '',
    customEnv = {},
    stepName = '',
  }: {
    scriptName: string;
    scripts: string;
    cwd: string;
    customEnv?: unknown;
    stepName?: string;
  }) {
    if (stepName) {
      this.addTitleLog(stepName, 'START');
    }
    //初始化执行脚本文件
    const scriptFilePath = `${cwd}/_tmp_${scriptName}.sh`;
    if (existsSync(scriptFilePath)) {
      unlinkSync(scriptFilePath);
    }
    writeFileSync(scriptFilePath, scripts);

    this.createWorkingProcess({ cwd, customEnv });

    let isFail = false;

    await spawnPromise({
      subProcess: this.workingProcess,
      execType: 'scripts',
      scriptFilePath,
      onStderr: data => {
        this.addLog('stderr:' + data.toString());
        if (this.isFatalError(data)) {
          isFail = true;
        }
      },
      onStdout: data => {
        this.addLog('stdout:' + data.toString());
      },
    }).catch((error: Error | ProcessCloseDto) => {
      //todo error handler
      if (
        (error as ProcessCloseDto).code &&
        (error as ProcessCloseDto).signal
      ) {
        this.addLog(
          `spawn error, code: ${(error as ProcessCloseDto).code}, signal: ${
            (error as ProcessCloseDto).signal
          }`,
        );
      } else {
        this.addLog(`spawn error, error: ${JSON.stringify(error)}`);
      }
      isFail = true;
    });
    if (existsSync(scriptFilePath)) {
      unlinkSync(scriptFilePath);
    }

    if (stepName) {
      this.addTitleLog(stepName, `${isFail ? 'FAIL' : 'END'}`);
    }

    if (isFail) {
      this.fail();
    }
  }
}
