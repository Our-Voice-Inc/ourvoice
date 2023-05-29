import gql from 'graphql-tag'

export const REJECT_MODERATION_POST_VERSION_MUTATION = gql`
  mutation RejectModerationPostVersionMutation(
    $id: Int!
    $moderatorHash: String!
    $reason: String!
  ) {
    rejectModerationPostVersion(id: $id, moderatorHash: $moderatorHash, reason: $reason) {
      id
      authorHash
      requiredModerations
      versions {
        id
        title
        content
        categoryIds
        files
        timestamp
        version
        authorHash
        reason
        latest
        moderations {
          id
          decision
          moderatorHash
          reason
          timestamp
        }
      }
    }
  }
`