/**
 * Instagram API Client
 * מטפל בכל האינטראקציות עם Instagram Graph API
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';

class InstagramAPI {
  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.baseURL = 'https://graph.facebook.com/v18.0';
    
    // Rate limiting
    this.rateLimitRemaining = parseInt(process.env.API_RATE_LIMIT) || 200;
    this.rateLimitWindow = parseInt(process.env.API_RATE_WINDOW) || 3600000;
    
    if (!this.accessToken || !this.businessAccountId) {
      logger.error('Instagram API credentials missing!');
      throw new Error('INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID are required');
    }
    
    logger.info('Instagram API initialized', { businessAccountId: this.businessAccountId });
  }

  /**
   * בדיקה בסיסית - האם ה-API עובד
   */
  async healthCheck() {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.businessAccountId}`,
        {
          params: {
            fields: 'id,username',
            access_token: this.accessToken
          }
        }
      );
      
      logger.info('Instagram API health check passed', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('Instagram API health check failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * חיפוש סטורי של משתמש ספציפי
   * @param {string} username - שם משתמש באינסטגרם (ללא @)
   * @param {string} businessHandle - הנדל של העסק שצריך להיות מתויג
   */
  async searchUserStory(username, businessHandle) {
    try {
      logger.info('Searching for story', { username, businessHandle });
      
      // נסה למצוא את המשתמש באינסטגרם
      const userSearch = await this.searchInstagramUser(username);
      
      if (!userSearch.found) {
        return {
          found: false,
          reason: 'user_not_found',
          message: `משתמש @${username} לא נמצא באינסטגרם`
        };
      }

      // בדוק אם יש לו סטורי פעיל
      const stories = await this.getUserStories(userSearch.userId);
      
      if (!stories || stories.length === 0) {
        return {
          found: false,
          reason: 'no_stories',
          message: `למשתמש @${username} אין סטוריז פעילים כרגע`
        };
      }

      // בדוק אם יש סטורי שמתייג את העסק
      const taggedStory = await this.findStoryWithTag(stories, businessHandle);
      
      if (!taggedStory) {
        return {
          found: true,
          tagged: false,
          reason: 'not_tagged',
          message: `נמצא סטורי אבל לא מתייג את @${businessHandle}`
        };
      }

      // מצאנו! עכשיו תספור צפיות
      const views = await this.getStoryViews(taggedStory.id);

      return {
        found: true,
        tagged: true,
        storyId: taggedStory.id,
        views: views,
        timestamp: taggedStory.timestamp,
        url: taggedStory.url || null
      };

    } catch (error) {
      logger.error('Error searching user story', { 
        username, 
        businessHandle, 
        error: error.message 
      });
      
      return {
        found: false,
        error: true,
        message: error.message
      };
    }
  }

  /**
   * חיפוש משתמש אינסטגרם לפי username
   */
  async searchInstagramUser(username) {
    try {
      // Instagram Graph API doesn't have direct user search
      // בפועל, נצטרך לעבוד עם Instagram Business Discovery API
      // או לשמור mapping של usernames ל-Instagram IDs
      
      // לצורך demo, נחזיר מבנה בסיסי
      logger.warn('User search not fully implemented', { username });
      
      return {
        found: false,
        reason: 'search_not_implemented',
        message: 'חיפוש משתמשים דורש הרשאות נוספות'
      };
      
    } catch (error) {
      logger.error('Error searching Instagram user', { username, error: error.message });
      throw error;
    }
  }

  /**
   * קבלת סטוריז של משתמש
   */
  async getUserStories(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${userId}/stories`,
        {
          params: {
            fields: 'id,media_type,media_url,timestamp,permalink',
            access_token: this.accessToken
          }
        }
      );

      return response.data.data || [];
      
    } catch (error) {
      if (error.response?.status === 404) {
        logger.info('No stories found for user', { userId });
        return [];
      }
      
      logger.error('Error getting user stories', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * בדיקה האם סטורי מתייג עסק ספציפי
   */
  async findStoryWithTag(stories, businessHandle) {
    for (const story of stories) {
      try {
        // בדוק אם יש mentions בסטורי
        const mentions = await this.getStoryMentions(story.id);
        
        if (mentions.some(m => m.username === businessHandle.replace('@', ''))) {
          return story;
        }
      } catch (error) {
        logger.warn('Error checking story mentions', { storyId: story.id });
      }
    }
    
    return null;
  }

  /**
   * קבלת mentions של סטורי
   */
  async getStoryMentions(storyId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${storyId}`,
        {
          params: {
            fields: 'mentions{username}',
            access_token: this.accessToken
          }
        }
      );

      return response.data.mentions?.data || [];
      
    } catch (error) {
      logger.error('Error getting story mentions', { storyId, error: error.message });
      return [];
    }
  }

  /**
   * קבלת מספר צפיות של סטורי
   */
  async getStoryViews(storyId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${storyId}/insights`,
        {
          params: {
            metric: 'impressions,reach',
            access_token: this.accessToken
          }
        }
      );

      const impressions = response.data.data?.find(m => m.name === 'impressions');
      return impressions?.values[0]?.value || 0;
      
    } catch (error) {
      logger.warn('Could not get story views', { storyId, error: error.message });
      return 0;
    }
  }

  /**
   * בדיקה האם סטורי עדיין קיים
   */
  async checkStoryExists(storyId) {
    try {
      await axios.get(
        `${this.baseURL}/${storyId}`,
        {
          params: {
            fields: 'id',
            access_token: this.accessToken
          }
        }
      );

      return true;
      
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      
      throw error;
    }
  }

  /**
   * קבלת כל הסטוריז של העסק (למי שמזכיר אותו)
   */
  async getBusinessMentions() {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.businessAccountId}/stories`,
        {
          params: {
            fields: 'id,media_type,timestamp,mentions{username}',
            access_token: this.accessToken
          }
        }
      );

      return response.data.data || [];
      
    } catch (error) {
      logger.error('Error getting business mentions', { error: error.message });
      return [];
    }
  }
}

export default InstagramAPI;
