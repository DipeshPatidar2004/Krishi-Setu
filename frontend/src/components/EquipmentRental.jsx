import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'

const EquipmentRental = () => {
  const { t } = useLanguage()
  const [activeFilter, setActiveFilter] = useState('all')
  
  const equipment = [
    {
      id: 1,
      name: "John Deere Tractor",
      owner: "Mohan Singh",
      location: "Indore, MP",
      rate: "₹1,200/day",
      available: true,
      image: "🚜",
      description: "50 HP tractor, well-maintained"
    },
    {
      id: 2,
      name: "Rotavator",
      owner: "Prakash Verma",
      location: "Dewas, MP",
      rate: "₹800/day",
      available: true,
      image: "🌾",
      description: "6 feet rotavator, suitable for all soils"
    },
    {
      id: 3,
      name: "Seed Drill Machine",
      owner: "Ravi Sharma",
      location: "Ujjain, MP",
      rate: "₹600/day",
      available: false,
      image: "🌱",
      description: "9 row seed drill, perfect for wheat sowing"
    },
    {
      id: 4,
      name: "Harvester",
      owner: "Sunil Patel",
      location: "Bhopal, MP",
      rate: "₹3,000/day",
      available: true,
      image: "🌾",
      description: "Combined harvester for wheat and rice"
    }
  ]

  const filteredEquipment = activeFilter === 'all' 
    ? equipment 
    : equipment.filter(eq => activeFilter === 'available' ? eq.available : !eq.available)

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('equipment.title')}</h2>
          <p className="text-gray-600 mb-8">
            {t('equipment.subtitle')}
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">{t('equipment.filterEquipment')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`w-full text-left px-4 py-2 rounded ${
                      activeFilter === 'all' ? 'bg-primary-600 text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    {t('equipment.allEquipment')}
                  </button>
                  <button
                    onClick={() => setActiveFilter('available')}
                    className={`w-full text-left px-4 py-2 rounded ${
                      activeFilter === 'available' ? 'bg-primary-600 text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    {t('equipment.availableNow')}
                  </button>
                  <button
                    onClick={() => setActiveFilter('rented')}
                    className={`w-full text-left px-4 py-2 rounded ${
                      activeFilter === 'rented' ? 'bg-primary-600 text-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    {t('equipment.currentlyRented')}
                  </button>
                </div>

                <div className="mt-8">
                  <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold">
                    {t('equipment.listYourEquipment')}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEquipment.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-4xl mr-4">{item.image}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600">by {item.owner}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        item.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.available ? t('equipment.available') : t('equipment.rented')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{item.description}</p>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-600 text-sm">{item.location}</p>
                        <p className="text-2xl font-bold text-primary-600">{item.rate}</p>
                      </div>
                      <button 
                        className={`px-6 py-2 rounded-md transition ${
                          item.available
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!item.available}
                      >
                        {item.available ? t('equipment.rentNow') : t('equipment.notAvailable')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-primary-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('equipment.why')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <h4 className="font-semibold mb-1">{t('equipment.verified')}</h4>
                    <p className="text-gray-700 text-sm">{t('equipment.verifiedDesc')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">💰</div>
                    <h4 className="font-semibold mb-1">{t('equipment.secure')}</h4>
                    <p className="text-gray-700 text-sm">{t('equipment.secureDesc')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <h4 className="font-semibold mb-1">{t('equipment.tracking')}</h4>
                    <p className="text-gray-700 text-sm">{t('equipment.trackingDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipmentRental