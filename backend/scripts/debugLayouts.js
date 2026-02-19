const prisma = require('../src/config/db');

async function debugLayouts() {
  try {
    console.log('🔍 Fetching all layouts...\n');
    
    const layouts = await prisma.layout.findMany({
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              include: {
                media: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          }
        },
        createdBy: {
          select: {
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (layouts.length === 0) {
      console.log('❌ No layouts found in database\n');
      return;
    }

    console.log(`✅ Found ${layouts.length} layout(s)\n`);
    console.log('='.repeat(80));

    layouts.forEach((layout, index) => {
      console.log(`\n📐 Layout ${index + 1}: ${layout.name}`);
      console.log(`   ID: ${layout.id}`);
      console.log(`   Dimensions: ${layout.width}x${layout.height} (${layout.orientation})`);
      console.log(`   Active: ${layout.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created by: ${layout.createdBy?.email || 'Unknown'} (${layout.createdBy?.role || 'Unknown'})`);
      console.log(`   Created at: ${layout.createdAt}`);
      console.log(`   Sections: ${layout.sections.length}`);

      if (layout.sections.length > 0) {
        console.log('\n   📦 Sections:');
        layout.sections.forEach((section, sIndex) => {
          console.log(`      ${sIndex + 1}. ${section.name} (Order: ${section.order})`);
          console.log(`         ID: ${section.id}`);
          console.log(`         Position: (${section.x}%, ${section.y}%)`);
          console.log(`         Size: ${section.width}% x ${section.height}%`);
          console.log(`         Items: ${section.items.length}`);
          
          if (section.items.length > 0) {
            console.log(`         Media:`);
            section.items.forEach((item, iIndex) => {
              console.log(`            ${iIndex + 1}. ${item.media?.name || 'Unknown'} (${item.media?.type || 'Unknown'})`);
              console.log(`               Duration: ${item.duration || 'N/A'}s, Resize: ${item.resizeMode}`);
            });
          }
        });
      }

      console.log('\n' + '='.repeat(80));
    });

    console.log('\n✅ Debug complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLayouts();
