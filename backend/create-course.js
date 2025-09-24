const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCourse() {
  try {
    // First, let's get the available categories and difficulties
    const categories = await prisma.category.findMany();
    const difficulties = await prisma.difficultyLevel.findMany();
    
    console.log('Available Categories:');
    categories.forEach(cat => console.log(`- ${cat.id}: ${cat.name}`));
    
    console.log('\nAvailable Difficulties:');
    difficulties.forEach(diff => console.log(`- ${diff.id}: ${diff.name}`));
    
    // Let's also get an instructor (assuming we have one)
    const instructor = await prisma.user.findFirst({
      where: { role: 'INSTRUCTOR' }
    });
    
    if (!instructor) {
      console.log('No instructor found. Please create an instructor first.');
      return;
    }
    
    console.log(`\nUsing instructor: ${instructor.name} (${instructor.email})`);
    
    // Create a sample course
    const courseData = {
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. This course covers everything from basic markup to interactive web applications.",
      categoryId: categories[0].id, // Programming
      difficultyId: difficulties[0].id, // Beginner
      instructorId: instructor.id
    };
    
    const newCourse = await prisma.course.create({
      data: courseData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
      },
    });
    
    console.log('\n✅ Course created successfully!');
    console.log('Course Details:');
    console.log(`- ID: ${newCourse.id}`);
    console.log(`- Title: ${newCourse.title}`);
    console.log(`- Description: ${newCourse.description}`);
    console.log(`- Category: ${newCourse.category.name}`);
    console.log(`- Difficulty: ${newCourse.difficulty.name}`);
    console.log(`- Instructor: ${newCourse.instructor.name}`);
    console.log(`- Created: ${newCourse.createdAt}`);
    
  } catch (error) {
    console.error('❌ Error creating course:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createCourse(); 