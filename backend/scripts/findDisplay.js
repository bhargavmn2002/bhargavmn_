const prisma = require('../src/config/db');

async function findDisplays() {
  try {
    console.log('🔍 Searching for displays...\n');
    
    const displays = await prisma.display.findMany({
      where: {
        isPaired: true,
      },
      select: {
        id: true,
        name: true,
        pairingCode: true,
        status: true,
        lastHeartbeat: true,
        location: true,
        deviceInfo: true,
      },
      orderBy: {
        lastHeartbeat: 'desc',
      },
    });

    if (displays.length === 0) {
      console.log('❌ No paired displays found');
      return;
    }

    console.log(`✅ Found ${displays.length} display(s):\n`);
    
    displays.forEach((display, index) => {
      console.log(`Display #${index + 1}:`);
      console.log(`  ID: ${display.id}`);
      console.log(`  Name: ${display.name}`);
      console.log(`  Status: ${display.status}`);
      console.log(`  Last Heartbeat: ${display.lastHeartbeat}`);
      console.log(`  Location: ${display.location || 'Not set'}`);
      console.log(`  Device Info: ${display.deviceInfo || 'Not available'}`);
      console.log('');
    });

    console.log('\n💡 To disable kiosk mode remotely, use the display ID in the frontend or API');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findDisplays();
