import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

const Hero = ({ onRegisterClick, onBuyerRegisterClick }) => {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {user ? t('hero.welcome', { name: user.name.split(' ')[0] }) : t('hero.title')}
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            {t('hero.description')}
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={onRegisterClick}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
              >
                {t('hero.registerFarmer')}
              </button>
              <button 
                onClick={onBuyerRegisterClick}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
              >
                {t('hero.registerBuyer')}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-primary-600 mb-2">{t('hero_stats.stat1_value')}</h3>
            <p className="text-gray-700">{t('hero_stats.stat1_label')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-primary-600 mb-2">{t('hero_stats.stat2_value')}</h3>
            <p className="text-gray-700">{t('hero_stats.stat2_label')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-primary-600 mb-2">{t('hero_stats.stat3_value')}</h3>
            <p className="text-gray-700">{t('hero_stats.stat3_label')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero