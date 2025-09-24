const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createInstructor() {
  try {
    const email = 'brianmwangiat033@gmail.com';
    const password = 'Brian@1234';
    const name = 'Brian';
    const role = 'INSTRUCTOR';

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('User already exists:', email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isVerified: true,
      },
    });
    console.log('✅ Instructor created:', user);
  } catch (error) {
    console.error('❌ Error creating instructor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInstructor(); 