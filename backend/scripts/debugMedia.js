const prisma = require('../src/config/db');
const fs = require('fs');
const path = require('path');

/**
 * Debug script to show current media state
 */
async function debugMedia() {
  console.log('🔍 Debugging current media state...');

  try {
    // Get all media records
    const mediaRecords = await prisma.media.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        filename: true,
        type: true,
        createdAt: true,
        createdBy: {
          select: {
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📊 Found ${mediaRecords.length} media records in database:`);
    
    mediaRecords.forEach((media, index) => {
      console.log(`\n${index + 1}. ${media.name}`);
      console.log(`   ID: ${media.id}`);
      console.log(`   URL: ${media.url}`);
      console.log(`   Type: ${media.type}`);
      console.log(`   Created: ${media.createdAt}`);
      console.log(`   Created by: ${media.createdBy?.email || 'Unknown'} (${media.createdBy?.role || 'Unknown'})`);
      
      // Check if file exists
      if (media.url && media.url.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '../public', media.url);
        const exists = fs.existsSync(filePath);
        console.log(`   File exists: ${exists ? '✅' : '❌'} (${filePath})`);
        
        if (exists) {
          try {
            const stats = fs.statSync(filePath);
            console.log(`   File size: ${stats.size} bytes`);
          } catch (e) {
            console.log(`   File size: Error reading (${e.message})`);
          }
        }
      } else {
        console.log(`   File exists: ❌ (Invalid URL)`);
      }
    });

    // Check uploads directory
    const uploadsDir = path.join(__dirname, '../public/uploads');
    console.log(`\n📁 Checking uploads directory: ${uploadsDir}`);
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`\n📂 Files in uploads directory (${files.length}):`);
      
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          const hasRecord = mediaRecords.some(m => m.url === `/uploads/${file}`);
          console.log(`   ${file} - ${stats.size} bytes - ${hasRecord ? '✅ Has record' : '❌ Orphaned'}`);
        } else if (stats.isDirectory()) {
          console.log(`   📁 ${file}/ (directory)`);
        }
      });
    } else {
      console.log('❌ Uploads directory does not exist!');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugMedia();