import fs from 'fs';

// Function to process task (log user_id and timestamp to file)
export const processTask = async (user_id) => {
  const logMessage = `${user_id} - Task completed at ${new Date().toISOString()}\n`;
  console.log('Task processing started for user_id:', user_id);  // Log start of processing
  console.log('Generated log message:', logMessage);  // Log generated message

  // Append to the task log file
  fs.appendFile('task-log.txt', logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);  // Log if there's an error
    } else {
      console.log('Log message successfully written to file.');  // Log success message
    }
  });
};
