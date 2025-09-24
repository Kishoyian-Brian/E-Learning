const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enrollNewStudent() {
  try {
    console.log('🎓 Enrolling new student in test course...');
    
    // Get the new student
    const student = await prisma.user.findFirst({
      where: { email: 'devmaxmillianmuiruri@gmail.com' }
    });

    const course = await prisma.course.findFirst({
      where: { id: 'test-course-id' }
    });

    if (!student || !course) {
      console.log('❌ Student or course not found');
      return;
    }

    console.log('✅ Found student:', student.name);
    console.log('✅ Found course:', course.title);

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
      }
    });

    console.log('✅ Created enrollment:', enrollment.id);

    // Get all modules for the course
    const modules = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' }
    });

    console.log(`📝 Found ${modules.length} modules`);

    // Complete all modules
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
      console.log(`✅ Completed module: ${module.title}`);
    }

    // Get all quizzes for the course
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: course.id }
    });

    console.log(`🧠 Found ${quizzes.length} quizzes`);

    // Complete all quizzes with passing scores
    for (const quiz of quizzes) {
      // Create quiz attempt
      const quizAttempt = await prisma.quizAttempt.create({
        data: {
          userId: student.id,
          quizId: quiz.id,
          startedAt: new Date(),
          completedAt: new Date(),
          score: 100, // Perfect score
        },
      });

      // Create quiz completion
      await prisma.quizCompletion.create({
        data: {
          userId: student.id,
          quizId: quiz.id,
          moduleId: modules[0].id, // Link to first module
          score: 100,
          maxScore: 100,
          passed: true,
          completedAt: new Date(),
        },
      });

      console.log(`✅ Completed quiz: ${quiz.title}`);
    }

    console.log('\n🎉 New student enrollment and completion setup complete!');
    console.log('📋 Summary:');
    console.log('- Student:', student.name);
    console.log('- Course:', course.title);
    console.log('- Enrollment ID:', enrollment.id);
    console.log('- Modules completed:', modules.length);
    console.log('- Quizzes passed:', quizzes.length);
    console.log('\n🔗 Now you can test certificate generation with:');
    console.log(`curl -X POST "http://localhost:3000/api/v1/certificates/generate-for-completion/${enrollment.id}" -H "Authorization: Bearer $NEW_STUDENT_TOKEN"`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

enrollNewStudent(); 