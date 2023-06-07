import { CommentModifyDto } from './dto/comment-modify.dto';
import { Injectable } from '@nestjs/common';
import {
  Comment,
  Prisma,
  CommentVersion,
  CommentModeration,
} from '@internal/prisma/client';
import { PrismaService } from 'src/database/premoderation/prisma.service';
import {
  ModerationCommentPaginationInput,
  ModerationCommentsFilterInput,
} from 'src/graphql';
import { cursorToNumber } from 'src/utils/cursor-pagination';
import { CommentCreateDto } from './dto/comment-create.dto';

function countCommentVersionModerationDecisions(
  version: CommentVersion & {
    moderations: CommentModeration[];
  },
) {
  const groups = version.moderations.reduce((acc, moderation) => {
    const group = moderation.decision;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(moderation);
    return acc;
  }, {});

  const groupsCount = {} as Record<'ACCEPTED' | 'REJECTED', number>;

  if (groups) {
    Object.keys(groups).forEach((key) => {
      groupsCount[key] = groups[key].length;
    });

    return groupsCount;
  }
}

@Injectable()
export class CommentModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getModerationCommentById(id: number): Promise<Comment> {
    return await this.prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          include: {
            versions: { orderBy: { version: 'desc' }, take: 1 },
          },
        },
        versions: {
          orderBy: { version: 'desc' },
          include: {
            moderations: { orderBy: { timestamp: 'desc' } },
          },
        },
      },
    });
  }

  async getModerationComments(
    filter?: ModerationCommentsFilterInput,
    pagination?: ModerationCommentPaginationInput,
  ): Promise<{ totalCount: number; moderationComments: Comment[] }> {
    const { status } = filter ?? {};

    const where: Prisma.CommentWhereInput = {
      versions: {
        some: {
          status: status ?? undefined,
        },
      },
    };

    const totalCount = await this.prisma.comment.count({ where });

    const moderationComments = await this.prisma.comment.findMany({
      where,
      include: { versions: { orderBy: { version: 'desc' } } },
      skip: pagination?.cursor ? 1 : undefined,
      cursor: pagination?.cursor
        ? { id: cursorToNumber(pagination.cursor) }
        : undefined,
      take: pagination?.limit ?? 10,
    });

    return { totalCount, moderationComments };
  }

  async getCommentModerationById(id: number) {
    return await this.prisma.commentModeration.findUnique({
      where: { id },
      include: { commentVersion: true },
    });
  }

  async createModerationComment(data: CommentCreateDto) {
    const { content, postId, parentId, authorHash, authorNickname } = data;

    return await this.prisma.$transaction(async (tx) => {
      let connectData;
      let errorMessage;

      if (postId) {
        console.log('Creating comment for post');
        const post = await tx.post.findFirst({
          where: { postIdInMainDb: postId },
        });
        console.log({ post });
        if (!post) {
          errorMessage = 'Post for comment not found in the moderation DB';
        } else {
          connectData = { post: { connect: { id: post.id } } };
        }
      }

      if (parentId) {
        console.log('Creating comment for comment');
        const parentComment = await tx.comment.findFirst({
          where: { commentIdInMainDb: parentId },
        });
        if (!parentComment) {
          errorMessage =
            'Parent comment for comment not found in the moderation DB';
        } else {
          connectData = { parent: { connect: { id: parentComment.id } } };
        }
      }

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      const newComment = await tx.comment.create({
        data: {
          authorHash,
          authorNickname,
          ...connectData,
        },
      });

      await tx.commentVersion.create({
        data: {
          content,
          authorHash,
          authorNickname,
          status: 'PENDING',
          comment: { connect: { id: newComment.id } },
          latest: true,
          version: 1,
        },
      });

      return newComment;
    });
  }

  async getCommentVersionById(id: number) {
    return await this.prisma.commentVersion.findUnique({
      where: { id },
      include: { moderations: { orderBy: { timestamp: 'desc' } } },
    });
  }

  async approveCommentVersion(
    id: number,
    moderatorHash: string,
    moderatorNickname: string,
    reason: string,
  ) {
    const newCommentModeration = await this.prisma.$transaction(async (tx) => {
      // Create a new comment moderation entry
      const newCommentModeration = await tx.commentModeration.create({
        data: {
          moderatorHash,
          moderatorNickname,
          decision: 'ACCEPTED',
          reason,
          commentVersionId: id,
        },
        select: { commentVersion: { select: { commentId: true } } },
      });

      // Ensure that another moderator hasn't created a new version (modified) for the comment, or else we'll rollback
      const commentVersion = await tx.commentVersion.findUnique({
        where: { id },
      });

      if (!commentVersion.latest) {
        throw new Error('Comment version is not the latest');
      }

      return newCommentModeration;
    });

    // Return the new comment
    const commentId = newCommentModeration.commentVersion.commentId;
    return await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          include: { moderations: { orderBy: { timestamp: 'desc' } } },
        },
      },
    });
  }

  async rejectCommentVersion(
    id: number,
    moderatorHash: string,
    moderatorNickname: string,
    reason: string,
  ) {
    const newCommentModeration = await this.prisma.$transaction(async (tx) => {
      // Create a new comment moderation entry
      const newCommentModeration = await tx.commentModeration.create({
        data: {
          moderatorHash,
          moderatorNickname,
          decision: 'REJECTED',
          reason,
          commentVersionId: id,
        },
        select: { commentVersion: { select: { commentId: true } } },
      });

      // Ensure that another moderator hasn't created a new version (modified) for the comment, or else we'll rollback
      const commentVersion = await tx.commentVersion.findUnique({
        where: { id },
      });

      if (!commentVersion.latest) {
        throw new Error('Comment version is not the latest');
      }

      return newCommentModeration;
    });

    // Return the new comment
    const commentId = newCommentModeration.commentVersion.commentId;
    return await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          include: { moderations: { orderBy: { timestamp: 'desc' } } },
        },
      },
    });
  }

  async modifyModerationComment(
    commentId: number,
    moderatorHash: string,
    moderatorNickname: string,
    reason: string,
    data: CommentModifyDto,
  ) {
    const modifiedModerationComment = await this.prisma.$transaction(
      async (tx) => {
        // Fetch the current comment with the latest version
        const {
          versions: [latestVersion],
        } = await tx.comment.findUnique({
          where: { id: commentId },
          include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
        });

        // Update latest field of latest comment version to false
        await tx.commentVersion.update({
          where: { id: latestVersion.id },
          data: { latest: false },
        });

        // Create a new CommentVersion
        const newCommentVersion = await tx.commentVersion.create({
          data: {
            content: data.content ?? latestVersion.content,
            authorHash: moderatorHash,
            authorNickname: moderatorNickname,
            status: 'PENDING',
            comment: { connect: { id: commentId } },
            reason,
            version: latestVersion.version + 1,
            latest: true,
          },
        });

        // Fetch the latest version to validate
        const latestCommentVersion = await tx.commentVersion.findFirst({
          where: { commentId: commentId },
          orderBy: { version: 'desc' },
        });

        // Ensure that the latest comment version is ours
        if (latestCommentVersion.id !== newCommentVersion.id) {
          throw new Error('Comment version is not the latest');
        }

        // Fetch the updated comment
        return await tx.comment.findUnique({
          where: { id: commentId },
          include: {
            versions: {
              orderBy: { version: 'desc' },
              include: { moderations: { orderBy: { timestamp: 'desc' } } },
            },
          },
        });
      },
    );

    return modifiedModerationComment;
  }

  async renewCommentModeration(id: number, moderatorHash: string) {
    const renewedCommentId = await this.prisma.$transaction(async (tx) => {
      // Fetch the commentModeration and related comment
      const commentModeration = await tx.commentModeration.findUnique({
        where: { id },
        include: { commentVersion: true },
      });

      if (!commentModeration) {
        throw new Error('CommentModeration not found');
      }

      if (commentModeration.moderatorHash !== moderatorHash) {
        throw new Error('Moderator hash does not match');
      }

      const commentId = commentModeration.commentVersion.commentId;

      // Delete the commentModeration
      await tx.commentModeration.delete({ where: { id } });

      return commentId;
    });

    // Fetch the comment with its versions and moderations
    return await this.prisma.comment.findUnique({
      where: { id: renewedCommentId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          include: { moderations: { orderBy: { timestamp: 'desc' } } },
        },
      },
    });
  }

  async publishComment(commentId: number) {
    await this.prisma.$transaction(async (tx) => {
      // Check if the comment has enough number of moderations
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        include: {
          versions: {
            include: { moderations: { orderBy: { timestamp: 'desc' } } },
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      });

      const latestVersion = comment.versions[0];
      const decisionsCount =
        countCommentVersionModerationDecisions(latestVersion);

      if (!decisionsCount) {
        throw new Error('Comment has no moderations');
      }

      if (decisionsCount.REJECTED > 0) {
        throw new Error(`Comment has ${decisionsCount.REJECTED} rejections`);
      }

      if (decisionsCount.ACCEPTED >= comment.requiredModerations) {
        await tx.comment.update({
          where: { id: commentId },
          data: { status: 'APPROVED' },
        });
        // TODO: Add as a new comment entry in the main db
      }
      console.log(decisionsCount);
    });
  }
}
