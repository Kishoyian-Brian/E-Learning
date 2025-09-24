const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCertificateUrl() {
  try {
    console.log('🔄 Updating certificate URL to force download...');
    
    // Get the existing certificate
    const certificate = await prisma.certificate.findFirst({
      where: {
        certificateNumber: 'CERT-MCQJRQ1Q-1AE7BD25'
      }
    });

    if (!certificate) {
      console.log('❌ Certificate not found');
      return;
    }

    console.log('📄 Current URL:', certificate.certificateUrl);

    // Convert to downloadable URL
    const originalUrl = certificate.certificateUrl;
    const urlParts = originalUrl.split('/');
    const uploadIndex = urlParts.findIndex((part) => part === 'upload');
    
    let downloadUrl;
    if (uploadIndex !== -1) {
      // Insert fl_attachment before the version number
      urlParts.splice(uploadIndex + 1, 0, 'fl_attachment');
      downloadUrl = urlParts.join('/');
    } else {
      // Fallback: append fl_attachment to the URL
      downloadUrl = originalUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    console.log('📥 New downloadable URL:', downloadUrl);

    // Update the certificate
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificate.id },
      data: { certificateUrl: downloadUrl }
    });

    console.log('✅ Certificate URL updated successfully!');
    console.log('🆕 New URL:', updatedCertificate.certificateUrl);

  } catch (error) {
    console.error('❌ Error updating certificate URL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCertificateUrl(); 