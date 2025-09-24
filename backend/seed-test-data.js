const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data for certificate system...');

  try {
    // 1. Create test users
    console.log('👥 Creating test users...');
    
    const adminPassword = await bcrypt.hash('password123', 10);
    const instructorPassword = await bcrypt.hash('password123', 10);
    const studentPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true,
      },
    });

    const instructor = await prisma.user.upsert({
      where: { email: 'instructor@example.com' },
      update: {},
      create: {
        email: 'instructor@example.com',
        password: instructorPassword,
        name: 'Test Instructor',
        role: 'INSTRUCTOR',
        isVerified: true,
      },
    });

    const student = await prisma.user.upsert({
      where: { email: 'maxmillianmuiruri@gmail.com' },
      update: {},
      create: {
        email: 'maxmillianmuiruri@gmail.com',
        password: studentPassword,
        name: 'Maxmillian Muiruri',
        role: 'STUDENT',
        isVerified: true,
      },
    });

    console.log('✅ Users created:', { admin: admin.id, instructor: instructor.id, student: student.id });

    // 2. Create categories and difficulty levels
    console.log('📚 Creating categories and difficulty levels...');
    
    const category = await prisma.category.upsert({
      where: { name: 'Programming' },
      update: {},
      create: { name: 'Programming' },
    });

    const difficulty = await prisma.difficultyLevel.upsert({
      where: { name: 'BEGINNER' },
      update: {},
      create: { name: 'BEGINNER' },
    });

    // 3. Create a test course
    console.log('📖 Creating test course...');
    
    const course = await prisma.course.upsert({
      where: { id: 'test-course-id' },
      update: {},
      create: {
        id: 'test-course-id',
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        instructorId: instructor.id,
        categoryId: category.id,
        difficultyId: difficulty.id,
      },
    });

    // 4. Create modules for the course
    console.log('📝 Creating modules...');
    
    const modules = await Promise.all([
      prisma.module.create({
        data: {
          title: 'Introduction to JavaScript',
          description: 'Basic concepts and setup',
          courseId: course.id,
          order: 1,
        },
      }),
      prisma.module.create({
        data: {
          title: 'Variables and Data Types',
          description: 'Learn about variables and different data types',
          courseId: course.id,
          order: 2,
        },
      }),
      prisma.module.create({
        data: {
          title: 'Functions and Scope',
          description: 'Understanding functions and variable scope',
          courseId: course.id,
          order: 3,
        },
      }),
      prisma.module.create({
        data: {
          title: 'Arrays and Objects',
          description: 'Working with arrays and objects',
          courseId: course.id,
          order: 4,
        },
      }),
    ]);

    // 5. Create materials for each module
    console.log('📄 Creating materials...');
    
    for (const module of modules) {
      await prisma.material.create({
        data: {
          title: `Video for ${module.title}`,
          description: `Video content for ${module.title}`,
          type: 'VIDEO',
          url: 'https://example.com/video.mp4',
          moduleId: module.id,
          order: 1,
          visible: true,
        },
      });
    }

    // 6. Create quizzes for the course
    console.log('🧠 Creating quizzes...');
    
    const quiz1 = await prisma.quiz.create({
      data: {
        title: 'JavaScript Basics Quiz',
        courseId: course.id,
        timeLimit: 30,
      },
    });

    const quiz2 = await prisma.quiz.create({
      data: {
        title: 'Advanced JavaScript Quiz',
        courseId: course.id,
        timeLimit: 45,
      },
    });

    // 7. Create questions for quizzes
    console.log('❓ Creating quiz questions...');
    
    await Promise.all([
      // Questions for Quiz 1
      prisma.question.create({
        data: {
          quizId: quiz1.id,
          text: 'What is JavaScript?',
          type: 'MCQ',
          options: ['A programming language', 'A markup language', 'A styling language', 'A database'],
          answer: 'A programming language',
          order: 1,
        },
      }),
      prisma.question.create({
        data: {
          quizId: quiz1.id,
          text: 'Which keyword is used to declare a variable in JavaScript?',
          type: 'MCQ',
          options: ['var', 'let', 'const', 'All of the above'],
          answer: 'All of the above',
          order: 2,
        },
      }),
      prisma.question.create({
        data: {
          quizId: quiz1.id,
          text: 'JavaScript is a case-sensitive language.',
          type: 'TRUE_FALSE',
          options: ['True', 'False'],
          answer: 'True',
          order: 3,
        },
      }),
      // Questions for Quiz 2
      prisma.question.create({
        data: {
          quizId: quiz2.id,
          text: 'What is closure in JavaScript?',
          type: 'MCQ',
          options: ['A function that has access to variables in its outer scope', 'A way to close browser tabs', 'A method to end loops', 'A type of variable'],
          answer: 'A function that has access to variables in its outer scope',
          order: 1,
        },
      }),
      prisma.question.create({
        data: {
          quizId: quiz2.id,
          text: 'What is the output of: console.log(typeof null)?',
          type: 'MCQ',
          options: ['null', 'undefined', 'object', 'number'],
          answer: 'object',
          order: 2,
        },
      }),
    ]);

    // 8. Enroll student in the course
    console.log('📚 Enrolling student in course...');
    
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId: student.id,
        courseId: course.id,
      },
    });

    console.log('✅ Enrollment created:', enrollment.id);

    // 9. Complete all modules for the student
    console.log('✅ Marking all modules as completed...');
    
    for (const module of modules) {
      await prisma.progress.upsert({
        where: {
          enrollmentId_moduleId: {
            enrollmentId: enrollment.id,
            moduleId: module.id,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          enrollmentId: enrollment.id,
          moduleId: module.id,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    // 10. Complete quizzes with passing scores
    console.log('🎯 Completing quizzes with passing scores...');
    
    // Quiz 1 completion
    const quiz1Attempt = await prisma.quizAttempt.create({
      data: {
        userId: student.id,
        quizId: quiz1.id,
        startedAt: new Date(),
        completedAt: new Date(),
        score: 100, // Perfect score
      },
    });

    await prisma.quizCompletion.create({
      data: {
        userId: student.id,
        quizId: quiz1.id,
        moduleId: modules[0].id, // Link to first module
        score: 100,
        maxScore: 100,
        passed: true,
        completedAt: new Date(),
      },
    });

    // Quiz 2 completion
    const quiz2Attempt = await prisma.quizAttempt.create({
      data: {
        userId: student.id,
        quizId: quiz2.id,
        startedAt: new Date(),
        completedAt: new Date(),
        score: 85, // Passing score
      },
    });

    await prisma.quizCompletion.create({
      data: {
        userId: student.id,
        quizId: quiz2.id,
        moduleId: modules[1].id, // Link to second module
        score: 85,
        maxScore: 100,
        passed: true,
        completedAt: new Date(),
      },
    });

    console.log('✅ Test data seeded successfully!');
    console.log('\n📋 Summary:');
    console.log('- Admin:', admin.email);
    console.log('- Instructor:', instructor.email);
    console.log('- Student:', student.email);
    console.log('- Course:', course.title);
    console.log('- Modules completed:', modules.length);
    console.log('- Quizzes passed:', 2);
    console.log('- Enrollment ID:', enrollment.id);
    console.log('\n🎓 The student has completed all modules and passed all quizzes!');
    console.log('   Certificate should be generated when you check course progress.');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData(); 