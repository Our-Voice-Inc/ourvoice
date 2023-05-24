import { PrismaClient, Decision, PostStatus } from '@internal/prisma/client';

const prisma = new PrismaClient();

function getRandomSelection(arr: number[]): number[] {
  const count = Math.floor(Math.random() * 2) + 1;
  const shuffled = [...arr];

  for (let i = arr.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [shuffled[i - 1], shuffled[j]] = [shuffled[j], shuffled[i - 1]];
  }
  return shuffled.slice(0, count);
}

function generateVersions(
  i: number,
  postStatuses: ('REJECTED' | 'APPROVED' | 'PENDING')[],
) {
  const numVersions = Math.floor(Math.random() * 4) + 2; // Random integer between 2 and 5 inclusive
  const versions = Array(numVersions)
    .fill({})
    .map((_, versionIndex) => ({
      title: `Post ${i + 1}`,
      content:
        `This is the content of post ${i + 1}` +
        (versionIndex > 0 ? `. This is version ${versionIndex + 1}` : ''),
      categoryIds: getRandomSelection([1, 2, 3, 4, 5]),
      status: postStatuses[i % postStatuses.length],
      version: versionIndex + 1,
      latest: versionIndex === numVersions - 1, // Mark the last version as the latest
      timestamp: new Date(`2023-04-${13 + i}T10:00:00Z`),
    }));

  return versions;
}

async function clearDatabase() {
  console.log('Clearing database...');
  await prisma.commentModeration.deleteMany();
  await prisma.commentVersion.deleteMany();
  await prisma.postModeration.deleteMany();
  await prisma.postVersion.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();

  await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "PostVersion_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "CommentVersion_id_seq" RESTART WITH 1;`;
}

async function main() {
  const userHashes = [
    'user1hash',
    'user2hash',
    'user3hash',
    'user4hash',
    'user5hash',
  ];
  const decisions = [Decision.ACCEPTED, Decision.REJECTED];
  const postStatuses = [
    PostStatus.APPROVED,
    PostStatus.PENDING,
    PostStatus.REJECTED,
  ];

  for (let i = 0; i < 10; i++) {
    // Create posts
    const post = await prisma.post.create({
      data: {
        authorHash: userHashes[i % userHashes.length],
        status: postStatuses[i % postStatuses.length],
        versions: {
          create: generateVersions(i, postStatuses),
        },
      },
    });

    // Create comments
    const comment = await prisma.comment.create({
      data: {
        authorHash: userHashes[(i + 1) % userHashes.length],
        post: { connect: { id: post.id } },
        versions: {
          create: {
            content: `This is a comment on post ${i + 1}`,
            status: postStatuses[(i + 1) % postStatuses.length],
            version: i,
            latest: true,
            timestamp: new Date(`2023-04-${13 + i}T10:30:00Z`),
          },
        },
      },
    });

    // Create post moderations
    await prisma.postModeration.create({
      data: {
        postVersionId: post.id,
        moderatorHash: userHashes[(i + 2) % userHashes.length],
        decision: decisions[i % decisions.length],
        reason: `Moderation reason for post ${i + 1}`,
      },
    });

    // Create comment moderations
    await prisma.commentModeration.create({
      data: {
        commentVersionId: comment.id,
        moderatorHash: userHashes[(i + 2) % userHashes.length],
        decision: decisions[i % decisions.length],
        reason: `Moderation reason for comment on post ${i + 1}`,
      },
    });
  }

  await prisma.$disconnect();
  console.log('Seeding completed.');
}

async function run() {
  await clearDatabase();
  await main();
}

run();
