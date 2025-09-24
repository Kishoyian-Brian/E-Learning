const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCertificate() {
  try {
    console.log('🎓 Creating a new test certificate...');
    
    // Get the student and course
    const student = await prisma.user.findFirst({
      where: { email: 'maxmillianmuiruri@gmail.com' }
    });

    const course = await prisma.course.findFirst({
      where: { id: 'test-course-id' }
    });

    if (!student || !course) {
      console.log('❌ Student or course not found');
      return;
    }

    // Get existing enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: student.id,
        courseId: course.id,
      }
    });

    if (!enrollment) {
      console.log('❌ Enrollment not found');
      return;
    }

    console.log('✅ Found enrollment:', enrollment.id);

    // Generate certificate number and verification code
    const certificateNumber = 'CERT-TEST-' + Date.now();
    const verificationCode = require('crypto').randomBytes(16).toString('hex');

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        userId: student.id,
        courseId: course.id,
        enrollmentId: enrollment.id,
        certificateNumber,
        verificationCode,
        type: 'COMPLETION',
        issuedAt: new Date(),
        status: 'ACTIVE',
        metadata: {},
        // For testing, let's create a simple downloadable URL
        certificateUrl: `https://res.cloudinary.com/dl58ky8da/raw/upload/fl_attachment/certificates/${certificateNumber}.pdf`
      },
    });

    console.log('✅ Created certificate:', certificate.id);
    console.log('📄 Certificate URL:', certificate.certificateUrl);
    console.log('🔢 Certificate Number:', certificate.certificateNumber);
    console.log('🔐 Verification Code:', certificate.verificationCode);

    // Test the URL
    console.log('\n🧪 Testing certificate URL...');
    const testUrl = certificate.certificateUrl;
    console.log('🔗 Test URL:', testUrl);

  } catch (error) {
    console.error('❌ Error creating test certificate:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCertificate();