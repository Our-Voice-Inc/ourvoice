import { defineStore } from 'pinia'
import { apolloClient } from './../graphql/client/index'
import { CREATE_COMMENT_MUTATION } from '@/graphql/mutations/createComment'
import { GET_COMMENTS_QUERY, GET_COMMENTS_BY_POST_ID_QUERY } from '@/graphql/queries/getComments'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'

export interface Comment {
  id: number
  content: string
  votesDown: number
  votesUp: number
  moderated: boolean
  published: boolean
  createdAt: string
  moderatedAt: string
  publishedAt: string
  disabledAt: string
  author: {
    id: number
    nickname: string
  }
  post: {
    id: number
  }
  parent: {
    id: number
    author: {
      id: number
      nickname: string
    }
  }
}
export interface pageInfo {
  endCursor: string
  hasNextPage: boolean
  startCursor: string
}
export interface CommentsState {
  data: Comment[] | undefined
  loading: boolean
  error: Error | undefined
  errorMessage: string | undefined
  pageInfo: pageInfo | undefined
  totalCount: number | undefined
}

provideApolloClient(apolloClient)

export const useCommentsStore = defineStore('comments', {
  state: (): CommentsState => ({
    data: undefined,
    loading: false,
    error: undefined,
    errorMessage: undefined,
    pageInfo: undefined,
    totalCount: undefined
  }),

  getters: {
    getCommentslength(state) {
      return state.data.length
    },

  //   getGroupedComments(state) {
  //     const commentsForPosts: Comment[] = []
  //     const commentsForComments: Comment[] = []
  //     state.data.forEach((c) => {
  //       if (c.parent) {
  //         commentsForComments.push(c)
  //       } else if (c.post) {
  //         commentsForPosts.push(c)
  //       }
  //     })
  //     return [
  //       {
  //         label: 'Comments for Posts',
  //         options: commentsForPosts
  //       },
  //       {
  //         label: 'Comments for Comments',
  //         options: commentsForComments
  //       }
  //     ]
  //   }
  // },

  actions: {
    async fetchComments(postId?: number) {
      const { onResult, onError } = useQuery(GET_COMMENTS_QUERY, {
        filter: postId ? { postId: postId } : null,
        pagination: {
          cursor: null,
          limit: null
        }
      })
      return [
        {
          label: 'Comments for Posts',
          options: commentsForPosts
        },
        {
          label: 'Comments for Comments',
          options: commentsForComments
        }
      ]
    },

    getCommentsByPostId: (state) => (postId: number) => {
      return state.data.filter((c) => c.post?.id === postId)
    }
  },

  actions: {
    async fetchComments() {
      try {
        this.loading = true
        const { data } = await apolloClient.query({ query: GET_COMMENTS_QUERY })

        this.data = data.comments.edges.map((comment: any) => ({
          id: comment.node.id,
          content: comment.node.content,
          votesDown: comment.node.votesDown,
          votesUp: comment.node.votesUp,
          createdAt: comment.node.createdAt,
          authorHash: comment.node.authorHash ?? null,
          authorNickname: comment.node.authorNickname ?? null,
          post: comment.node.post ?? null,
          parent: comment.node.parent ?? null
        }))
        this.loading = false
      } catch (error) {
        if (error instanceof Error) {
          this.error = error
        }

        if (error) {
          this.errorMessage = 'Failed to load comments. Please try again.'
        }
      }
    },

    async createComment({
      content,
      parentId,
      postId,
      authorId
    }: {
      content: string
      postId: number | undefined
      parentId: number | undefined
      authorId: number
    }) {
      try {
        const response = await apolloClient.mutate({
          mutation: CREATE_COMMENT_MUTATION,
          variables: {
            data: {
              content,
              postId,
              parentId,
              authorId
            }
          }
        })
        console.log('response: ', response)
        this.$patch((state) => {
          state.data.push(response?.data.createComment)
        })
      } catch (error) {
        if (error instanceof Error) {
          this.error = error
        }
      }
    },

    async deleteComment(id: number) {
      try {
        const response = await apolloClient.mutate({
          mutation: DELETE_COMMENT_MUTATION,
          variables: {
            deleteCommentId: id
          }
        })
        console.log(response)
      } catch (error) {
        if (error instanceof Error) {
          this.error = error
        }
      }
    },

    async updateComment({
      id,
      data
    }: {
      id: number
      data: {
        content: string
        authorId: number
        published: boolean
        moderated: boolean
      }
    }) {
      try {
        const response = await apolloClient.mutate({
          mutation: UPDATE_COMMENT_MUTATION,
          variables: {
            updateCommentId: id,
            data: {
              content: data.content,
              authorId: data.authorId,
              published: data.published,
              moderated: data.moderated
            }
          }
        })
        console.log(response)
      } catch (error) {
        if (error instanceof Error) {
          this.error = error
        }
      }
    },

    async updateComment(commentId: number) {
      const { onResult, onError } = useQuery(
        GET_COMMENT_BY_ID_QUERY,
        {
          commentId: commentId
        },
        {
          fetchPolicy: 'network-only'
        }
      )

      onResult(({ data, loading }) => {
        this.loading = loading
        if (loading) return
        const comment = this.data.find((comment: any) => comment.id === commentId)
        comment.votesUp = data.comment.votesUp
        comment.votesDown = data.comment.votesDown
      })
      onError((error) => {
        this.error = error
        if (error) {
          this.errorMessage = 'Failed to update comment. Please try again.'
        }
      })
    }
  }
})
