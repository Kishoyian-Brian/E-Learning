const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    console.log('🔐 Resetting passwords for instructor and admin...\n');
    
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Reset instructor password
    const instructor = await prisma.user.update({
      where: { email: 'instructor@edusoma.com' },
      data: { password: hashedPassword }
    });
    
    console.log(`✅ Instructor password reset: ${instructor.email}`);
    
    // Reset admin password
    const admin = await prisma.user.update({
      where: { email: 'admin@edusoma.com' },
      data: { password: hashedPassword }
    });
    
    console.log(`✅ Admin password reset: ${admin.email}`);
    
    console.log('\n📋 Login Credentials:');
    console.log('Instructor: instructor@edusoma.com / password123');
    console.log('Admin: admin@edusoma.com / password123');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords(); 