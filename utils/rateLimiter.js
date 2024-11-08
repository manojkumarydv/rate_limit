import Bull from 'bull';

// Initialize Bull queue with rate limiting configuration
const taskQueue = new Bull('taskQueue', {
  limiter: {
    groupKey: 'user_id',
    max: 10,          // Max jobs per interval (e.g., 10 tasks per 60 seconds per user)
    duration: 60000,  // Time period in milliseconds (60 seconds)
  },
});

const rateLimitTask = async (user_id) => {
  console.log(`Attempting to add task to queue for user_id: ${user_id}`);  // Log attempt to add task

  try {
    const job = await taskQueue.add({ user_id });
    if (job) {
      console.log(`Task successfully added to queue for user_id: ${user_id}, job id: ${job.id}`);  // Log successful queueing
      return { queued: true };
    }
  } catch (error) {
    console.error('Error adding task to queue:', error);  // Log any errors
  }

  console.log(`Task could not be queued for user_id: ${user_id}`);  // Log if queuing fails
  return { queued: false };
};

// Log rate limit events
taskQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting in the queue`);
});

taskQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed: ${result}`);
});

taskQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed: ${err}`);
});

// Check queue job counts (waiting, completed, etc.)
const logQueueStatus = async () => {
  const jobCounts = await taskQueue.getJobCounts();
  console.log('Queue Job Counts:', jobCounts);
};

logQueueStatus();  // Log initial queue status

export { rateLimitTask };
