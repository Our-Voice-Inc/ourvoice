import gql from 'graphql-tag'

export const GET_MODERATION_COMMENT_BY_ID_QUERY = gql`
  query GetModerationCommentById($moderationCommentId: Int!) {
    moderationComment(id: $moderationCommentId) {
      id
      authorHash
      authorNickname
      requiredModerations
      post {
        id
        authorHash
        authorNickname
        versions {
          id
          title
          content
          categoryIds
          files
          timestamp
          authorHash
          authorNickname
        }
      }
      versions {
        id
        content
        timestamp
        version
        authorHash
        authorNickname
        reason
        latest
        status
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
`
