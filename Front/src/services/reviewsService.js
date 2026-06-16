import apiClient from './api'

export const reviewsService = {
  createReview: async (bookId, rating, content) => {
    try {
      const response = await apiClient.post('/reviews', {
        bookId,
        rating,
        content
      })
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to create review'
    }
  },

  getBookReviews: async (bookId) => {
    try {
      const response = await apiClient.get(`/reviews/book/${bookId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch reviews'
    }
  },

  getMyReviews: async () => {
    try {
      const response = await apiClient.get('/reviews/my')
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch your reviews'
    }
  },

  updateReview: async (reviewId, rating, content) => {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}`, {
        rating,
        content
      })
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to update review'
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to delete review'
    }
  }
}
