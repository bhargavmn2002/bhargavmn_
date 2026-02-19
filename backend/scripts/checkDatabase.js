const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    console.log(`URI: ${process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@')}\n`);
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected successfully!\n');

    // Count documents in each collection
    console.log('📊 DATABASE CONTENTS:\n');

    const users = await prisma.user.count();
    console.log(`👥 Users: ${users}`);

    const clientProfiles = await prisma.clientProfile.count();
    console.log(`🏢 Client Profiles: ${clientProfiles}`);

    const displays = await prisma.display.count();
    console.log(`📺 Displays: ${displays}`);

    const media = await prisma.media.count();
    console.log(`🎬 Media: ${media}`);

    const playlists = await prisma.playlist.count();
    console.log(`📋 Playlists: ${playlists}`);

    const layouts = await prisma.layout.count();
    console.log(`🎨 Layouts: ${layouts}`);

    const schedules = await prisma.schedule.count();
    console.log(`📅 Schedules: ${schedules}`);

    const widgets = await prisma.widget.count();
    console.log(`🔧 Widgets: ${widgets}`);

    console.log('\n✅ Database is accessible and working!');

  } catch (error) {
    console.error('❌ Error connecting to database:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Check your MongoDB Atlas credentials');
    } else if (error.message.includes('network')) {
      console.error('\n💡 Check your network connection and MongoDB Atlas IP whitelist');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Connection closed');
  }
}

checkDatabase();
