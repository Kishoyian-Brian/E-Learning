const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createQuiz() {
  try {
    // First, let's check what users exist
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });
    
    console.log('Available users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - ID: ${user.id}`);
    });

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: 'cb7fa5e9-190e-4ff5-9717-58f374c1454a' },
      include: { instructor: true }
    });

    if (!course) {
      console.log('Course not found');
      return;
    }

    console.log(`\nCourse: ${course.title}`);
    console.log(`Instructor: ${course.instructor.name} (${course.instructor.email})`);

    // Create the quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: 'JavaScript Basics Quiz',
        courseId: 'cb7fa5e9-190e-4ff5-9717-58f374c1454a',
        timeLimit: 600,
        questions: {
          create: [
            {
              text: 'What is JavaScript?',
              type: 'MCQ',
              options: ['A programming language', 'A database', 'A framework', 'An operating system'],
              answer: 'A programming language',
              order: 1
            },
            {
              text: 'Which keyword is used to declare variables in JavaScript?',
              type: 'MCQ',
              options: ['var', 'let', 'const', 'All of the above'],
              answer: 'All of the above',
              order: 2
            },
            {
              text: 'What is the correct way to write a JavaScript array?',
              type: 'MCQ',
              options: [
                'var colors = (1:"red", 2:"green", 3:"blue")',
                'var colors = "red", "green", "blue"',
                'var colors = ["red", "green", "blue"]',
                'var colors = 1 = ("red"), 2 = ("green"), 3 = ("blue")'
              ],
              answer: 'var colors = ["red", "green", "blue"]',
              order: 3
            }
          ]
        }
      },
      include: {
        questions: true
      }
    });

    console.log('\nQuiz created successfully!');
    console.log(`Quiz ID: ${quiz.id}`);
    console.log(`Title: ${quiz.title}`);
    console.log(`Questions: ${quiz.questions.length}`);

    quiz.questions.forEach((question, index) => {
      console.log(`  ${index + 1}. ${question.text}`);
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createQuiz(); 