const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteCertificate() {
  try {
    console.log('🗑️ Deleting existing certificate...');
    
    // Delete the existing certificate for the new student
    const deletedCertificate = await prisma.certificate.delete({
      where: { id: '5202928d-0688-4fbb-94ef-96724ce649d7' }
    });

    console.log('✅ Deleted certificate:', deletedCertificate.certificateNumber);
    console.log('🔄 Now you can regenerate the certificate with the updated logic.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteCertificate(); 