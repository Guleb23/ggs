import apiClient from './api'

export const booksService = {
  getRandomBooks: async (count = 12) => {
    try {
      const response = await apiClient.get(`/books/random?count=${count}`)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch books'
    }
  },
  addBook: async (data) => {
    try {
      const response = await apiClient.post(`/books/add`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch books'
    }
  },
  getAll: async () => {
    try {
      const response = await apiClient.get(`/books`)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch books'
    }
  },
  getDetail: async (id) => {
    try {
      const response = await apiClient.get(`/books/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch books'
    }
  },

  getMostReviewedBooks: async (count = 10) => {
    try {
      const response = await apiClient.get(`/books/most-reviewed?count=${count}`)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch most reviewed books'
    }
  },

  getRecommendedBooks: async (count = 12) => {
    try {
      const response = await apiClient.get(`/books/recommended?count=${count}`)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Failed to fetch recommended books'
    }
  }
}
