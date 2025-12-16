/**
 * Logger Utility
 * מערכת logging מקצועית עם Winston
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// יצירת תיקיית logs אם לא קיימת
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// פורמט מותאם אישית
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// יצירת Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Console output עם צבעים
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  ]
});

// הוספת file transport אם מופעל
if (process.env.LOG_TO_FILE === 'true') {
  const logFilePath = process.env.LOG_FILE_PATH || path.join(logsDir, 'mcp-server.log');
  
  logger.add(
    new winston.transports.File({
      filename: logFilePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
  
  logger.info('File logging enabled', { logFilePath });
}

// פונקציות עזר נוספות
logger.success = (message, meta = {}) => {
  logger.info(`✅ ${message}`, meta);
};

logger.action = (message, meta = {}) => {
  logger.info(`🔄 ${message}`, meta);
};

logger.alert = (message, meta = {}) => {
  logger.warn(`⚠️  ${message}`, meta);
};

export { logger };
