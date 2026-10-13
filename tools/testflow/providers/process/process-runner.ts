import {
  spawn,
} from 'node:child_process';

export interface ProcessOptions {
  cwd?: string;
  timeoutMs?: number;
}

export interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
}

export function runProcess(
  command: string,
  args: string[],
  cwdOrOptions:
    string | ProcessOptions = process.cwd(),
): Promise<ProcessResult> {
  return new Promise(
    (resolve, reject) => {
      const options:
        ProcessOptions =
          typeof cwdOrOptions === 'string'
            ? {
                cwd: cwdOrOptions,
              }
            : cwdOrOptions;

      const cwd =
        options.cwd ??
        process.cwd();

      const timeoutMs =
        options.timeoutMs ??
        180_000;

      const startedAt =
        Date.now();

      const child =
        spawn(
          command,
          args,
          {
            cwd,
            shell: false,
            stdio: [
              'ignore',
              'pipe',
              'pipe',
            ],
          },
        );

      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let settled = false;

      child.stdout.on(
        'data',
        (chunk: Buffer) => {
          stdout +=
            chunk.toString();
        },
      );

      child.stderr.on(
        'data',
        (chunk: Buffer) => {
          stderr +=
            chunk.toString();
        },
      );

      child.on(
        'error',
        (error) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timer);
          reject(error);
        },
      );

      const timer =
        setTimeout(
          () => {
            timedOut = true;

            child.kill(
              'SIGTERM',
            );

            setTimeout(
              () => {
                if (
                  child.exitCode === null
                ) {
                  child.kill(
                    'SIGKILL',
                  );
                }
              },
              5_000,
            ).unref();
          },
          timeoutMs,
        );

      child.on(
        'close',
        (code) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timer);

          resolve({
            exitCode:
              code ?? 1,
            stdout,
            stderr,
            timedOut,
            durationMs:
              Date.now() -
              startedAt,
          });
        },
      );
    },
  );
}
