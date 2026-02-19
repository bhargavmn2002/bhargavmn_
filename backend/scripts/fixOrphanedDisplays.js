const prisma = require('../src/config/db');

/**
 * Fix orphaned displays by either deleting them or associating them properly
 */
async function fixOrphanedDisplays() {
  console.log('🔧 Fixing orphaned displays...');

  try {
    // Get all orphaned displays (unpaired, no associations)
    const orphanedDisplays = await prisma.display.findMany({
      where: {
        OR: [
          {
            isPaired: false,
            status: 'PAIRING'
          },
          {
            managedByUserId: null,
            clientAdminId: null
          }
        ]
      }
    });

    console.log(`📊 Found ${orphanedDisplays.length} orphaned displays`);

    if (orphanedDisplays.length === 0) {
      console.log('✅ No orphaned displays found!');
      return;
    }

    // Show details of orphaned displays
    orphanedDisplays.forEach((display, index) => {
      console.log(`\n${index + 1}. ${display.name || 'Unnamed Display'}`);
      console.log(`   ID: ${display.id}`);
      console.log(`   Status: ${display.status}`);
      console.log(`   Paired: ${display.isPaired}`);
      console.log(`   Pairing Code: ${display.pairingCode || 'None'}`);
      console.log(`   Created: ${display.createdAt}`);
      console.log(`   Managed by: ${display.managedByUserId || 'None'}`);
      console.log(`   Client admin: ${display.clientAdminId || 'None'}`);
    });

    // Option 1: Delete all orphaned displays (clean slate)
    console.log('\n🗑️ Deleting all orphaned displays...');
    
    const deleteResult = await prisma.display.deleteMany({
      where: {
        OR: [
          {
            isPaired: false,
            status: 'PAIRING'
          },
          {
            managedByUserId: null,
            clientAdminId: null
          }
        ]
      }
    });

    console.log(`✅ Deleted ${deleteResult.count} orphaned displays`);

    // Verify the fix
    const remainingDisplays = await prisma.display.findMany({
      include: {
        managedByUser: {
          select: {
            email: true,
            role: true
          }
        },
        clientAdmin: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    console.log(`\n📊 Remaining displays: ${remainingDisplays.length}`);
    
    if (remainingDisplays.length > 0) {
      console.log('\n✅ Properly associated displays:');
      remainingDisplays.forEach((display, index) => {
        console.log(`${index + 1}. ${display.name}`);
        console.log(`   Paired: ${display.isPaired}`);
        console.log(`   Managed by: ${display.managedByUser?.email || 'None'}`);
        console.log(`   Client: ${display.clientAdmin?.email || 'None'}`);
      });
    }

    console.log('\n✅ Display cleanup completed!');
    console.log('🎯 Dashboard display counts should now be accurate');

  } catch (error) {
    console.error('❌ Error fixing orphaned displays:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixOrphanedDisplays();