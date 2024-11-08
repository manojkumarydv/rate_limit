import express from 'express';
import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { processTask } from './controllers/taskController.js';
import { rateLimitTask } from './utils/rateLimiter.js';

const app = express();
const port = 3000;

if (cluster.isPrimary) {

  const numCPUs = cpus().length;
  console.log(`Master ${process.pid} is running`);
  console.log(`Master ${process.pid} is waiting for ${numCPUs} workers...\n`);
  
  // Fork a worker for each CPU core available
  for(let i = 0; i < numCPUs; i++){
    console.log(`Forking worker ${i + 1}/${numCPUs}\n`);
    cluster.fork();
  }

} else {

  app.use(express.json());

  console.log(`Worker.... ${process.pid} started`);

  app.post('/api/v1/task', async (req, res) => {

    const { user_id } = req.body;
    console.log('user id....', user_id);
    console.log('Received POST request on /api/v1/task');

    if(!user_id){
      console.log('Error: user_id is missing in request');
      return res.status(400).json({ error: 'user_id is required' });
    }

    try {
      const result = await rateLimitTask(user_id);
      console.log(`Rate limiting result for user_id ${user_id}:`, result);

      if (result.queued) {
        console.log(`Task for user_id ${user_id} queued due to rate limit`);
        return res.status(429).json({ error: 'Rate limit exceeded. Task is queued.' });
      }

      console.log(`Task for user_id ${user_id} passed rate limit, processing task`);
      await processTask(user_id);
      console.log(`Task for user_id ${user_id} completed`);

      res.status(200).json({ message: 'Task completed' });
    } catch (err) {
      console.error(`Error processing task for user_id ${user_id}:`, err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.listen(port, () => {
    console.log(`Worker ${process.pid} listening at http://localhost:${port}`);
  });
}
