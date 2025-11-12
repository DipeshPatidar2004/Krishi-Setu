import { useAuth } from '../hooks/useAuth'

const Navbar = ({ currentView, setCurrentView, onLoginClick }) => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-700">Krishi Setu</h1>
          </div>
          
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setCurrentView('home')}
              className={`text-gray-600 hover:text-primary-700 font-medium ${
                currentView === 'home' ? 'text-primary-700' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('marketplace')}
              className={`text-gray-600 hover:text-primary-700 font-medium ${
                currentView === 'marketplace' ? 'text-primary-700' : ''
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setCurrentView('equipment')}
              className={`text-gray-600 hover:text-primary-700 font-medium ${
                currentView === 'equipment' ? 'text-primary-700' : ''
              }`}
            >
              Equipment Rental
            </button>
            <button
              onClick={() => setCurrentView('government')}
              className={`text-gray-600 hover:text-primary-700 font-medium ${
                currentView === 'government' ? 'text-primary-700' : ''
              }`}
            >
              Government Portal
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-3 py-1 bg-gray-100 rounded-full">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-700 font-medium">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.location}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar