import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookCard } from '../components/BookCard'
import { Plus, Search, Filter, Grid, List, Loader, Star } from 'lucide-react'
import { booksService } from '../services/booksService'

export const BooksList = () => {
    const { isAuthenticated } = useAuth()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGenre, setSelectedGenre] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [viewMode, setViewMode] = useState('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const booksPerPage = 12

    const genres = [
        'all', 'Фантастика', 'Фэнтези', 'Детектив', 'Роман',
        'Научная литература', 'Биография', 'История', 'Поэзия'
    ]

    const sortOptions = [
        { value: 'newest', label: 'Новые' },
        { value: 'oldest', label: 'Старые' },
        { value: 'rating', label: 'По рейтингу' },
        { value: 'title', label: 'По названию' }
    ]

    useEffect(() => {
        fetchBooks()
    }, [currentPage, selectedGenre, sortBy])

    const fetchBooks = async () => {
        try {
            setLoading(true)
            // В реальном приложении здесь будет запрос с пагинацией и фильтрами
            const data = await booksService.getAll()
            setBooks(data)
            setTotalPages(Math.ceil(data.length / booksPerPage))
            setError(null)
        } catch (err) {
            setError('Не удалось загрузить книги')
            console.error('Error fetching books:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        // Здесь будет логика поиска
        fetchBooks()
    }

    const filteredBooks = books.filter(book => {
        // Фильтрация по поисковому запросу
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                (book.description && book.description.toLowerCase().includes(query))
            )
        }

        // Фильтрация по жанру
        if (selectedGenre !== 'all' && book.genre) {
            return book.genre.toLowerCase().includes(selectedGenre.toLowerCase())
        }

        return true
    })

    const sortedBooks = [...filteredBooks].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt || b.publishedYear) - new Date(a.createdAt || a.publishedYear)
            case 'oldest':
                return new Date(a.createdAt || a.publishedYear) - new Date(b.createdAt || b.publishedYear)
            case 'rating':
                return (b.averageRating || 0) - (a.averageRating || 0)
            case 'title':
                return a.title.localeCompare(b.title)
            default:
                return 0
        }
    })

    const paginatedBooks = sortedBooks.slice(
        (currentPage - 1) * booksPerPage,
        currentPage * booksPerPage
    )

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Херо секция */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Библиотека книг</h1>
                            <p className="text-blue-100 text-lg">
                                Откройте для себя мир литературы: {books.length} книг ждут вашего внимания
                            </p>
                        </div>
                        {isAuthenticated && (
                            <Link
                                to="/books/add"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                            >
                                <Plus size={20} className="mr-2" />
                                Добавить книгу
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Информация о результатах */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="text-gray-600">
                        Показано <span className="font-semibold">{paginatedBooks.length}</span> из{' '}
                        <span className="font-semibold">{filteredBooks.length}</span> книг
                    </div>
                    {!isAuthenticated && (
                        <div className="text-sm text-gray-500">
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Войдите
                            </Link>
                            , чтобы добавлять книги
                        </div>
                    )}
                </div>

                {/* Состояния загрузки и ошибки */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="text-gray-500 mt-4">Загрузка книг...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl text-center">
                        <p className="text-lg mb-2">Ошибка загрузки книг</p>
                        <p className="text-sm mb-4">{error}</p>
                        <button
                            onClick={fetchBooks}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Попробовать снова
                        </button>
                    </div>
                ) : paginatedBooks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookCard size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">Книги не найдены</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Попробуйте изменить параметры поиска или добавьте новую книгу
                        </p>
                        {isAuthenticated && (
                            <Link
                                to="/books/add"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                <Plus size={20} className="mr-2" />
                                Добавить первую книгу
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Список книг */}
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                            : 'space-y-4'
                        }>
                            {paginatedBooks.filter(Boolean).map(book => (
                                viewMode === 'grid' ? (
                                    <BookCard key={book.id} book={book} />
                                ) : (
                                    <div key={book.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-6 flex">
                                        <div className="w-24 h-32 flex-shrink-0 mr-6">
                                            {book.coverUrl ? (
                                                <img
                                                    src={book.coverUrl}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                                                    <BookCard size={32} className="text-blue-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h3>
                                            <p className="text-gray-600 mb-2">{book.author}</p>
                                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{book.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1">
                                                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                                    <span className="font-semibold">{(book.averageRating || 0).toFixed(1)}</span>
                                                    <span className="text-gray-500 text-sm">({book.reviewCount || 0})</span>
                                                </div>
                                                <Link
                                                    to={`/book/${book.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Подробнее →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Пагинация */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <nav className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        ← Назад
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = currentPage - 2 + i
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        Вперед →
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}

                {/* Информационный блок */}
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Станьте частью сообщества</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <Plus size={24} className="text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Добавляйте книги</h4>
                            <p className="text-gray-600 text-sm">
                                Поделитесь своими любимыми книгами с сообществом читателей
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Star size={24} className="text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Оставляйте отзывы</h4>
                            <p className="text-gray-600 text-sm">
                                Ваше мнение поможет другим читателям сделать правильный выбор
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Filter size={24} className="text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Открывайте новое</h4>
                            <p className="text-gray-600 text-sm">
                                Находите интересные книги по рекомендациям других читателей
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BooksList;