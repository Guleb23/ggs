import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Send, Trash2, Edit2, BookOpen, User, Calendar, Clock, Heart, Share2, ChevronLeft, Bookmark } from 'lucide-react'
import { reviewsService } from '../services/reviewsService'
import { booksService } from '../services/booksService' // Предполагаем, что есть такой сервис
import { useAuth } from '../context/AuthContext'

export const BookDetail = () => {
  const { bookId } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookLoading, setBookLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editContent, setEditContent] = useState('')
  const [liked, setLiked] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    fetchBookData()
    fetchReviews()
  }, [bookId])

  const fetchBookData = async () => {
    try {
      setBookLoading(true)
      const data = await booksService.getDetail(bookId) // Используем ваш метод getDetail
      setBook(data)
      setError(null)
    } catch (err) {
      setError('Не удалось загрузить информацию о книге')
      console.error('Error fetching book:', err)
    } finally {
      setBookLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewsService.getBookReviews(bookId)
      setReviews(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Не удалось загрузить отзывы')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Текст отзыва не может быть пустым')
      return
    }

    try {
      setSubmitting(true)
      await reviewsService.createReview(parseInt(bookId), rating, content)
      setContent('')
      setRating(5)
      await fetchReviews()
    } catch (err) {
      setError(err.message || 'Не удалось отправить отзыв')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateReview = async (id) => {
    if (!editContent.trim()) {
      setError('Текст отзыва не может быть пустым')
      return
    }

    try {
      setSubmitting(true)
      await reviewsService.updateReview(id, editRating, editContent)
      setEditingId(null)
      setEditContent('')
      setEditRating(5)
      await fetchReviews()
    } catch (err) {
      setError(err.message || 'Не удалось обновить отзыв')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await reviewsService.deleteReview(id)
        await fetchReviews()
      } catch (err) {
        setError(err.message || 'Не удалось удалить отзыв')
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // Здесь можно добавить запрос к API для добавления/удаления из избранного
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50'
    if (rating >= 4.0) return 'text-blue-600 bg-blue-50'
    if (rating >= 3.0) return 'text-yellow-600 bg-yellow-50'
    if (rating >= 2.0) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('ru-RU', options)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Кнопка назад */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Назад к книгам</span>
        </Link>

        {/* Шапка с информацией о книге */}
        {bookLoading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Загрузка информации о книге...</p>
          </div>
        ) : book ? (
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                {/* Обложка книги */}
                <div className="md:w-1/3 p-8">
                  <div className="relative">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://via.placeholder.com/300x400?text=Нет+обложки'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                          <BookOpen size={64} className="text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => setLiked(!liked)}
                        className={`p-2 rounded-full shadow-lg ${liked ? 'bg-red-100 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                        title={liked ? "Убрать лайк" : "Поставить лайк"}
                      >
                        <Heart size={20} fill={liked ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={toggleFavorite}
                        className={`p-2 rounded-full shadow-lg ${isFavorite ? 'bg-yellow-100 text-yellow-500' : 'bg-white text-gray-400 hover:text-yellow-500'}`}
                        title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                      >
                        <Bookmark size={20} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Информация о книге */}
                <div className="md:w-2/3 p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                      <div className={`px-3 py-1 rounded-full ${getRatingColor(book.averageRating || 0)} font-bold`}>
                        {(book.averageRating || 0).toFixed(1)} ★
                      </div>
                    </div>

                    <p className="text-xl text-gray-700 mb-4 flex items-center">
                      <User size={20} className="mr-2 text-gray-400" />
                      {book.author || 'Автор не указан'}
                    </p>

                    {book.genre && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {book.genre.split(',').map((genre, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {genre.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {book.description || 'Описание книги отсутствует.'}
                    </p>
                  </div>

                  {/* Детали книги */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Рейтинг</p>
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-bold text-lg">{(book.averageRating || 0).toFixed(1)}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({book.reviewCount || 0})
                        </span>
                      </div>
                    </div>

                    {book.pages && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Страниц</p>
                        <p className="font-bold text-lg">{book.pages}</p>
                      </div>
                    )}

                    {book.publishedYear && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Год издания</p>
                        <p className="font-bold text-lg">{book.publishedYear}</p>
                      </div>
                    )}

                    {book.publisher && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Издательство</p>
                        <p className="font-bold text-lg truncate">{book.publisher}</p>
                      </div>
                    )}

                    {book.isbn && (
                      <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
                        <p className="text-sm text-gray-500 mb-1">ISBN</p>
                        <p className="font-bold text-lg font-mono">{book.isbn}</p>
                      </div>
                    )}

                    {book.language && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Язык</p>
                        <p className="font-bold text-lg">{book.language}</p>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl text-center">
            <p className="text-lg mb-2">Ошибка загрузки книги</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchBookData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Попробовать снова
            </button>
          </div>
        ) : null}

        {/* Основное содержимое - отзывы */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма добавления отзыва */}
          <div className="lg:col-span-1">
            {isAuthenticated && (
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Send size={20} className="mr-2 text-blue-600" />
                  Ваш отзыв
                </h2>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Ваша оценка
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRating(r)}
                          className={`transition-transform ${rating >= r ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <Star size={36} fill={rating >= r ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-sm font-semibold text-gray-700">{rating}.0 из 5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Текст отзыва
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Поделитесь своими впечатлениями о книге..."
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 resize-none"
                      disabled={submitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Опубликовать отзыв</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Список отзывов */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Отзывы читателей
                      <span className="text-gray-500 text-lg ml-2">({reviews.length})</span>
                    </h2>
                    <p className="text-gray-600 mt-1">Мнения реальных читателей о книге</p>
                  </div>
                  {book && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {(book.averageRating || 0).toFixed(1)}
                        <span className="text-yellow-400">★</span>
                      </div>
                      <p className="text-sm text-gray-500">Средняя оценка</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="m-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}

              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-500 mt-4">Загрузка отзывов...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Отзывов пока нет</h3>
                  <p className="text-gray-500">Будьте первым, кто поделится своим мнением!</p>
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Войти, чтобы оставить отзыв
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map(review => (
                    <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                      {editingId === review.id ? (
                        <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Изменить оценку
                            </label>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map(r => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => setEditRating(r)}
                                  className={`transition-transform ${editRating >= r ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  <Star size={32} fill={editRating >= r ? "currentColor" : "none"} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleUpdateReview(review.id)}
                              disabled={submitting}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:from-gray-400 disabled:to-gray-400"
                            >
                              Сохранить изменения
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {review.userName ? review.userName.charAt(0).toUpperCase() : 'Ч'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {review.userName || 'Читатель'}
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    {formatDate(review.createdAt)}
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <Star size={12} className="mr-1 text-yellow-400 fill-yellow-400" />
                                    {review.rating}.0
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isAuthenticated && user?.username === review.userName && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEdit(review)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Редактировать"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Удалить"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                            {review.content}
                          </p>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 hover:text-blue-600 transition">
                                <span>👍</span>
                                <span>Полезно</span>
                              </button>
                              <button className="flex items-center space-x-1 hover:text-blue-600 transition">
                                <span>💬</span>
                                <span>Ответить</span>
                              </button>
                            </div>
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              {new Date(review.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}