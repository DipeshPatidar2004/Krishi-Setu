import { useLanguage } from '../hooks/useLanguage'

const Features = () => {
  const { t } = useLanguage()

  const features = [
    {
      title: t('features.feature1_title'),
      description: t('features.feature1_desc'),
      icon: "🌾"
    },
    {
      title: t('features.feature2_title'),
      description: t('features.feature2_desc'),
      icon: "🏛️"
    },
    {
      title: t('features.feature3_title'),
      description: t('features.feature3_desc'),
      icon: "💰"
    },
    {
      title: t('features.feature4_title'),
      description: t('features.feature4_desc'),
      icon: "🚜"
    },
    {
      title: t('features.feature5_title'),
      description: t('features.feature5_desc'),
      icon: "📊"
    },
    {
      title: t('features.feature6_title'),
      description: t('features.feature6_desc'),
      icon: "📱"
    }
  ]

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Features