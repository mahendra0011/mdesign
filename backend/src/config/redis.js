import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: null });

export const redisSub = new Redis(env.redisUrl, { maxRetriesPerRequest: null });

const SOCKET_CHANNEL = 'mdesign:socket-events';
const IMAGE_CHANNEL = 'mdesign:image-events';
const USER_CHANNEL = 'mdesign:user-events';

export const channels = { SOCKET_CHANNEL, IMAGE_CHANNEL, USER_CHANNEL };

export function publishSocketEvent(projectId, event, data) {
  return redis.publish(SOCKET_CHANNEL, JSON.stringify({ projectId, event, data }));
}

export function subscribeSocketEvents(handler) {
  redisSub.subscribe(SOCKET_CHANNEL);
  redisSub.on('message', (channel, message) => {
    if (channel === SOCKET_CHANNEL) handler(JSON.parse(message));
  });
}

export function publishImageEvent(projectId, data) {
  return redis.publish(IMAGE_CHANNEL, JSON.stringify({ projectId, data }));
}

export function subscribeImageEvents(handler) {
  redisSub.subscribe(IMAGE_CHANNEL);
  redisSub.on('message', (channel, message) => {
    if (channel === IMAGE_CHANNEL) handler(JSON.parse(message));
  });
}

export function publishUserEvent(userId, event, data) {
  return redis.publish(USER_CHANNEL, JSON.stringify({ userId, event, data }));
}

export function subscribeUserEvents(handler) {
  redisSub.subscribe(USER_CHANNEL);
  redisSub.on('message', (channel, message) => {
    if (channel === USER_CHANNEL) handler(JSON.parse(message));
  });
}