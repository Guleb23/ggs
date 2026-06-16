import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { booksService } from '../services/booksService'
import { BookCard } from '../components/BookCard'
import { Loader, ArrowRight, Star, TrendingUp, Sparkles, BookOpen } from 'lucide-react'

export const Home = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('random')

  useEffect(() => {
    fetchBooks()
  }, [activeTab])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      let data

      if (activeTab === 'random') {
        data = await booksService.getRandomBooks(8)
      } else if (activeTab === 'mostReviewed') {
        data = await booksService.getMostReviewedBooks(8)
      } else {
        data = await booksService.getRecommendedBooks(8)
      }

      setBooks(data)
    } catch (err) {
      setError(err.message || 'Не удалось загрузить книги')
    } finally {
      setLoading(false)
    }
  }

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'random': return 'Случайные книги'
      case 'mostReviewed': return 'Самые обсуждаемые'
      case 'recommended': return 'Рекомендации'
      default: return 'Книги'
    }
  }

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'random': return <Sparkles size={18} className="mr-2" />
      case 'mostReviewed': return <TrendingUp size={18} className="mr-2" />
      case 'recommended': return <Star size={18} className="mr-2" />
      default: return <BookOpen size={18} className="mr-2" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Херо секция */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <BookOpen size={32} className="text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Добро пожаловать в <span className="text-yellow-300">ЧитайТоп</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Откройте для себя удивительный мир литературы, делитесь впечатлениями
              и находите новые книги для чтения вместе с нашим сообществом
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/books"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-2xl"
              >
                Все книги
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all border border-white/30"
              >
                Присоединиться
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">1,500+</div>
            <div className="text-gray-600">Книг в коллекции</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">5,000+</div>
            <div className="text-gray-600">Читателей</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">12,000+</div>
            <div className="text-gray-600">Отзывов</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
            <div className="text-gray-600">Средний рейтинг</div>
          </div>
        </div>

        {/* Заголовок и табы */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {getTabTitle(activeTab)}
            </h2>
            <p className="text-gray-600">
              Подборка книг, которые сейчас обсуждают читатели
            </p>
          </div>

          <Link
            to="/books"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold group"
          >
            Все книги
            <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Табы */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['random', 'mostReviewed', 'recommended'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center px-5 py-3 rounded-xl font-medium transition-all ${activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              {getTabIcon(tab)}
              {getTabTitle(tab)}
            </button>
          ))}
        </div>

        {/* Состояния загрузки */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Загрузка книг...</p>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
            <button
              onClick={fetchBooks}
              className="ml-auto text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
            >
              Повторить
            </button>
          </div>
        )}

        {/* Сетка книг */}
        {!loading && !error && books.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Кнопка показать все */}
            <div className="text-center mt-12">
              <Link
                to="/books"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl group"
              >
                <BookOpen size={20} className="mr-2" />
                Показать все книги
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">Книги не найдены</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Попробуйте выбрать другую категорию или добавьте свои книги
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <ArrowRight size={20} className="mr-2" />
              Перейти ко всем книгам
            </Link>
          </div>
        )}

        {/* Рекомендации и особенности */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Почему выбирают ЧитайТоп?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Мы создали платформу, где каждый читатель может найти что-то особенное
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Star size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Честные отзывы</h3>
              <p className="text-gray-600">
                Читайте реальные мнения читателей, делитесь своими впечатлениями
                и находите книги, которые действительно стоят вашего времени
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Персональные рекомендации</h3>
              <p className="text-gray-600">
                Система анализирует ваши предпочтения и предлагает книги,
                которые точно вам понравятся
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Сообщество читателей</h3>
              <p className="text-gray-600">
                Общайтесь с единомышленниками, обсуждайте книги и открывайте
                новые литературные миры вместе
              </p>
            </div>
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Готовы начать читать?</h2>
            <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
              Присоединяйтесь к нашему сообществу уже сегодня и откройте
              для себя мир удивительных книг и интересных обсуждений
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-lg"
              >
                Создать аккаунт
              </Link>
              <Link
                to="/books"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all border border-white/30"
              >
                Начать чтение
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}