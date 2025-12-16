/**
 * Supabase Client
 * מטפל בכל האינטראקציות עם Supabase Database
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

class SupabaseClient {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Supabase credentials missing!');
      throw new Error('SUPABASE_URL and SUPABASE_KEY are required');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase client initialized');
  }

  /**
   * קבלת כל העסקים הפעילים
   */
  async getAllBusinesses() {
    try {
      const { data, error } = await this.client
        .from('businesses')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      logger.info(`Found ${data?.length || 0} active businesses`);
      return data || [];
      
    } catch (error) {
      logger.error('Error getting businesses', { error: error.message });
      throw error;
    }
  }

  /**
   * קבלת עסק ספציפי לפי ID
   */
  async getBusinessById(businessId) {
    try {
      const { data, error } = await this.client
        .from('businesses')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error) throw error;

      return data;
      
    } catch (error) {
      logger.error('Error getting business', { businessId, error: error.message });
      throw error;
    }
  }

  /**
   * קבלת כל ה-submissions הממתינים לאימות
   */
  async getPendingSubmissions(businessId = null) {
    try {
      let query = this.client
        .from('submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;

      if (error) throw error;

      logger.info(`Found ${data?.length || 0} pending submissions`, { businessId });
      return data || [];
      
    } catch (error) {
      logger.error('Error getting pending submissions', { error: error.message });
      throw error;
    }
  }

  /**
   * קבלת submission ספציפי
   */
  async getSubmission(submissionId) {
    try {
      const { data, error } = await this.client
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (error) throw error;

      return data;
      
    } catch (error) {
      logger.error('Error getting submission', { submissionId, error: error.message });
      throw error;
    }
  }

  /**
   * עדכון submission
   */
  async updateSubmission(submissionId, updates) {
    try {
      const { data, error } = await this.client
        .from('submissions')
        .update({
          ...updates,
          last_checked: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Submission updated', { submissionId, updates });
      return data;
      
    } catch (error) {
      logger.error('Error updating submission', { submissionId, error: error.message });
      throw error;
    }
  }

  /**
   * אימות submission (שינוי סטטוס ל-verified)
   */
  async verifySubmission(submissionId, views = 0, storyUrl = null, confidence = 100) {
    try {
      const updates = {
        status: 'verified',
        verified_at: new Date().toISOString(),
        ai_confidence: confidence,
        views_count: views
      };

      if (storyUrl) {
        updates.story_url = storyUrl;
      }

      const { data, error } = await this.client
        .from('submissions')
        .update(updates)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Submission verified', { submissionId, views, confidence });
      return data;
      
    } catch (error) {
      logger.error('Error verifying submission', { submissionId, error: error.message });
      throw error;
    }
  }

  /**
   * דחיית submission
   */
  async rejectSubmission(submissionId, reason = null) {
    try {
      const updates = {
        status: 'rejected',
        ai_confidence: 0
      };

      const { data, error } = await this.client
        .from('submissions')
        .update(updates)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Submission rejected', { submissionId, reason });
      return data;
      
    } catch (error) {
      logger.error('Error rejecting submission', { submissionId, error: error.message });
      throw error;
    }
  }

  /**
   * העברה לבדיקה ידנית
   */
  async markForManualReview(submissionId, reason = null) {
    try {
      const updates = {
        status: 'manual_review',
        ai_confidence: 0
      };

      const { data, error } = await this.client
        .from('submissions')
        .update(updates)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      logger.info('Submission marked for manual review', { submissionId, reason });
      return data;
      
    } catch (error) {
      logger.error('Error marking for manual review', { submissionId, error: error.message });
      throw error;
    }
  }

  /**
   * קבלת אנליטיקס של עסק
   */
  async getBusinessAnalytics(businessId, timeframe = 'all') {
    try {
      let query = this.client
        .from('submissions')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'verified');

      // סינון לפי timeframe
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate;

        switch (timeframe) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // חישוב סטטיסטיקות
      const totalStories = data?.length || 0;
      const totalViews = data?.reduce((sum, s) => sum + (s.views_count || 0), 0) || 0;
      const avgViews = totalStories > 0 ? Math.round(totalViews / totalStories) : 0;

      logger.info('Business analytics calculated', { businessId, timeframe, totalStories, totalViews });

      return {
        businessId,
        timeframe,
        totalStories,
        totalViews,
        avgViews,
        submissions: data || []
      };
      
    } catch (error) {
      logger.error('Error getting business analytics', { businessId, error: error.message });
      throw error;
    }
  }

  /**
   * קבלת כל ה-submissions שנמצאים בבדיקה יותר מ-X שעות
   */
  async getStaleSubmissions(hoursThreshold = 24) {
    try {
      const thresholdDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

      const { data, error } = await this.client
        .from('submissions')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', thresholdDate.toISOString());

      if (error) throw error;

      logger.info(`Found ${data?.length || 0} stale submissions (>${hoursThreshold}h)`);
      return data || [];
      
    } catch (error) {
      logger.error('Error getting stale submissions', { error: error.message });
      throw error;
    }
  }

  /**
   * בדיקת חיבור ל-Supabase
   */
  async healthCheck() {
    try {
      const { data, error } = await this.client
        .from('businesses')
        .select('count')
        .limit(1);

      if (error) throw error;

      logger.info('Supabase health check passed');
      return { success: true };
      
    } catch (error) {
      logger.error('Supabase health check failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

export default SupabaseClient;
