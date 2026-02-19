const prisma = require('../src/config/db');
const fs = require('fs');
const path = require('path');

/**
 * Fix media issues by removing records with missing files
 */
async function fixMediaIssues() {
  console.log('🔧 Fixing media issues...');

  try {
    // Get all media records
    const mediaRecords = await prisma.media.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        filename: true,
        type: true,
        createdAt: true
      }
    });

    console.log(`📊 Checking ${mediaRecords.length} media records...`);

    const recordsToDelete = [];

    // Check each record
    for (const media of mediaRecords) {
      let shouldDelete = false;
      let reason = '';

      // Check if URL is valid
      if (!media.url || !media.url.startsWith('/uploads/')) {
        shouldDelete = true;
        reason = 'Invalid URL';
      } else {
        // Check if file exists
        const filePath = path.join(__dirname, '../public', media.url);
        if (!fs.existsSync(filePath)) {
          shouldDelete = true;
          reason = 'File not found';
        }
      }

      if (shouldDelete) {
        recordsToDelete.push({
          ...media,
          reason
        });
      }
    }

    if (recordsToDelete.length === 0) {
      console.log('✅ No issues found! All media records are valid.');
      return;
    }

    console.log(`\n🗑️ Found ${recordsToDelete.length} problematic records:`);
    recordsToDelete.forEach(record => {
      console.log(`  - ${record.name} (${record.reason})`);
      console.log(`    ID: ${record.id}`);
      console.log(`    URL: ${record.url}`);
      console.log(`    Created: ${record.createdAt}`);
      console.log('');
    });

    // Delete the problematic records
    console.log('🗑️ Deleting problematic records...');
    
    const idsToDelete = recordsToDelete.map(r => r.id);
    const deleteResult = await prisma.media.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} problematic media records`);
    console.log('✅ Media library should now work without 404 errors');

  } catch (error) {
    console.error('❌ Error fixing media issues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMediaIssues();