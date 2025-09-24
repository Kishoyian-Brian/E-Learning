const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database state...\n');
    
    // Check categories
    const categories = await prisma.category.findMany();
    console.log(`Categories (${categories.length}):`);
    categories.forEach(cat => console.log(`- ${cat.id}: ${cat.name}`));
    
    // Check difficulties
    const difficulties = await prisma.difficultyLevel.findMany();
    console.log(`\nDifficulties (${difficulties.length}):`);
    difficulties.forEach(diff => console.log(`- ${diff.id}: ${diff.name}`));
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true
      }
    });
    console.log(`\nUsers (${users.length}):`);
    users.forEach(user => console.log(`- ${user.id}: ${user.name} (${user.email}) - ${user.role} - Verified: ${user.isVerified}`));
    
    // Check courses
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            name: true,
            email: true
          }
        },
        category: true,
        difficulty: true
      }
    });
    console.log(`\nCourses (${courses.length}):`);
    courses.forEach(course => console.log(`- ${course.id}: ${course.title} by ${course.instructor.name} (${course.category.name}, ${course.difficulty.name})`));
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 