/**
 * STORIT Instagram MCP Server
 * Main entry point
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import InstagramAPI from './instagram-api.js';
import SupabaseClient from './supabase-client.js';
import AutomationEngine from './automation.js';

// Import tools
import { checkStoryStatus } from './tools/check-story.js';
import { 
  verifySubmission, 
  rejectSubmission, 
  getPendingSubmissions 
} from './tools/verify-submission.js';
import { 
  getStoryAnalytics, 
  getAllBusinesses, 
  searchInstagramStory 
} from './tools/get-analytics.js';
import { 
  monitorSubmissionsRealtime, 
  checkStaleSubmissions 
} from './tools/monitor-realtime.js';

// Load environment variables
dotenv.config();

// Initialize server
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'storit-instagram-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize clients
let instagram;
let supabase;
let automation;

try {
  instagram = new InstagramAPI();
  supabase = new SupabaseClient();
  automation = new AutomationEngine(supabase, instagram);
  
  logger.success('All clients initialized successfully');
} catch (error) {
  logger.error('Failed to initialize clients', { error: error.message });
  process.exit(1);
}

// Tool definitions
const TOOLS = [
  {
    name: 'check_story_status',
    description: 'בדוק סטטוס של סטורי ספציפי - האם קיים, מתויג נכון, כמה צפיות',
    inputSchema: {
      type: 'object',
      properties: {
        submissionId: {
          type: 'string',
          description: 'UUID של ה-submission שרוצים לבדוק',
        },
      },
      required: ['submissionId'],
    },
  },
  {
    name: 'verify_submission',
    description: 'אשר submission באופן ידני (שימוש לבדיקות ידניות)',
    inputSchema: {
      type: 'object',
      properties: {
        submissionId: {
          type: 'string',
          description: 'UUID של ה-submission',
        },
        views: {
          type: 'number',
          description: 'מספר צפיות (אופציונלי)',
          default: 0,
        },
        confidence: {
          type: 'number',
          description: 'רמת ביטחון (0-100)',
          default: 100,
        },
        storyUrl: {
          type: 'string',
          description: 'URL של הסטורי (אופציונלי)',
        },
      },
      required: ['submissionId'],
    },
  },
  {
    name: 'reject_submission',
    description: 'דחה submission באופן ידני',
    inputSchema: {
      type: 'object',
      properties: {
        submissionId: {
          type: 'string',
          description: 'UUID של ה-submission',
        },
        reason: {
          type: 'string',
          description: 'סיבת הדחייה (אופציונלי)',
        },
      },
      required: ['submissionId'],
    },
  },
  {
    name: 'get_pending_submissions',
    description: 'קבל רשימה של כל ה-submissions שממתינים לאימות',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: {
          type: 'string',
          description: 'UUID של עסק ספציפי (אופציונלי - ללא זה מחזיר את כולם)',
        },
      },
    },
  },
  {
    name: 'get_story_analytics',
    description: 'קבל אנליטיקס מפורט של עסק - סטוריז, צפיות, ROI',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: {
          type: 'string',
          description: 'UUID של העסק',
        },
        timeframe: {
          type: 'string',
          description: 'מסגרת זמן: all, today, week, month',
          enum: ['all', 'today', 'week', 'month'],
          default: 'all',
        },
      },
      required: ['businessId'],
    },
  },
  {
    name: 'get_all_businesses',
    description: 'קבל רשימה של כל העסקים הפעילים במערכת',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_instagram_story',
    description: 'חפש סטורי ספציפי באינסטגרם (לפי username ו-business handle)',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'שם משתמש באינסטגרם (ללא @)',
        },
        businessHandle: {
          type: 'string',
          description: 'הנדל של העסק באינסטגרם (עם או בלי @)',
        },
      },
      required: ['username', 'businessHandle'],
    },
  },
  {
    name: 'monitor_submissions_realtime',
    description: 'התחל ניטור בזמן אמת - בודק submissions כל כמה דקות',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: {
          type: 'string',
          description: 'UUID של עסק ספציפי (אופציונלי)',
        },
        intervalMinutes: {
          type: 'number',
          description: 'כל כמה דקות לבדוק (ברירת מחדל: 5)',
          default: 5,
        },
        maxIterations: {
          type: 'number',
          description: 'כמה פעמים לבדוק (ברירת מחדל: 12 = שעה)',
          default: 12,
        },
      },
    },
  },
  {
    name: 'check_stale_submissions',
    description: 'בדוק submissions שממתינים יותר מדי זמן (ברירת מחדל: 24 שעות)',
    inputSchema: {
      type: 'object',
      properties: {
        hoursThreshold: {
          type: 'number',
          description: 'כמה שעות (ברירת מחדל: 24)',
          default: 24,
        },
      },
    },
  },
  {
    name: 'get_automation_stats',
    description: 'קבל סטטיסטיקות של מנוע האוטומציה',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'start_automation',
    description: 'הפעל את מנוע האוטומציה (בדיקה כל 5 דקות)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'stop_automation',
    description: 'עצור את מנוע האוטומציה',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('Tools list requested');
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.action(`Tool called: ${name}`, args);

  try {
    let result;
    const context = { supabase, instagram, automation };

    switch (name) {
      case 'check_story_status':
        result = await checkStoryStatus(args, context);
        break;

      case 'verify_submission':
        result = await verifySubmission(args, context);
        break;

      case 'reject_submission':
        result = await rejectSubmission(args, context);
        break;

      case 'get_pending_submissions':
        result = await getPendingSubmissions(args, context);
        break;

      case 'get_story_analytics':
        result = await getStoryAnalytics(args, context);
        break;

      case 'get_all_businesses':
        result = await getAllBusinesses(args, context);
        break;

      case 'search_instagram_story':
        result = await searchInstagramStory(args, context);
        break;

      case 'monitor_submissions_realtime':
        result = await monitorSubmissionsRealtime(args, context);
        break;

      case 'check_stale_submissions':
        result = await checkStaleSubmissions(args, context);
        break;

      case 'get_automation_stats':
        result = {
          success: true,
          stats: automation.getStats(),
        };
        break;

      case 'start_automation':
        automation.start();
        result = {
          success: true,
          message: 'Automation started',
          stats: automation.getStats(),
        };
        break;

      case 'stop_automation':
        automation.stop();
        result = {
          success: true,
          message: 'Automation stopped',
          stats: automation.getStats(),
        };
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };

  } catch (error) {
    logger.error(`Tool execution failed: ${name}`, { error: error.message });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Health check
async function healthCheck() {
  logger.info('Running health check...');

  const supabaseHealth = await supabase.healthCheck();
  const instagramHealth = await instagram.healthCheck();

  if (supabaseHealth.success && instagramHealth.success) {
    logger.success('Health check passed - all systems operational');
  } else {
    logger.error('Health check failed', { supabaseHealth, instagramHealth });
  }

  return { supabaseHealth, instagramHealth };
}

// Start server
async function main() {
  logger.info('🚀 Starting STORIT Instagram MCP Server...');

  // Run health check
  await healthCheck();

  // Start automation if enabled
  if (process.env.ENABLE_AUTOMATION === 'true') {
    automation.start();
  }

  // Connect transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.success('✅ MCP Server is running!');
  logger.info('Waiting for tool calls from Claude...');
}

// Handle shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  automation.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  automation.stop();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  logger.error('Server failed to start', { error: error.message });
  process.exit(1);
});
