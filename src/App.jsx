import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Marketplace from './components/Marketplace'
import EquipmentRental from './components/EquipmentRental'
import Government from './components/Government'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'
import BuyerRegister from './components/BuyerRegister'

function AppContent() {
  const [currentView, setCurrentView] = useState('home')
  const [showAuth, setShowAuth] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    // Create demo users if they don't exist
    let users = JSON.parse(localStorage.getItem('krishiSetuUsers') || '[]')
    let updated = false
    
    // Remove old demo user if exists and recreate
    users = users.filter(u => u.email !== 'demo@farmer.com' && u.email !== 'buyer@demo.com')
    
    if (true) {
      users.push({
        id: 'demo1',
        name: 'Demo Farmer',
        email: 'demo@farmer.com',
        phone: '9876543210',
        location: 'Indore, MP',
        landSize: '5',
        crops: 'Wheat, Soybean',
        password: 'Demo123',
        userType: 'farmer',
        registeredAt: new Date().toISOString()
      })
      updated = true
    }
    
    // Always recreate buyer demo user
    if (true) {
      users.push({
        id: 'demo2',
        name: 'Demo Buyer',
        email: 'buyer@demo.com',
        phone: '9876543211',
        companyName: 'Fresh Foods Pvt Ltd',
        businessType: 'Wholesaler',
        location: 'Bhopal, MP',
        gstNumber: '23ABCDE1234F1Z5',
        password: 'Buyer123',
        userType: 'buyer',
        registeredAt: new Date().toISOString()
      })
      updated = true
    }
    
    // Always update to ensure demo users exist
    localStorage.setItem('krishiSetuUsers', JSON.stringify(users))
  }, [])

  const handleLoginClick = () => {
    setShowAuth('login')
  }

  const handleAuthClose = () => {
    setShowAuth(null)
  }

  const renderView = () => {
    switch(currentView) {
      case 'marketplace':
        return <Marketplace />
      case 'equipment':
        return <EquipmentRental />
      case 'government':
        return <Government />
      default:
        return (
          <>
            <Hero 
              onRegisterClick={() => setShowAuth('register')}
              onBuyerRegisterClick={() => setShowAuth('buyerRegister')}
            />
            <Features />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onLoginClick={handleLoginClick}
      />
      <main>
        {renderView()}
      </main>
      <Footer />
      
      {showAuth === 'login' && (
        <Login 
          onClose={handleAuthClose}
          switchToRegister={() => setShowAuth('register')}
          switchToBuyerRegister={() => setShowAuth('buyerRegister')}
        />
      )}
      
      {showAuth === 'register' && (
        <Register 
          onClose={handleAuthClose}
          switchToLogin={() => setShowAuth('login')}
        />
      )}
      
      {showAuth === 'buyerRegister' && (
        <BuyerRegister 
          onClose={handleAuthClose}
          switchToLogin={() => setShowAuth('login')}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
