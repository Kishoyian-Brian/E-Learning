import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    'Programming',
    'Design',
    'Business',
    'Math',
    'Science',
    'Language',
    'Personal Development',
    'Health & Fitness',
    'Music',
    'Photography',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed difficulty levels
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  for (const name of difficulties) {
    await prisma.difficultyLevel.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
