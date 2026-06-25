import { execSync } from 'node:child_process';

/**
 * Free a TCP port by SIGTERM-ing any process listening on it.
 * No-op if nothing is bound (lsof exits non-zero).
 */
export function killPort(port: number): void {
  try {
    const output = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (!output) return;

    const pids = [...new Set(output.split('\n').map((s) => s.trim()).filter(Boolean))];
    for (const pidStr of pids) {
      const pid = parseInt(pidStr, 10);
      if (Number.isNaN(pid) || pid === process.pid) continue;
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        // Process may have already exited.
      }
    }

    if (pids.length > 0) {
      console.log(`Freed port ${port} (stopped ${pids.length} process${pids.length === 1 ? '' : 'es'})`);
    }
  } catch {
    // Port already free.
  }
}
