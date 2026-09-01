const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  try {
    const contacts = await prisma.whatsAppContact.findMany();
    
    let csvString = 'id,name,phone,createdAt\n';
    
    for (const contact of contacts) {
      const id = contact.id;
      const name = `"${(contact.name || '').replace(/"/g, '""')}"`;
      const phone = contact.phone;
      const createdAt = contact.createdAt ? contact.createdAt.toISOString() : '';
      csvString += `${id},${name},${phone},${createdAt}\n`;
    }
    
    fs.writeFileSync('contacts-export.csv', csvString);
    console.log('Export successful');
  } catch (err) {
    console.error('Error exporting contacts:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
