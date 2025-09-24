const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAndRecreateCertificate() {
  try {
    console.log('🗑️ Deleting existing certificate...');
    
    // Delete the existing certificate
    const deletedCertificate = await prisma.certificate.delete({
      where: { id: 'e55b5ce7-0d65-4e9f-b175-c16f5087b1e2' }
    });

    console.log('✅ Deleted certificate:', deletedCertificate.certificateNumber);

    // Now trigger certificate generation through the API
    console.log('🔄 Certificate deleted. Now you can regenerate it through the API endpoint.');
    console.log('📝 Run this command to generate a new certificate:');
    console.log('curl -X POST "http://localhost:3000/api/v1/certificates/generate-for-completion/f2c46f09-557f-4b3e-848c-4913ae9497a4" -H "Authorization: Bearer $TOKEN"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndRecreateCertificate(); 