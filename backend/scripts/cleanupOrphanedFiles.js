const prisma = require('../src/config/db');
const fs = require('fs');
const path = require('path');

/**
 * Cleanup script to remove orphaned files and fix database inconsistencies
 */
async function cleanupOrphanedFiles() {
  console.log('🧹 Starting cleanup of orphaned files...');

  try {
    // Get all media records from database
    const mediaRecords = await prisma.media.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        filename: true,
        type: true
      }
    });

    console.log(`📊 Found ${mediaRecords.length} media records in database`);

    const uploadsDir = path.join(__dirname, '../public/uploads');
    const issues = [];

    // Check each media record
    for (const media of mediaRecords) {
      if (!media.url || !media.url.startsWith('/uploads/')) {
        issues.push({
          type: 'invalid_url',
          media,
          issue: 'Invalid or missing URL'
        });
        continue;
      }

      const filePath = path.join(__dirname, '../public', media.url);
      
      if (!fs.existsSync(filePath)) {
        issues.push({
          type: 'missing_file',
          media,
          issue: `File not found: ${filePath}`
        });
      }
    }

    console.log(`\n🔍 Found ${issues.length} issues:`);

    // Group issues by type
    const missingFiles = issues.filter(i => i.type === 'missing_file');
    const invalidUrls = issues.filter(i => i.type === 'invalid_url');

    if (missingFiles.length > 0) {
      console.log(`\n❌ Missing files (${missingFiles.length}):`);
      missingFiles.forEach(issue => {
        console.log(`  - ${issue.media.name} (ID: ${issue.media.id})`);
        console.log(`    URL: ${issue.media.url}`);
        console.log(`    Issue: ${issue.issue}`);
      });
    }

    if (invalidUrls.length > 0) {
      console.log(`\n⚠️ Invalid URLs (${invalidUrls.length}):`);
      invalidUrls.forEach(issue => {
        console.log(`  - ${issue.media.name} (ID: ${issue.media.id})`);
        console.log(`    URL: ${issue.media.url}`);
        console.log(`    Issue: ${issue.issue}`);
      });
    }

    // Ask for confirmation to clean up
    if (issues.length > 0) {
      console.log(`\n🗑️ Would you like to remove these ${issues.length} problematic media records from the database?`);
      console.log('This will help prevent 404 errors in the frontend.');
      console.log('Type "yes" to proceed or anything else to cancel:');

      // In a real scenario, you'd use readline for input
      // For now, we'll just log what would be done
      console.log('\n📝 To clean up these records, run:');
      console.log('DELETE FROM Media WHERE id IN (');
      issues.forEach((issue, index) => {
        console.log(`  '${issue.media.id}'${index < issues.length - 1 ? ',' : ''}`);
      });
      console.log(');');

      // Uncomment the following to actually delete the records:
      /*
      const idsToDelete = issues.map(i => i.media.id);
      const deleteResult = await prisma.media.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      });
      console.log(`✅ Deleted ${deleteResult.count} problematic media records`);
      */
    } else {
      console.log('\n✅ No issues found! All media records have valid files.');
    }

    // Check for orphaned files (files without database records)
    console.log('\n🔍 Checking for orphaned files...');
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const orphanedFiles = [];

      for (const file of files) {
        if (file === 'hls' || file === 'optimized' || file === 'thumbnails') {
          continue; // Skip directories
        }

        const fileUrl = `/uploads/${file}`;
        const hasRecord = mediaRecords.some(m => m.url === fileUrl);
        
        if (!hasRecord) {
          orphanedFiles.push(file);
        }
      }

      if (orphanedFiles.length > 0) {
        console.log(`\n🗂️ Found ${orphanedFiles.length} orphaned files:`);
        orphanedFiles.forEach(file => {
          console.log(`  - ${file}`);
        });
      } else {
        console.log('\n✅ No orphaned files found!');
      }
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupOrphanedFiles();