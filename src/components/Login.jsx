import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const Login = ({ onClose, switchToRegister, switchToBuyerRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill all fields')
      return
    }

    const result = login(formData.email, formData.password)
    if (result.success) {
      onClose()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Login to Krishi Setu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="farmer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-2">Don't have an account?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={switchToRegister}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Register as Farmer
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={switchToBuyerRegister}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Register as Buyer
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Farmer:</p>
            <p className="text-sm text-gray-600">Email: demo@farmer.com</p>
            <p className="text-sm text-gray-600">Password: Demo123</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Buyer:</p>
            <p className="text-sm text-gray-600">Email: buyer@demo.com</p>
            <p className="text-sm text-gray-600">Password: Buyer123</p>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('krishiSetuUsers')
              localStorage.removeItem('krishiSetuUser')
              window.location.reload()
            }}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Reset Demo Users (if login fails)
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login