const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await prisma.$connect();
    console.log('✅ Connected!\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        permissions: true,
      }
    });
    
    console.log(`👥 Total Users: ${users.length}\n`);
    console.log('=' .repeat(80));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. USER DETAILS:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
      console.log(`   Client ID: ${user.clientId || 'N/A'}`);
      console.log(`   Active: ${user.isActive !== undefined ? user.isActive : 'N/A'}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
      console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
      
      if (user.permissions && user.permissions.length > 0) {
        console.log(`   Permissions: ${user.permissions.join(', ')}`);
      }
      
      console.log('-'.repeat(80));
    });

    // Summary by role
    console.log('\n📊 SUMMARY BY ROLE:');
    const roleCount = users.reduce((acc, user) => {
      const role = user.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

    // Summary by client
    console.log('\n🏢 SUMMARY BY CLIENT:');
    const clientCount = users.reduce((acc, user) => {
      const client = user.clientId || 'No Client';
      acc[client] = (acc[client] || 0) + 1;
      return acc;
    }, {});

    Object.entries(clientCount).forEach(([client, count]) => {
      console.log(`   ${client}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Connection closed');
  }
}

listUsers();
