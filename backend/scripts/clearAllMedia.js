const prisma = require('../src/config/db');
const fs = require('fs');
const path = require('path');

/**
 * Clear all media records and files - fresh start
 */
async function clearAllMedia() {
  console.log('🧹 Clearing all media records and files...');

  try {
    // Get all media records first
    const mediaRecords = await prisma.media.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        filename: true
      }
    });

    console.log(`📊 Found ${mediaRecords.length} media records to delete`);

    // Delete all media records from database
    const deleteResult = await prisma.media.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} media records from database`);

    // Delete all files from uploads directory
    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    if (fs.existsSync(uploadsDir)) {
      console.log('🗂️ Cleaning uploads directory...');
      
      const items = fs.readdirSync(uploadsDir);
      let deletedFiles = 0;
      let deletedDirs = 0;

      for (const item of items) {
        const itemPath = path.join(uploadsDir, item);
        const stats = fs.statSync(itemPath);

        try {
          if (stats.isDirectory()) {
            // Delete directory recursively
            fs.rmSync(itemPath, { recursive: true, force: true });
            console.log(`📁 Deleted directory: ${item}`);
            deletedDirs++;
          } else {
            // Delete file
            fs.unlinkSync(itemPath);
            console.log(`🗑️ Deleted file: ${item}`);
            deletedFiles++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to delete ${item}: ${error.message}`);
        }
      }

      console.log(`✅ Cleanup complete: ${deletedFiles} files and ${deletedDirs} directories deleted`);
    } else {
      console.log('📁 Uploads directory does not exist');
    }

    // Recreate necessary subdirectories
    const subdirs = ['hls', 'optimized', 'thumbnails'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(uploadsDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
        console.log(`📁 Created directory: uploads/${subdir}`);
      }
    }

    console.log('\n✅ All media cleared successfully!');
    console.log('🎯 You can now start fresh with new uploads');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearAllMedia();