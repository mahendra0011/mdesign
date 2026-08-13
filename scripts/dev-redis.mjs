import net from 'node:net';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const PORT = 6379;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

const candidates = [
  'C:\\Program Files\\Redis\\redis-server.exe',
  'C:\\Program Files\\Memurai\\memurai.exe',
  path.join(os.homedir(), 'scoop', 'apps', 'redis', 'current', 'redis-server.exe'),
  'C:\\tools\\redis\\redis-server.exe',
];

async function findRedisServer() {
  for (const candidate of candidates) {
    try {
      await import('node:fs/promises').then((fs) => fs.access(candidate));
      return candidate;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

if (await isPortOpen(PORT)) {
  console.log(`[redis] already running on port ${PORT}`);
} else {
  const redisServer = await findRedisServer();
  if (!redisServer) {
    console.error(
      '[redis] redis-server.exe not found — install Redis (winget install Redis.Redis) or start it manually'
    );
  } else {
    const child = spawn(redisServer, [], { detached: true, stdio: 'ignore' });
    child.unref();
    console.log(`[redis] starting ${redisServer}`);
  }
}

const startedAt = Date.now();
while (!(await isPortOpen(PORT))) {
  if (Date.now() - startedAt > 30000) {
    console.error('[redis] failed to start within 30s');
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
console.log(`[redis] ready on port ${PORT}`);

setInterval(async () => {
  if (!(await isPortOpen(PORT))) {
    console.warn('[redis] server went down — restarting...');
    const redisServer = await findRedisServer();
    if (redisServer) {
      const child = spawn(redisServer, [], { detached: true, stdio: 'ignore' });
      child.unref();
    }
  }
}, 5000);
