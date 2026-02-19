const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    
    // Test connection by querying the database
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Try a simple query to verify it works
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    // Test if we can query displays
    const displayCount = await prisma.display.count();
    console.log(`📺 Current displays in database: ${displayCount}`);
    
    console.log('✅ Database connection test passed!');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    if (error.message.includes('P1001')) {
      console.error('\n💡 Tip: Make sure MongoDB is running and DATABASE_URL in .env is correct');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
