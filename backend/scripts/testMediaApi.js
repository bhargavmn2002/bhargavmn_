const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const paginationService = require('../src/services/pagination.service');

const prisma = new PrismaClient();

/**
 * Test the media API response format
 */
async function testMediaApi() {
  console.log('🧪 Testing media API response format...');

  try {
    // Simulate the media controller logic
    const page = 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const sort = { createdAt: 'desc' };

    // Get media records (simplified - no user filtering for test)
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: sort,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.media.count()
    ]);

    console.log('📊 Raw database results:');
    console.log('- Total count:', total);
    console.log('- Media items:', media.length);
    console.log('- Media items:', media.map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      url: m.url
    })));

    // Format using pagination service
    const response = paginationService.formatPaginatedResponse(media, total, page, limit);
    
    console.log('\n📦 Formatted API response:');
    console.log('- Response keys:', Object.keys(response));
    console.log('- Data property:', !!response.data);
    console.log('- Data length:', response.data?.length);
    console.log('- Pagination property:', !!response.pagination);
    
    console.log('\n🔍 Full response structure:');
    console.log(JSON.stringify(response, null, 2));

    console.log('\n✅ Frontend should use: response.data (not response.media)');

  } catch (error) {
    console.error('❌ Error testing media API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMediaApi();