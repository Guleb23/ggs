import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, LogOut, User, Menu, X } from 'lucide-react'

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <Link
              to="/"
              className="flex items-center space-x-3 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Книжный Клуб</h1>
                <p className="text-xs text-purple-200 opacity-80">Читайте. Делитесь. Обсуждайте</p>
              </div>
            </Link>

            {/* Десктопное меню */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium hover:scale-105"
              >
                Главная
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="h-8 w-px bg-white/30 mx-2"></div>

                  <Link
                    to="/my-reviews"
                    className="px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center space-x-2 font-medium hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <span>Мои отзывы</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <LogOut size={18} />
                    <span>Выйти</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="h-8 w-px bg-white/30 mx-2"></div>

                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium hover:scale-105"
                  >
                    Войти
                  </Link>

                  <Link
                    to="/register"
                    className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>

            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X size={28} className="text-white" />
              ) : (
                <Menu size={28} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="bg-gradient-to-b from-indigo-800 to-purple-900 border-t border-white/10 px-4 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
              >
                Главная
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-reviews"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-semibold">Мои отзывы</div>
                      <div className="text-sm text-purple-200">Просмотр и редактирование</div>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-medium mt-4"
                  >
                    <LogOut size={20} />
                    <span>Выйти из аккаунта</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium text-center"
                  >
                    Войти
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transition-all duration-200 font-medium text-center shadow-lg"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}