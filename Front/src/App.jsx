import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { BookDetail } from './pages/BookDetail'
import BookList from './pages/BooksList'
import { MyReviews } from './pages/MyReviews'
import AddBook from './pages/AddBook'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/add" element={<AddBook />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/book/:bookId"
              element={<BookDetail />}
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute>
                  <MyReviews />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
