const prisma = require('../src/config/db');

/**
 * Debug script to analyze display data and associations
 */
async function debugDisplays() {
  console.log('🔍 Debugging display data and associations...');

  try {
    // Get all displays
    const allDisplays = await prisma.display.findMany({
      include: {
        managedByUser: {
          select: {
            id: true,
            email: true,
            role: true,
            managedByClientAdminId: true,
            createdByUserAdminId: true
          }
        },
        clientAdmin: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log(`\n📊 Found ${allDisplays.length} total displays in database:`);
    
    allDisplays.forEach((display, index) => {
      console.log(`\n${index + 1}. ${display.name || 'Unnamed Display'}`);
      console.log(`   ID: ${display.id}`);
      console.log(`   Status: ${display.status}`);
      console.log(`   Paired: ${display.isPaired}`);
      console.log(`   Created: ${display.createdAt}`);
      console.log(`   Managed by: ${display.managedByUser?.email || 'None'} (${display.managedByUser?.role || 'N/A'})`);
      console.log(`   Manager's client admin: ${display.managedByUser?.managedByClientAdminId || 'None'}`);
      console.log(`   Client admin: ${display.clientAdmin?.email || 'None'}`);
      console.log(`   Client admin ID: ${display.clientAdminId || 'None'}`);
    });

    // Get all users to understand the hierarchy
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        managedByClientAdminId: true,
        createdByUserAdminId: true
      }
    });

    console.log(`\n👥 User hierarchy (${allUsers.length} users):`);
    
    const clientAdmins = allUsers.filter(u => u.role === 'CLIENT_ADMIN');
    const userAdmins = allUsers.filter(u => u.role === 'USER_ADMIN');
    const staff = allUsers.filter(u => u.role === 'STAFF');

    console.log(`\n🏢 CLIENT_ADMIN users (${clientAdmins.length}):`);
    clientAdmins.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });

    console.log(`\n👤 USER_ADMIN users (${userAdmins.length}):`);
    userAdmins.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
      console.log(`     Managed by client admin: ${user.managedByClientAdminId || 'None'}`);
    });

    console.log(`\n👷 STAFF users (${staff.length}):`);
    staff.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
      console.log(`     Created by user admin: ${user.createdByUserAdminId || 'None'}`);
    });

    // Check display associations for each client
    for (const clientAdmin of clientAdmins) {
      console.log(`\n🏢 Displays for client admin ${clientAdmin.email}:`);
      
      // Get user admins under this client
      const userAdminsUnderClient = userAdmins.filter(ua => ua.managedByClientAdminId === clientAdmin.id);
      console.log(`   User admins: ${userAdminsUnderClient.map(ua => ua.email).join(', ') || 'None'}`);
      
      // Get staff under these user admins
      const staffUnderClient = staff.filter(s => 
        userAdminsUnderClient.some(ua => ua.id === s.createdByUserAdminId)
      );
      console.log(`   Staff users: ${staffUnderClient.map(s => s.email).join(', ') || 'None'}`);
      
      // Get all user IDs in this client's hierarchy
      const allUserIds = [
        clientAdmin.id,
        ...userAdminsUnderClient.map(ua => ua.id),
        ...staffUnderClient.map(s => s.id)
      ];
      
      // Find displays managed by users in this hierarchy
      const clientDisplays = allDisplays.filter(d => 
        d.managedByUser && allUserIds.includes(d.managedByUser.id)
      );
      
      // Also find displays directly assigned to this client admin
      const directClientDisplays = allDisplays.filter(d => 
        d.clientAdminId === clientAdmin.id
      );
      
      console.log(`   Displays managed by hierarchy: ${clientDisplays.length}`);
      clientDisplays.forEach(display => {
        console.log(`     - ${display.name} (managed by ${display.managedByUser?.email})`);
      });
      
      console.log(`   Displays directly assigned to client: ${directClientDisplays.length}`);
      directClientDisplays.forEach(display => {
        console.log(`     - ${display.name} (direct assignment)`);
      });
    }

    // Check for orphaned displays
    const orphanedDisplays = allDisplays.filter(d => 
      !d.managedByUser && !d.clientAdminId
    );
    
    if (orphanedDisplays.length > 0) {
      console.log(`\n⚠️ Orphaned displays (${orphanedDisplays.length}):`);
      orphanedDisplays.forEach(display => {
        console.log(`   - ${display.name || 'Unnamed'} (ID: ${display.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error during display debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugDisplays();