/**
 * Analytics Tool
 * קבלת אנליטיקס ונתונים סטטיסטיים
 */

import { logger } from '../utils/logger.js';
import { validateUUID, validateTimeframe, logValidationError } from '../utils/validators.js';

export async function getStoryAnalytics(args, { supabase }) {
  const toolName = 'get_story_analytics';
  logger.action(`${toolName} called`, args);

  try {
    // Validation
    const { businessId, timeframe = 'all' } = args;
    
    const uuidValidation = validateUUID(businessId);
    if (!uuidValidation.valid) {
      logValidationError(toolName, uuidValidation.error);
      return {
        success: false,
        error: uuidValidation.error
      };
    }

    const timeframeValidation = validateTimeframe(timeframe);
    if (!timeframeValidation.valid) {
      logValidationError(toolName, timeframeValidation.error);
      return {
        success: false,
        error: timeframeValidation.error
      };
    }

    // Get business info
    const business = await supabase.getBusinessById(businessId);
    
    if (!business) {
      return {
        success: false,
        error: `Business ${businessId} not found`
      };
    }

    // Get analytics
    const analytics = await supabase.getBusinessAnalytics(businessId, timeframe);

    // Calculate ROI (assuming each story costs something)
    const estimatedCostPerStory = 30; // ש"ח - זה ישתנה לפי המודל העסקי
    const totalCost = analytics.totalStories * estimatedCostPerStory;
    const viewsPerShekel = totalCost > 0 ? (analytics.totalViews / totalCost).toFixed(2) : 0;

    logger.success('Analytics retrieved', {
      businessId,
      businessName: business.business_name,
      timeframe,
      totalStories: analytics.totalStories,
      totalViews: analytics.totalViews
    });

    return {
      success: true,
      business: {
        id: business.business_id,
        name: business.business_name,
        instagram: business.instagram_handle,
        location: business.location
      },
      timeframe: timeframe,
      stats: {
        totalStories: analytics.totalStories,
        totalViews: analytics.totalViews,
        avgViewsPerStory: analytics.avgViews,
        estimatedCost: totalCost,
        viewsPerShekel: parseFloat(viewsPerShekel),
        roi: {
          totalInvestment: totalCost,
          totalReach: analytics.totalViews,
          efficiency: `${viewsPerShekel} צפיות לכל שקל`
        }
      },
      recentSubmissions: analytics.submissions.slice(0, 10).map(s => ({
        username: s.username,
        views: s.views_count,
        createdAt: s.created_at,
        verifiedAt: s.verified_at
      })),
      message: `📊 ${business.business_name}: ${analytics.totalStories} סטוריז, ${analytics.totalViews} צפיות${timeframe !== 'all' ? ` (${timeframe})` : ''}`
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
 * Get All Businesses Tool
 */
export async function getAllBusinesses(args, { supabase }) {
  const toolName = 'get_all_businesses';
  logger.action(`${toolName} called`);

  try {
    const businesses = await supabase.getAllBusinesses();

    logger.info(`Found ${businesses.length} businesses`);

    return {
      success: true,
      count: businesses.length,
      businesses: businesses.map(b => ({
        id: b.business_id,
        name: b.business_name,
        instagram: b.instagram_handle,
        location: b.location,
        category: b.category,
        status: b.status
      })),
      message: `נמצאו ${businesses.length} עסקים פעילים`
    };

  } catch (error) {
    logger.error(`${toolName} failed`, { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search Instagram Story Tool
 */
export async function searchInstagramStory(args, { supabase, instagram }) {
  const toolName = 'search_instagram_story';
  logger.action(`${toolName} called`, args);

  try {
    const { username, businessHandle } = args;

    if (!username || !businessHandle) {
      return {
        success: false,
        error: 'username and businessHandle are required'
      };
    }

    logger.info('Searching Instagram for story', { username, businessHandle });

    // Search for the story
    const result = await instagram.searchUserStory(username, businessHandle);

    if (result.found && result.tagged) {
      return {
        success: true,
        found: true,
        tagged: true,
        story: {
          id: result.storyId,
          views: result.views,
          timestamp: result.timestamp,
          url: result.url
        },
        message: `✅ נמצא סטורי של @${username} שמתייג את @${businessHandle} עם ${result.views} צפיות`
      };
    } else if (result.found && !result.tagged) {
      return {
        success: true,
        found: true,
        tagged: false,
        reason: result.reason,
        message: `⚠️  נמצא סטורי של @${username} אבל לא מתייג את @${businessHandle}`
      };
    } else {
      return {
        success: true,
        found: false,
        reason: result.reason,
        message: `❌ לא נמצא סטורי של @${username} שמתייג את @${businessHandle}`
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
