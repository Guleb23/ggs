import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { register } = useAuth()
  const navigate = useNavigate()

  const checkPasswordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 6) strength += 1
    if (pass.length >= 8) strength += 1
    if (/[A-Z]/.test(pass)) strength += 1
    if (/[0-9]/.test(pass)) strength += 1
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1
    return strength
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    if (passwordStrength < 2) {
      setError('Пароль слишком слабый. Используйте буквы в разных регистрах и цифры')
      return
    }

    setLoading(true)

    try {
      const success = await register(email, password)
      if (success) {
        navigate('/login', { state: { registrationSuccess: true } })
      } else {
        setError('Ошибка регистрации')
      }
    } catch (err) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (strength) => {
    if (strength === 0) return 'bg-gray-200'
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength) => {
    if (strength === 0) return 'Введите пароль'
    if (strength <= 2) return 'Слабый'
    if (strength <= 3) return 'Средний'
    return 'Надёжный'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Логотип и заголовок приложения */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ЧитайТоп</h1>
          <p className="text-gray-600 mt-2">Присоединяйтесь к сообществу читателей</p>
        </div>

        {/* Карточка регистрации */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Создать аккаунт</h2>
            <p className="text-gray-600 text-center mt-2">Заполните форму для регистрации</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center animate-fadeIn">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Поле имени пользователя */}

            {/* Поле email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-50"
                  placeholder="ваш@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Поле пароля */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Пароль *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-50"
                  placeholder="Не менее 6 символов"
                  required
                  disabled={loading}
                />
              </div>

              {/* Индикатор сложности пароля */}
              {password && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">Надёжность пароля:</span>
                    <span className={`text-xs font-semibold ${passwordStrength <= 2 ? 'text-red-600' :
                      passwordStrength <= 3 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <ul className="text-xs text-gray-500 mt-2 space-y-1">
                    <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : ''}`}>
                      <svg className={`w-3 h-3 mr-1 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {password.length >= 6 ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        )}
                      </svg>
                      Не менее 6 символов
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                      <svg className={`w-3 h-3 mr-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {/[A-Z]/.test(password) ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        )}
                      </svg>
                      Заглавные буквы
                    </li>
                    <li className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                      <svg className={`w-3 h-3 mr-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {/[0-9]/.test(password) ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        )}
                      </svg>
                      Цифры
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Подтвердите пароль *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-50 ${confirmPassword && password !== confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                    }`}
                  placeholder="Повторите пароль"
                  required
                  disabled={loading}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Пароли не совпадают
                </p>
              )}
            </div>


            {/* Кнопка регистрации */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Регистрация...
                </div>
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:text-green-800 hover:underline transition">
                Войти
              </Link>
            </p>
          </div>

          {/* Преимущества */}
          <div className="mt-8 bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Преимущества регистрации
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Сохраняйте понравившиеся книги
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Пишите и читайте рецензии
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Создайте свою библиотеку
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}