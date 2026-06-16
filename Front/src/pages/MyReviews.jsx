import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Edit2, Trash2 } from 'lucide-react'
import { reviewsService } from '../services/reviewsService'

export const MyReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchMyReviews()
  }, [])

  const fetchMyReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewsService.getMyReviews()
      setReviews(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReview = async (id) => {
    if (!editContent.trim()) {
      setError('Review content cannot be empty')
      return
    }

    try {
      await reviewsService.updateReview(id, editRating, editContent)
      setEditingId(null)
      setEditContent('')
      setEditRating(5)
      await fetchMyReviews()
    } catch (err) {
      setError(err.message || 'Failed to update review')
    }
  }

  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsService.deleteReview(id)
        await fetchMyReviews()
      } catch (err) {
        setError(err.message || 'Failed to delete review')
      }
    }
  }

  const startEdit = (review) => {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditContent(review.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
    setEditRating(5)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reviews</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>You haven't written any reviews yet.</p>
            <Link to="/" className="text-blue-600 hover:underline">
              Explore books and write your first review!
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow">
                {editingId === review.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setEditRating(r)}
                            className={`transition ${editRating >= r ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                          >
                            <Star size={32} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateReview(review.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Book ID: {review.bookId}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.rating}/5</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(review)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{review.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
