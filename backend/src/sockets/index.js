import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis, redisSub, subscribeSocketEvents, subscribeImageEvents, subscribeUserEvents } from '../config/redis.js';
import { authFromSocketHandshake } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const ROOM_PREFIX = 'project:';
const imageBuffers = new Map();

function flushImageBuffer(io, projectId) {
  const buff = imageBuffers.get(projectId);
  if (!buff) return;
  let flooded = false;
  while (buff.pending.has(buff.next)) {
    const data = buff.pending.get(buff.next);
    buff.pending.delete(buff.next);
    io.to(`${ROOM_PREFIX}${projectId}`).emit('image_status', { ...data, index: buff.next });
    buff.next += 1;
    flooded = true;
  }
  if (flooded && buff.pending.size === 0) imageBuffers.delete(projectId);
}

function handleImageEvent(io, { projectId, data }) {
  if (!projectId || !data || typeof data.index !== 'number') return;
  let buff = imageBuffers.get(projectId);
  if (!buff) {
    buff = { next: 0, pending: new Map() };
    imageBuffers.set(projectId, buff);
  }
  if (data.index < buff.next) {
    io.to(`${ROOM_PREFIX}${projectId}`).emit('image_status', data);
    return;
  }
  buff.pending.set(data.index, data);
  flushImageBuffer(io, projectId);
}

export function attachSocketGateway(httpServer, { corsOrigin }) {
  const io = new Server(httpServer, { cors: { origin: corsOrigin, credentials: true } });

  io.adapter(createAdapter(redis, redisSub));

  io.use(async (socket, next) => {
    try {
      const { user } = await authFromSocketHandshake(socket.handshake);
      socket.user = user;
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    logger.info(`socket connected: ${socket.id} (user ${socket.user?._id})`);

    socket.on('join_project', (payload, ack) => {
      const projectId = typeof payload === 'string' ? payload : payload?.projectId;
      if (!projectId || typeof projectId !== 'string') return;
      socket.join(`${ROOM_PREFIX}${projectId}`);
      logger.info(`socket ${socket.id} joined room ${ROOM_PREFIX}${projectId}`);
      ack?.({ ok: true });
    });

    socket.on('join_user', (payload, ack) => {
      const userId = typeof payload === 'string' ? payload : payload?.userId;
      if (!userId || typeof userId !== 'string') return;
      socket.join(`user:${userId}`);
      logger.info(`socket ${socket.id} joined user room user:${userId}`);
      ack?.({ ok: true });
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`${ROOM_PREFIX}${projectId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`socket disconnected: ${socket.id}`);
    });
  });

  subscribeSocketEvents(({ projectId, event, data }) => {
    io.to(`${ROOM_PREFIX}${projectId}`).emit(event, data);
  });

  subscribeImageEvents(({ projectId, data }) => {
    handleImageEvent(io, { projectId, data });
  });

  subscribeUserEvents(({ userId, event, data }) => {
    io.to(`user:${userId}`).emit(event, data);
  });

  logger.info('socket.io gateway attached');
  return io;
}