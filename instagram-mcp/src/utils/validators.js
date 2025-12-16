/**
 * Validators Utility
 * פונקציות validation לבדיקת נתונים
 */

import { logger } from './logger.js';

/**
 * בדיקה האם username תקין
 */
export function validateUsername(username) {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  const cleanUsername = username.replace('@', '').trim();

  if (cleanUsername.length < 1 || cleanUsername.length > 30) {
    return { valid: false, error: 'Username must be 1-30 characters' };
  }

  if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
    return { valid: false, error: 'Username can only contain letters, numbers, dots and underscores' };
  }

  return { valid: true, username: cleanUsername };
}

/**
 * בדיקה האם business handle תקין
 */
export function validateBusinessHandle(handle) {
  if (!handle) {
    return { valid: false, error: 'Business handle is required' };
  }

  const cleanHandle = handle.replace('@', '').trim();

  if (cleanHandle.length < 1 || cleanHandle.length > 30) {
    return { valid: false, error: 'Handle must be 1-30 characters' };
  }

  if (!/^[a-zA-Z0-9._]+$/.test(cleanHandle)) {
    return { valid: false, error: 'Handle can only contain letters, numbers, dots and underscores' };
  }

  return { valid: true, handle: cleanHandle };
}

/**
 * בדיקה האם UUID תקין
 */
export function validateUUID(uuid) {
  if (!uuid) {
    return { valid: false, error: 'UUID is required' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' };
  }

  return { valid: true, uuid };
}

/**
 * בדיקה האם timeframe תקין
 */
export function validateTimeframe(timeframe) {
  const validTimeframes = ['all', 'today', 'week', 'month'];

  if (!validTimeframes.includes(timeframe)) {
    return { 
      valid: false, 
      error: `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}` 
    };
  }

  return { valid: true, timeframe };
}

/**
 * בדיקה האם מספר הצפיות הגיוני
 */
export function validateViews(views) {
  if (typeof views !== 'number') {
    return { valid: false, error: 'Views must be a number' };
  }

  if (views < 0) {
    return { valid: false, error: 'Views cannot be negative' };
  }

  if (views > 1000000000) {
    return { valid: false, error: 'Views seems unrealistic' };
  }

  return { valid: true, views };
}

/**
 * בדיקה האם confidence score תקין
 */
export function validateConfidence(confidence) {
  if (typeof confidence !== 'number') {
    return { valid: false, error: 'Confidence must be a number' };
  }

  if (confidence < 0 || confidence > 100) {
    return { valid: false, error: 'Confidence must be between 0 and 100' };
  }

  return { valid: true, confidence };
}

/**
 * וידוא שכל הפרמטרים הנדרשים קיימים
 */
export function validateRequiredParams(params, required) {
  const missing = [];

  for (const param of required) {
    if (params[param] === undefined || params[param] === null) {
      missing.push(param);
    }
  }

  if (missing.length > 0) {
    return { 
      valid: false, 
      error: `Missing required parameters: ${missing.join(', ')}` 
    };
  }

  return { valid: true };
}

/**
 * לוגר עבור validation errors
 */
export function logValidationError(functionName, error) {
  logger.error(`Validation failed in ${functionName}`, { error });
}
