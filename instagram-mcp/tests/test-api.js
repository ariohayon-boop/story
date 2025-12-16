/**
 * Test File for Instagram MCP Server
 * בדיקת כל הפונקציות והחיבורים
 */

import dotenv from 'dotenv';
import InstagramAPI from '../src/instagram-api.js';
import SupabaseClient from '../src/supabase-client.js';
import { logger } from '../src/utils/logger.js';

dotenv.config();

async function runTests() {
  logger.info('🧪 Starting tests...\n');

  // Test 1: Supabase Connection
  logger.info('Test 1: Supabase Connection');
  try {
    const supabase = new SupabaseClient();
    const health = await supabase.healthCheck();
    
    if (health.success) {
      logger.success('✅ Supabase connected successfully');
    } else {
      logger.error('❌ Supabase connection failed', health);
    }
  } catch (error) {
    logger.error('❌ Supabase test failed', { error: error.message });
  }

  console.log('\n---\n');

  // Test 2: Instagram API Connection
  logger.info('Test 2: Instagram API Connection');
  try {
    const instagram = new InstagramAPI();
    const health = await instagram.healthCheck();
    
    if (health.success) {
      logger.success('✅ Instagram API connected successfully');
      logger.info('Instagram Account:', health.data);
    } else {
      logger.error('❌ Instagram API connection failed', health);
    }
  } catch (error) {
    logger.error('❌ Instagram API test failed', { error: error.message });
  }

  console.log('\n---\n');

  // Test 3: Get All Businesses
  logger.info('Test 3: Get All Businesses');
  try {
    const supabase = new SupabaseClient();
    const businesses = await supabase.getAllBusinesses();
    
    logger.success(`✅ Found ${businesses.length} active businesses`);
    
    if (businesses.length > 0) {
      logger.info('First business:', {
        name: businesses[0].business_name,
        instagram: businesses[0].instagram_handle
      });
    }
  } catch (error) {
    logger.error('❌ Get businesses test failed', { error: error.message });
  }

  console.log('\n---\n');

  // Test 4: Get Pending Submissions
  logger.info('Test 4: Get Pending Submissions');
  try {
    const supabase = new SupabaseClient();
    const pending = await supabase.getPendingSubmissions();
    
    logger.success(`✅ Found ${pending.length} pending submissions`);
    
    if (pending.length > 0) {
      logger.info('First pending submission:', {
        username: pending[0].username,
        createdAt: pending[0].created_at
      });
    }
  } catch (error) {
    logger.error('❌ Get pending submissions test failed', { error: error.message });
  }

  console.log('\n---\n');

  // Test 5: Search Story (Example)
  logger.info('Test 5: Search Instagram Story (Example)');
  try {
    const instagram = new InstagramAPI();
    
    // דוגמה - תחליף בערכים אמיתיים
    const username = 'test_user';
    const businessHandle = '@test_business';
    
    logger.info(`Searching for story from @${username} tagging ${businessHandle}...`);
    
    const result = await instagram.searchUserStory(username, businessHandle);
    
    if (result.found) {
      logger.success('✅ Story found!', result);
    } else {
      logger.info('ℹ️  Story not found (expected for test)', { reason: result.reason });
    }
  } catch (error) {
    logger.error('❌ Search story test failed', { error: error.message });
  }

  console.log('\n---\n');

  // Test 6: Validators
  logger.info('Test 6: Testing Validators');
  try {
    const { 
      validateUsername, 
      validateBusinessHandle, 
      validateUUID 
    } = await import('../src/utils/validators.js');
    
    // Test username validation
    const usernameTest = validateUsername('test_user123');
    if (usernameTest.valid) {
      logger.success('✅ Username validation works');
    }
    
    // Test invalid username
    const invalidUsernameTest = validateUsername('invalid user!');
    if (!invalidUsernameTest.valid) {
      logger.success('✅ Invalid username correctly rejected');
    }
    
    // Test UUID validation
    const uuidTest = validateUUID('123e4567-e89b-12d3-a456-426614174000');
    if (uuidTest.valid) {
      logger.success('✅ UUID validation works');
    }
    
  } catch (error) {
    logger.error('❌ Validators test failed', { error: error.message });
  }

  console.log('\n---\n');

  // Summary
  logger.success('🎉 Tests completed!');
  logger.info('If all tests passed, your MCP server is ready to use.');
  logger.info('Next steps:');
  logger.info('1. Configure your .env file with real credentials');
  logger.info('2. Run: npm start');
  logger.info('3. Connect Claude to the MCP server');
}

// Run tests
runTests().catch(error => {
  logger.error('Tests failed with error:', { error: error.message });
  process.exit(1);
});
