import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

export interface ProcessCloseDto {
  code: number;
  signal: string;
}

export const spawnPromise = ({
  subProcess,
  execType,
  commands,
  scriptFilePath,
  onStdout,
  onStderr,
}: {
  subProcess: ChildProcessWithoutNullStreams;
  execType: 'commands' | 'scripts';
  commands?: string[];
  scriptFilePath?: string;
  onStdout: (data: string) => void;
  onStderr: (data: string) => void;
}) => {
  return new Promise((resolve, reject) => {
    onStdout = onStdout || (() => {});
    onStderr = onStderr || (() => {});

    subProcess.on('close', (code: number, signal: string) => {
      if (code === 0 || signal === 'SIGHUP' || signal === 'SIGTERM') {
        //success or abort
        return resolve({ code, signal });
      } else {
        reject({ code, signal });
      }
    });
    subProcess.stdout.setEncoding('utf8');
    subProcess.stderr.setEncoding('utf8');
    subProcess.stdout.on('data', onStdout);
    subProcess.stderr.on('data', onStderr);
    subProcess.stdin.on('error', e => {
      reject(e);
    });
    if (execType === 'commands') {
      commands.forEach(command => {
        subProcess.stdin.write(command + '\n');
      });
    } else if (execType === 'scripts') {
      subProcess.stdin.write(`sh ${scriptFilePath}`);
    }

    subProcess.stdin.end();
  });
};
