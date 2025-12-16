/**
 * Automation Module
 * תהליך רקע שרץ כל 5 דקות ובודק submissions
 */

import { logger } from './utils/logger.js';

class AutomationEngine {
  constructor(supabase, instagram) {
    this.supabase = supabase;
    this.instagram = instagram;
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = parseInt(process.env.CHECK_INTERVAL) || 300000; // 5 minutes
    this.stats = {
      totalRuns: 0,
      totalChecked: 0,
      totalVerified: 0,
      totalRejected: 0,
      lastRun: null
    };
  }

  /**
   * התחלת האוטומציה
   */
  start() {
    if (this.isRunning) {
      logger.warn('Automation already running');
      return;
    }

    this.isRunning = true;
    logger.success('🤖 Automation engine started', {
      intervalMinutes: this.checkInterval / 60000
    });

    // Run immediately
    this.runCheck();

    // Then schedule regular checks
    this.intervalId = setInterval(() => {
      this.runCheck();
    }, this.checkInterval);
  }

  /**
   * עצירת האוטומציה
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Automation not running');
      return;
    }

    clearInterval(this.intervalId);
    this.isRunning = false;
    logger.info('Automation engine stopped');
  }

  /**
   * הרצת בדיקה של כל ה-submissions הממתינים
   */
  async runCheck() {
    this.stats.totalRuns++;
    this.stats.lastRun = new Date().toISOString();

    logger.action(`🔄 Running automation check #${this.stats.totalRuns}`);

    try {
      // Get all pending submissions
      const pending = await this.supabase.getPendingSubmissions();

      if (pending.length === 0) {
        logger.info('No pending submissions to check');
        return;
      }

      logger.info(`Checking ${pending.length} pending submissions`);

      const results = {
        checked: 0,
        verified: 0,
        rejected: 0,
        errors: 0,
        stillPending: 0
      };

      // Check each submission
      for (const submission of pending) {
        try {
          await this.checkSubmission(submission, results);
          results.checked++;
          this.stats.totalChecked++;

          // Small delay to avoid rate limits
          await this.delay(1000);

        } catch (error) {
          logger.error('Error checking submission', {
            submissionId: submission.id,
            error: error.message
          });
          results.errors++;
        }
      }

      // Log summary
      logger.success(`✅ Check completed`, {
        checked: results.checked,
        verified: results.verified,
        rejected: results.rejected,
        stillPending: results.stillPending,
        errors: results.errors
      });

      this.stats.totalVerified += results.verified;
      this.stats.totalRejected += results.rejected;

    } catch (error) {
      logger.error('Automation check failed', { error: error.message });
    }
  }

  /**
   * בדיקת submission בודד
   */
  async checkSubmission(submission, results) {
    // Check if submission is too old (24 hours)
    const hoursOld = (Date.now() - new Date(submission.created_at).getTime()) / (1000 * 60 * 60);
    
    if (hoursOld > 24) {
      // Mark for manual review if older than 24 hours
      await this.supabase.markForManualReview(
        submission.id,
        'Pending more than 24 hours'
      );
      
      logger.alert('Submission marked for manual review', {
        submissionId: submission.id,
        username: submission.username,
        hoursOld: Math.floor(hoursOld)
      });
      
      results.stillPending++;
      return;
    }

    // Get business info
    const business = await this.supabase.getBusinessById(submission.business_id);
    
    if (!business) {
      logger.error('Business not found for submission', {
        submissionId: submission.id,
        businessId: submission.business_id
      });
      results.errors++;
      return;
    }

    // Search for the story
    logger.info('Searching for story', {
      username: submission.username,
      businessHandle: business.instagram_handle
    });

    const storyResult = await this.instagram.searchUserStory(
      submission.username,
      business.instagram_handle
    );

    // Handle result
    if (storyResult.found && storyResult.tagged) {
      // Story found and tagged correctly - VERIFY
      await this.supabase.verifySubmission(
        submission.id,
        storyResult.views,
        storyResult.url,
        95
      );

      logger.success('✅ Auto-verified', {
        username: submission.username,
        businessName: business.business_name,
        views: storyResult.views
      });

      results.verified++;

    } else if (storyResult.found && !storyResult.tagged) {
      // Story found but not tagged - REJECT
      await this.supabase.rejectSubmission(
        submission.id,
        'Story found but business not tagged'
      );

      logger.alert('❌ Auto-rejected', {
        username: submission.username,
        businessName: business.business_name,
        reason: 'not_tagged'
      });

      results.rejected++;

    } else {
      // Story not found yet - keep as pending
      await this.supabase.updateSubmission(submission.id, {});

      logger.info('⏳ Still pending', {
        username: submission.username,
        businessName: business.business_name,
        reason: storyResult.reason
      });

      results.stillPending++;
    }
  }

  /**
   * המתנה (עבור rate limiting)
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * קבלת סטטיסטיקות
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      checkIntervalMinutes: this.checkInterval / 60000
    };
  }

  /**
   * איפוס סטטיסטיקות
   */
  resetStats() {
    this.stats = {
      totalRuns: 0,
      totalChecked: 0,
      totalVerified: 0,
      totalRejected: 0,
      lastRun: null
    };
    logger.info('Automation stats reset');
  }
}

export default AutomationEngine;
