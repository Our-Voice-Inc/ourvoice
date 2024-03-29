import { PrismaClient } from '@prisma-main-db/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.NODE_ENV === 'test'
          ? process.env.DATABASE_MAIN_TEST_URL ||
            'postgresql://your_db_user:your_db_password@127.0.0.1:5436/ourvoice_db_test'
          : process.env.DATABASE_MAIN_URL ||
            'postgresql://your_db_user:your_db_password@127.0.0.1:5433/ourvoice_db?schema=ourvoice&sslmode=prefer',
    },
  },
});

async function clearDatabase() {
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();

  await prisma.$executeRaw`ALTER SEQUENCE "Vote_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Category_id_seq" RESTART WITH 1;`;
}

async function main() {
  const seedDataPath = join(__dirname, 'seed-data.json');
  const seedData = JSON.parse(readFileSync(seedDataPath, 'utf-8'));

  // Categories
  const categoryData = seedData.categories;
  const categories = [];
  for (const data of categoryData) {
    const category = await prisma.category.create({
      data: {
        ...data,
        parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
      },
    });
    categories.push(category);
  }

  // Posts
  const postData = seedData.posts;
  const posts = [];
  for (const data of postData) {
    const categoriesToConnect = data.categories
      ? data.categories.map((categoryId) => {
          return { id: categoryId };
        })
      : [];
    const post = await prisma.post.create({
      data: {
        ...data,
        categories: {
          connect: categoriesToConnect,
        },
      },
    });
    posts.push(post);
  }

  // Comments
  const commentData = seedData.comments;
  const comments = [];
  for (const data of commentData) {
    const post = posts.find((post) => post.id === data.postId);
    const parentComment = comments.find(
      (comment) => comment.id === data.parentId,
    );

    delete data.postId;
    delete data.parentId;
    const comment = await prisma.comment.create({
      data: {
        ...data,
        post: post ? { connect: { id: post.id } } : undefined,
        parent: parentComment
          ? { connect: { id: parentComment.id } }
          : undefined,
      },
    });
    comments.push(comment);
  }

  // Votes
  const voteData = seedData.votes;
  for (const data of voteData) {
    const post = posts.find((post) => post.id === data.postId);

    delete data.postId;
    await prisma.vote.create({
      data: {
        ...data,
        post: { connect: { id: post.id } },
      },
    });
  }
}

export const seedMainDb = async () => {
  await clearDatabase();
  await main();
};

// Uncomment to run this manually. Remember to comment it out again as it is being used by the integration test
// seedMainDb();
