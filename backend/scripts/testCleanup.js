require('dotenv').config();
const { cleanupExpiredMedia } = require('../src/controllers/media.controller');

async function testCleanup() {
  console.log('🧪 Testing media cleanup functionality...');
  
  try {
    const results = await cleanupExpiredMedia();
    console.log('✅ Cleanup test completed successfully');
    console.log('📊 Results:', results);
  } catch (error) {
    console.error('❌ Cleanup test failed:', error);
  }
  
  process.exit(0);
}

testCleanup();