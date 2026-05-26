import { useLanguage } from '../hooks/useLanguage'

const Footer = () => {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Krishi Setu</h3>
            <p className="text-gray-400 mb-4">
              {t('footer.about')}
            </p>
            <div className="flex space-x-4">
              <span className="text-sm text-gray-400">
                {t('footer.madeBy')}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.aboutUs')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.howItWorks')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.faqs')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.contact')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contactInfo')}</h4>
            <p className="text-gray-400 mb-2">
              {t('footer.mentors')}
            </p>
            <p className="text-gray-400">
              {t('footer.institution')}
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                {t('footer.developers')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer