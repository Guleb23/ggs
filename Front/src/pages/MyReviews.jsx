import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Edit2, Trash2, BookOpen, Calendar, ArrowLeft, Quote, Clock, TrendingUp, MessageSquare } from 'lucide-react'
import { reviewsService } from '../services/reviewsService'

export const MyReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editContent, setEditContent] = useState('')
  const [successMsg, setSuccessMsg] = useState(null)

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
      setError(err.message || 'Не удалось загрузить отзывы')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReview = async (id) => {
    if (!editContent.trim()) {
      setError('Текст отзыва не может быть пустым')
      return
    }
    try {
      await reviewsService.updateReview(id, editRating, editContent)
      setEditingId(null)
      setEditContent('')
      setEditRating(5)
      setSuccessMsg('✅ Отзыв обновлён!')
      setTimeout(() => setSuccessMsg(null), 3000)
      await fetchMyReviews()
    } catch (err) {
      setError(err.message || 'Не удалось обновить отзыв')
    }
  }

  const handleDeleteReview = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await reviewsService.deleteReview(id)
        setSuccessMsg('🗑 Отзыв удалён.')
        setTimeout(() => setSuccessMsg(null), 3000)
        await fetchMyReviews()
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('ru-RU', options)
  }

  const getRatingColor = (rating) => {
    if (rating >= 5) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' }
    if (rating >= 4) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' }
    if (rating >= 3) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-yellow-500' }
    if (rating >= 2) return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'bg-orange-500' }
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500' }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero секция */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 relative z-10">
          <Link to="/" className="inline-flex items-center text-purple-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-1" />
            На главную
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Мои отзывы</h1>
              <p className="text-purple-200 text-lg mt-1">
                {reviews.length > 0
                  ? `Вы оставили ${reviews.length} ${reviews.length === 1 ? 'отзыв' : 'отзывов'}`
                  : 'Поделитесь своим мнением о книгах'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {/* Статистика */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-5 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{reviews.length}</div>
              <div className="text-sm text-gray-500">Отзывов</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-1">{avgRating}</div>
              <div className="text-sm text-gray-500">Средний рейтинг</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-500">Высоких оценок</div>
            </div>
          </div>
        )}

        {/* Уведомления */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl mb-4 flex items-center shadow-sm animate-pulse">
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-4 flex items-center justify-between shadow-sm">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-xl ml-4">✕</button>
          </div>
        )}

        {/* Загрузка */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-gray-500 mt-6 text-lg">Загрузка ваших отзывов...</p>
          </div>
        )}

        {/* Пустое состояние */}
        {!loading && reviews.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Quote size={48} className="text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">У вас пока нет отзывов</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
              Прочитайте интересную книгу и поделитесь своими впечатлениями — ваше мнение поможет другим читателям
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <BookOpen size={22} className="mr-2" />
              Выбрать книгу для отзыва
            </Link>
          </div>
        )}

        {/* Список отзывов */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-6 pb-12">
            {reviews.map((review, idx) => {
              const rc = getRatingColor(review.rating)
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Шапка с книгой */}
                  <Link to={`/book/${review.bookId}`} className="block">
                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-5 border-b border-gray-100 group-hover:from-indigo-100 group-hover:via-purple-100 group-hover:to-pink-100 transition-all duration-300">
                      <div className="flex items-center space-x-5">
                        {/* Обложка */}
                        <div className="relative flex-shrink-0">
                          {review.bookCoverUrl ? (
                            <div className="w-16 h-24 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                              <img
                                src={review.bookCoverUrl}
                                alt={review.bookTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-xl flex items-center justify-center shadow-md">
                              <BookOpen size={28} className="text-indigo-600" />
                            </div>
                          )}
                          {/* Бейдж рейтинга на обложке */}
                          <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${rc.bar}`}>
                            {review.rating}
                          </div>
                        </div>
                        {/* Инфо о книге */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                            {review.bookTitle || `Книга #${review.bookId}`}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {formatDate(review.createdAt)}
                            </span>
                            {review.updatedAt && (
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                Обновлён
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Стрелка */}
                        <div className="text-gray-300 group-hover:text-indigo-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {editingId === review.id ? (
                    /* Режим редактирования */
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Ваша оценка</label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setEditRating(r)}
                              className={`transition-all duration-150 hover:scale-110 ${editRating >= r ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                            >
                              <Star size={36} fill={editRating >= r ? "currentColor" : "none"} />
                            </button>
                          ))}
                          <span className="ml-3 text-lg font-bold text-gray-700 self-center">{editRating}/5</span>
                        </div>
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
                        placeholder="Ваш отзыв..."
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                        >
                          💾 Сохранить
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-8 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition font-semibold"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Просмотр отзыва */
                    <div className="p-6">
                      {/* Рейтинг и действия */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star
                                key={i}
                                size={20}
                                className={`transition-all ${i <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                                  : 'text-gray-200'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${rc.text} ${rc.bg} ${rc.border} border`}>
                            {review.rating}/5
                          </span>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => startEdit(review)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                            title="Редактировать"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                            title="Удалить"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Текст отзыва */}
                      <div className="relative">
                        <Quote size={24} className="absolute -top-1 -left-1 text-gray-200" />
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line pl-8 italic">
                          {review.content}
                        </p>
                      </div>

                      {/* Нижняя панель */}
                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-400">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(review.createdAt)}
                          </span>
                          {review.updatedAt && (
                            <span className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              Обновлено
                            </span>
                          )}
                        </div>
                        {/* Кнопки на мобильных всегда видны */}
                        <div className="flex space-x-1 sm:hidden">
                          <button
                            onClick={() => startEdit(review)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}