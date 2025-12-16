/**
 * Check Story Tool
 * בודק את סטטוס הסטורי של submission
 */

import { logger } from '../utils/logger.js';
import { validateUUID, logValidationError } from '../utils/validators.js';

export async function checkStoryStatus(args, { supabase, instagram }) {
  const toolName = 'check_story_status';
  logger.action(`${toolName} called`, args);

  try {
    // Validation
    const { submissionId } = args;
    
    const uuidValidation = validateUUID(submissionId);
    if (!uuidValidation.valid) {
      logValidationError(toolName, uuidValidation.error);
      return {
        success: false,
        error: uuidValidation.error
      };
    }

    // Get submission from database
    const submission = await supabase.getSubmission(submissionId);
    
    if (!submission) {
      return {
        success: false,
        error: `Submission ${submissionId} not found`
      };
    }

    // Get business details
    const business = await supabase.getBusinessById(submission.business_id);
    
    if (!business) {
      return {
        success: false,
        error: `Business for submission not found`
      };
    }

    // Search for the story on Instagram
    logger.info('Searching for story on Instagram', {
      username: submission.username,
      businessHandle: business.instagram_handle
    });

    const storyResult = await instagram.searchUserStory(
      submission.username,
      business.instagram_handle
    );

    // Update submission based on result
    let updateResult;
    
    if (storyResult.found && storyResult.tagged) {
      // Story found and tagged correctly - VERIFY
      updateResult = await supabase.verifySubmission(
        submissionId,
        storyResult.views,
        storyResult.url,
        95
      );

      logger.success('Story verified', {
        submissionId,
        views: storyResult.views,
        username: submission.username
      });

      return {
        success: true,
        status: 'verified',
        exists: true,
        views: storyResult.views,
        tagged_correctly: true,
        business_handle: business.instagram_handle,
        story_url: storyResult.url,
        timestamp: storyResult.timestamp,
        message: `✅ סטורי נמצא ומאומת! ${storyResult.views} צפיות`
      };

    } else if (storyResult.found && !storyResult.tagged) {
      // Story found but not tagged correctly - REJECT
      updateResult = await supabase.rejectSubmission(
        submissionId,
        'Story found but business not tagged'
      );

      logger.alert('Story found but not tagged', {
        submissionId,
        username: submission.username
      });

      return {
        success: true,
        status: 'rejected',
        exists: true,
        views: 0,
        tagged_correctly: false,
        business_handle: business.instagram_handle,
        reason: 'not_tagged',
        message: `❌ סטורי נמצא אבל לא מתייג את @${business.instagram_handle}`
      };

    } else {
      // Story not found - keep as pending
      await supabase.updateSubmission(submissionId, {});

      logger.info('Story not found yet', {
        submissionId,
        username: submission.username,
        reason: storyResult.reason
      });

      return {
        success: true,
        status: 'pending',
        exists: false,
        views: 0,
        tagged_correctly: false,
        business_handle: business.instagram_handle,
        reason: storyResult.reason,
        message: `⏳ סטורי עדיין לא נמצא. נבדוק שוב בקרוב.`
      };
    }

  } catch (error) {
    logger.error(`${toolName} failed`, { error: error.message, args });
    return {
      success: false,
      error: error.message
    };
  }
}
