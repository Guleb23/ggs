import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Plus, Calendar, Hash } from 'lucide-react'
import { booksService } from '../services/booksService'
import { useAuth } from '../context/AuthContext'

export const AddBook = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Форма соответствует BookDto
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        isbn: '',
        coverUrl: '',
        pageCount: '',
        publisher: '',
        publishedDate: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            setLoading(true)

            // Валидация только title (единственное обязательное поле в DTO)
            if (!formData.title.trim()) {
                throw new Error('Название книги обязательно')
            }

            // Подготовка данных для отправки
            const bookData = {
                title: formData.title.trim(),
                // Остальные поля могут быть пустыми или null
                author: formData.author.trim() || null,
                description: formData.description.trim() || null,
                isbn: formData.isbn.trim() || null,
                coverUrl: formData.coverUrl.trim() || null,
                pageCount: formData.pageCount ? parseInt(formData.pageCount) : null,
                publisher: formData.publisher.trim() || null,
                publishedDate: formData.publishedDate ? new Date(formData.publishedDate).toISOString() : null
            }

            // Отправляем через booksService.addBook
            await booksService.addBook(bookData)

            setSuccess('Книга успешно добавлена!')

            // Очищаем форму
            setFormData({
                title: '',
                author: '',
                description: '',
                isbn: '',
                coverUrl: '',
                pageCount: '',
                publisher: '',
                publishedDate: ''
            })

            // Перенаправляем через 2 секунды
            setTimeout(() => {
                navigate('/books')
            }, 2000)

        } catch (err) {
            setError(err.message || 'Ошибка при добавлении книги')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Проверяем размер файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Изображение слишком большое (максимум 5MB)')
                return
            }

            // Проверяем тип файла
            if (!file.type.startsWith('image/')) {
                setError('Пожалуйста, выберите изображение')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    coverUrl: reader.result
                }))
                setError('') // Очищаем ошибку, если была
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            coverUrl: ''
        }))
    }

    // Функция для валидации ISBN (опционально)
    const validateISBN = (isbn) => {
        if (!isbn) return true
        // Удаляем дефисы и пробелы
        const cleanIsbn = isbn.replace(/[-\s]/g, '')
        // Проверяем длину (10 или 13 цифр)
        return /^(?:\d{10}|\d{13})$/.test(cleanIsbn)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Добавить новую книгу</h1>
                    <p className="text-gray-600 text-lg">
                        Поделитесь с сообществом своими любимыми книгами
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl mb-6 flex items-center">
                        <span className="mr-2">✅</span>
                        {success}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Левая колонка */}
                            <div className="space-y-6">
                                {/* Обложка книги */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Обложка книги (URL)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer relative">
                                        {formData.coverUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={formData.coverUrl}
                                                    alt="Preview"
                                                    className="mx-auto h-48 object-cover rounded-lg"
                                                    onError={() => {
                                                        setError('Не удалось загрузить изображение. Проверьте URL.')
                                                        setFormData(prev => ({ ...prev, coverUrl: '' }))
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload size={24} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Нажмите для загрузки изображения
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Или введите URL ниже
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <input
                                            type="url"
                                            name="coverUrl"
                                            value={formData.coverUrl}
                                            onChange={handleChange}
                                            placeholder="https://example.com/book-cover.jpg"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Оставьте пустым, если нет обложки
                                        </p>
                                    </div>
                                </div>

                                {/* Технические детали */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2 flex items-center">
                                        <Hash size={16} className="mr-2" />
                                        Технические детали
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ISBN
                                        </label>
                                        <input
                                            type="text"
                                            name="isbn"
                                            value={formData.isbn}
                                            onChange={handleChange}
                                            placeholder="978-5-17-090458-8"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formData.isbn && !validateISBN(formData.isbn)
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-gray-200 focus:ring-blue-500'
                                                }`}
                                        />
                                        {formData.isbn && !validateISBN(formData.isbn) && (
                                            <p className="text-xs text-red-500 mt-1">
                                                ISBN должен содержать 10 или 13 цифр
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Оставьте пустым, если неизвестен
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Издательство
                                        </label>
                                        <input
                                            type="text"
                                            name="publisher"
                                            value={formData.publisher}
                                            onChange={handleChange}
                                            placeholder="АСТ, Эксмо, etc."
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Правая колонка - основная информация */}
                            <div className="space-y-6">
                                {/* Основная информация */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">
                                        Основная информация
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Название книги *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Мастер и Маргарита"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Автор
                                        </label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            placeholder="Михаил Булгаков"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Оставьте пустым, если автор неизвестен
                                        </p>
                                    </div>
                                </div>

                                {/* Даты и страницы */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Calendar size={14} className="mr-1" />
                                            Дата публикации
                                        </label>
                                        <input
                                            type="date"
                                            name="publishedDate"
                                            value={formData.publishedDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Год издания
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Страниц
                                        </label>
                                        <input
                                            type="number"
                                            name="pageCount"
                                            value={formData.pageCount}
                                            onChange={handleChange}
                                            placeholder="480"
                                            min="1"
                                            max="9999"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Количество страниц
                                        </p>
                                    </div>
                                </div>

                                {/* Описание */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Описание книги
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Опишите сюжет, основные темы книги..."
                                        rows="6"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">
                                            Оставьте пустым, если нет описания
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            {formData.description.length}/2000
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Кнопки отправки */}
                        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/books')}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                                disabled={loading}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.title.trim()}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Добавление...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} className="mr-2" />
                                        Добавить книгу
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Информация для пользователя */}
                <div className="mt-8 bg-blue-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="text-blue-600 mr-2">💡</span>
                        Правила добавления книг
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• <span className="font-semibold">Название книги</span> - обязательное поле</li>
                        <li>• <span className="font-semibold">Автор</span> - можно оставить пустым (для сборников)</li>
                        <li>• <span className="font-semibold">Обложка</span> - можно загрузить файл или указать URL</li>
                        <li>• <span className="font-semibold">ISBN</span> - должен содержать 10 или 13 цифр</li>
                        <li>• <span className="font-semibold">Описание</span> - поможет другим читателям узнать о книге</li>
                        <li>• Все поля, кроме названия, не обязательны</li>
                    </ul>
                </div>

                {/* Предупреждение */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        Важно знать
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Убедитесь, что книга еще не добавлена в каталог</li>
                        <li>• Проверьте правильность введенных данных</li>
                        <li>• Изображение не должно превышать 5MB</li>
                        <li>• Книга появится в общем каталоге после проверки</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AddBook