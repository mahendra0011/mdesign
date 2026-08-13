import { env } from '../config/env.js';
import { registerQueue, startWorkers } from '../services/queue.service.js';
import { processPlanJob } from '../services/planning.service.js';
import { processImageJob } from '../services/imageGen.service.js';
import { processDesignJob } from '../services/designGen.service.js';
import { processExportJob } from '../services/export.service.js';
import { processAnalysisJob } from '../services/analysis.service.js';
import { markProjectFailed } from '../services/orchestrator.service.js';

function withFailureHandler(queueName, handler) {
  return async (payload) => {
    try {
      await handler(payload);
    } catch (err) {
      const projectId = payload?.projectId;
      if (projectId && ['planning', 'image-gen', 'design-gen'].includes(queueName)) {
        await markProjectFailed(projectId, err.message);
      }
      throw err;
    }
  };
}

export function registerWorkers() {
  registerQueue('planning', withFailureHandler('planning', processPlanJob), 1);
  const imageConcurrency = env.imageGenMode === 'parallel' ? env.imageConcurrency : 1;
  registerQueue('image-gen', withFailureHandler('image-gen', processImageJob), imageConcurrency);
  registerQueue('design-gen', withFailureHandler('design-gen', processDesignJob), 1);
  registerQueue('export', withFailureHandler('export', processExportJob), 1);
  registerQueue('design-analysis', processAnalysisJob, 2);
}

export function startInProcessWorkers() {
  registerWorkers();
  startWorkers();
}