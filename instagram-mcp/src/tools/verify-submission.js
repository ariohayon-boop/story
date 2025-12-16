/**
 * Verify Submission Tool
 * אישור ידני של submission
 */

import { logger } from '../utils/logger.js';
import { validateUUID, validateConfidence, logValidationError } from '../utils/validators.js';

export async function verifySubmission(args, { supabase }) {
  const toolName = 'verify_submission';
  logger.action(`${toolName} called`, args);

  try {
    // Validation
    const { submissionId, views = 0, confidence = 100, storyUrl = null } = args;
    
    const uuidValidation = validateUUID(submissionId);
    if (!uuidValidation.valid) {
      logValidationError(toolName, uuidValidation.error);
      return {
        success: false,
        error: uuidValidation.error
      };
    }

    const confidenceValidation = validateConfidence(confidence);
    if (!confidenceValidation.valid) {
      logValidationError(toolName, confidenceValidation.error);
      return {
        success: false,
        error: confidenceValidation.error
      };
    }

    // Get submission to check if exists
    const submission = await supabase.getSubmission(submissionId);
    
    if (!submission) {
      return {
        success: false,
        error: `Submission ${submissionId} not found`
      };
    }

    // Verify the submission
    const result = await supabase.verifySubmission(
      submissionId,
      views,
      storyUrl,
      confidence
    );

    logger.success('Submission manually verified', {
      submissionId,
      username: submission.username,
      views,
      confidence
    });

    return {
      success: true,
      status: 'verified',
      submission: result,
      message: `✅ Submission verified for @${submission.username} with ${views} views`
    };

  } catch (error) {
    logger.error(`${toolName} failed`, { error: error.message, args });
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reject Submission Tool
 * דחיית submission
 */
export async function rejectSubmission(args, { supabase }) {
  const toolName = 'reject_submission';
  logger.action(`${toolName} called`, args);

  try {
    // Validation
    const { submissionId, reason = null } = args;
    
    const uuidValidation = validateUUID(submissionId);
    if (!uuidValidation.valid) {
      logValidationError(toolName, uuidValidation.error);
      return {
        success: false,
        error: uuidValidation.error
      };
    }

    // Get submission to check if exists
    const submission = await supabase.getSubmission(submissionId);
    
    if (!submission) {
      return {
        success: false,
        error: `Submission ${submissionId} not found`
      };
    }

    // Reject the submission
    const result = await supabase.rejectSubmission(submissionId, reason);

    logger.alert('Submission rejected', {
      submissionId,
      username: submission.username,
      reason
    });

    return {
      success: true,
      status: 'rejected',
      submission: result,
      reason,
      message: `❌ Submission rejected for @${submission.username}${reason ? `: ${reason}` : ''}`
    };

  } catch (error) {
    logger.error(`${toolName} failed`, { error: error.message, args });
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Pending Submissions Tool
 * קבלת רשימת submissions שממתינים לאימות
 */
export async function getPendingSubmissions(args, { supabase }) {
  const toolName = 'get_pending_submissions';
  logger.action(`${toolName} called`, args);

  try {
    const { businessId = null } = args;

    // If businessId provided, validate it
    if (businessId) {
      const uuidValidation = validateUUID(businessId);
      if (!uuidValidation.valid) {
        logValidationError(toolName, uuidValidation.error);
        return {
          success: false,
          error: uuidValidation.error
        };
      }
    }

    // Get pending submissions
    const submissions = await supabase.getPendingSubmissions(businessId);

    logger.info(`Found ${submissions.length} pending submissions`, { businessId });

    // Enrich with business info
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const business = await supabase.getBusinessById(sub.business_id);
        return {
          ...sub,
          business_name: business?.business_name,
          business_instagram: business?.instagram_handle
        };
      })
    );

    return {
      success: true,
      count: enrichedSubmissions.length,
      submissions: enrichedSubmissions,
      message: `נמצאו ${enrichedSubmissions.length} submissions ממתינים לאימות`
    };

  } catch (error) {
    logger.error(`${toolName} failed`, { error: error.message, args });
    return {
      success: false,
      error: error.message
    };
  }
}
