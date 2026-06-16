import React from 'react'
import { Link } from 'react-router-dom'
import { Star, BookOpen } from 'lucide-react'

export const BookCard = ({ book }) => {
  const avgRating = book.averageRating || 0
  const reviewCount = book.reviewCount || 0

  // Функция для генерации цветов на основе рейтинга
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'from-green-500 to-emerald-600'
    if (rating >= 4.0) return 'from-green-400 to-green-600'
    if (rating >= 3.0) return 'from-yellow-400 to-yellow-600'
    if (rating >= 2.0) return 'from-orange-400 to-orange-600'
    return 'from-red-400 to-red-600'
  }

  // Функция для склонения слова "отзыв"
  const getReviewText = (count) => {
    if (count === 0) return 'нет отзывов'
    if (count === 1) return `${count} отзыв`
    if (count >= 2 && count <= 4) return `${count} отзыва`
    return `${count} отзывов`
  }

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden">
      {/* Обложка книги с градиентом при наведении */}
      <div className="h-72 relative overflow-hidden">
        {book.coverUrl ? (
          <>
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen size={32} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-white">📚</span>
              </div>
            </div>
            <p className="text-gray-600 text-center px-4">Нет обложки</p>
          </div>
        )}

        {/* Рейтинг в углу обложки */}

      </div>

      {/* Контент карточки */}
      <div className="p-5">
        {/* Заголовок и автор */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {book.author || 'Автор не указан'}
          </p>
        </div>

        {/* Описание */}
        {book.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
            {book.description}
          </p>
        )}

        {/* Информация об отзывах */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={`${star <= Math.round(avgRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {getReviewText(reviewCount)}
          </span>
        </div>

        {/* Кнопка деталей */}
        <Link
          to={`/book/${book.id}`}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform group-hover:shadow-lg font-medium text-center block"
        >
          Подробнее о книге
        </Link>
      </div>

      {/* Декоративный элемент снизу */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}