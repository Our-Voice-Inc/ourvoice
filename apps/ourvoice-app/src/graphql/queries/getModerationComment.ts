import { graphql } from '../generated/gql'

export const GET_MODERATION_COMMENT_BY_ID_QUERY = graphql(`
  query GetModerationCommentById($moderationCommentId: Int!) {
    moderationComment(id: $moderationCommentId) {
      id
      authorHash
      authorNickname
      requiredModerations
      status
      post {
        id
        authorHash
        authorNickname
        requiredModerations
        status
        versions {
          id
          title
          content
          categoryIds
          files
          timestamp
          version
          authorHash
          authorNickname
          latest
          hasContentWarning
          hasFromTheModeratorsTag
          moderations {
            id
            decision
            moderatorHash
            moderatorNickname
            reason
            timestamp
          }
        }
      }
      parent {
        id
        authorHash
        authorNickname
        requiredModerations
        versions {
          id
          content
          timestamp
          version
          authorHash
          authorNickname
          hasContentWarning
          hasFromTheModeratorsTag
          reason
          latest
        }
      }
      versions {
        id
        content
        timestamp
        version
        authorHash
        authorNickname
        hasContentWarning
        hasFromTheModeratorsTag
        reason
        latest
        moderations {
          id
          decision
          moderatorHash
          moderatorNickname
          reason
          timestamp
        }
      }
    }
  }
`)
