import { useAuth } from '../hooks/useAuth'

const Hero = ({ onRegisterClick, onBuyerRegisterClick }) => {
  const { user } = useAuth()

  return (
    <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {user ? `Welcome back, ${user.name}!` : 'Empowering Farmers Through Digital Transparency'}
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Krishi Setu bridges the gap between farmers and buyers, eliminating middlemen 
            exploitation and ensuring fair prices through a transparent digital marketplace
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={onRegisterClick}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
              >
                Register as Farmer
              </button>
              <button 
                onClick={onBuyerRegisterClick}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
              >
                Register as Buyer
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-primary-600 mb-2">40%</h3>
            <p className="text-gray-700">Current farmer earnings vs consumer price</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-primary-600 mb-2">8.4%</h3>
            <p className="text-gray-700">Food inflation in 2024</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-primary-600 mb-2">100%</h3>
            <p className="text-gray-700">Transparent transactions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero