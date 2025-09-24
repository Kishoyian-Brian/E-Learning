import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  const difficulties = await prisma.difficultyLevel.findMany();

  console.log('Categories:');
  categories.forEach(cat => {
    console.log(`  ${cat.name}: ${cat.id}`);
  });

  console.log('\nDifficulty Levels:');
  difficulties.forEach(diff => {
    console.log(`  ${diff.name}: ${diff.id}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 