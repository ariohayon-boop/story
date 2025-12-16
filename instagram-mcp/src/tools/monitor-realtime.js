/**
 * Monitor Real-time Tool
 * ניטור בזמן אמת של submissions
 */

import { logger } from '../utils/logger.js';

export async function monitorSubmissionsRealtime(args, { supabase, instagram }) {
  const toolName = 'monitor_submissions_realtime';
  logger.action(`${toolName} called`, args);

  try {
    const { businessId = null, intervalMinutes = 5, maxIterations = 12 } = args;

    logger.info('Starting real-time monitoring', {
      businessId,
      intervalMinutes,
      maxIterations
    });

    const results = {
      startTime: new Date().toISOString(),
      businessId,
      iterations: [],
      summary: {
        totalChecked: 0,
        verified: 0,
        rejected: 0,
        stillPending: 0
      }
    };

    // Function to check all pending submissions
    async function checkPendingSubmissions() {
      const pending = await supabase.getPendingSubmissions(businessId);
      
      logger.info(`Checking ${pending.length} pending submissions`);

      const iterationResults = {
        timestamp: new Date().toISOString(),
        checked: pending.length,
        verified: 0,
        rejected: 0,
        errors: 0
      };

      for (const submission of pending) {
        try {
          // Get business info
          const business = await supabase.getBusinessById(submission.business_id);
          
          // Search for story
          const storyResult = await instagram.searchUserStory(
            submission.username,
            business.instagram_handle
          );

          if (storyResult.found && storyResult.tagged) {
            // Verify
            await supabase.verifySubmission(
              submission.id,
              storyResult.views,
              storyResult.url,
              95
            );
            iterationResults.verified++;
            results.summary.verified++;
            
            logger.success('Auto-verified', {
              username: submission.username,
              views: storyResult.views
            });

          } else if (storyResult.found && !storyResult.tagged) {
            // Reject
            await supabase.rejectSubmission(
              submission.id,
              'Story found but not tagged'
            );
            iterationResults.rejected++;
            results.summary.rejected++;
            
            logger.alert('Auto-rejected', {
              username: submission.username,
              reason: 'not_tagged'
            });

          } else {
            // Still pending
            await supabase.updateSubmission(submission.id, {});
            results.summary.stillPending++;
          }

        } catch (error) {
          logger.error('Error checking submission', {
            submissionId: submission.id,
            error: error.message
          });
          iterationResults.errors++;
        }

        results.summary.totalChecked++;
      }

      results.iterations.push(iterationResults);

      return iterationResults;
    }

    // Run first check immediately
    const firstCheck = await checkPendingSubmissions();
    
    logger.info('First check completed', firstCheck);

    // Return immediate results with promise to continue monitoring
    return {
      success: true,
      monitoring: true,
      firstCheck,
      config: {
        intervalMinutes,
        maxIterations,
        businessId
      },
      message: `🔄 ניטור התחיל. בדיקה ראשונה: ${firstCheck.verified} אומתו, ${firstCheck.rejected} נדחו, ${firstCheck.checked} נבדקו`
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
 * Check Stale Submissions Tool
 * בדיקת submissions שממתינים יותר מדי זמן
 */
export async function checkStaleSubmissions(args, { supabase }) {
  const toolName = 'check_stale_submissions';
  logger.action(`${toolName} called`, args);

  try {
    const { hoursThreshold = 24 } = args;

    const staleSubmissions = await supabase.getStaleSubmissions(hoursThreshold);

    logger.alert(`Found ${staleSubmissions.length} stale submissions`, { hoursThreshold });

    // Enrich with business info
    const enrichedSubmissions = await Promise.all(
      staleSubmissions.map(async (sub) => {
        const business = await supabase.getBusinessById(sub.business_id);
        const hoursPending = Math.floor(
          (Date.now() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60)
        );
        
        return {
          id: sub.id,
          username: sub.username,
          businessName: business?.business_name,
          businessInstagram: business?.instagram_handle,
          hoursPending,
          createdAt: sub.created_at
        };
      })
    );

    return {
      success: true,
      count: enrichedSubmissions.length,
      threshold: hoursThreshold,
      submissions: enrichedSubmissions,
      message: `⚠️  נמצאו ${enrichedSubmissions.length} submissions שממתינים יותר מ-${hoursThreshold} שעות`
    };

  } catch (error) {
    logger.error(`${toolName} failed`, { error: error.message, args });
    return {
      success: false,
      error: error.message
    };
  }
}
