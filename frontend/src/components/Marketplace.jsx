import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

const Marketplace = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('crops')
  const [userCrops, setUserCrops] = useState([])
  const [userTenders, setUserTenders] = useState([])
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [selectedTender, setSelectedTender] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [formData, setFormData] = useState({
    cropType: 'Wheat',
    customCropType: '',
    quantity: '',
    basePrice: '',
    quality: 'Grade A'
  })
  const [tenderForm, setTenderForm] = useState({
    cropRequired: 'Wheat',
    customCropType: '',
    quantity: '',
    maxPrice: '',
    deliveryLocation: '',
    deadline: '',
    description: '',
    qualityRequired: 'Grade A'
  })
  const { user } = useAuth()

  useEffect(() => {
    // Load saved crops from localStorage
    const savedCrops = JSON.parse(localStorage.getItem('marketplaceCrops') || '[]')
    setUserCrops(savedCrops)
    
    // Load saved tenders from localStorage
    const savedTenders = JSON.parse(localStorage.getItem('marketplaceTenders') || '[]')
    setUserTenders(savedTenders)
  }, [])
  
  const crops = [
    {
      id: 1,
      farmer: "Ramesh Kumar",
      crop: "Wheat",
      quantity: "500 quintals",
      location: "Indore, MP",
      basePrice: "₹2,100/quintal",
      currentBid: "₹2,250/quintal",
      timeLeft: "2h 30m",
      quality: "Grade A"
    },
    {
      id: 2,
      farmer: "Suresh Patel",
      crop: "Rice",
      quantity: "300 quintals",
      location: "Bhopal, MP",
      basePrice: "₹2,800/quintal",
      currentBid: "₹2,950/quintal",
      timeLeft: "4h 15m",
      quality: "Premium"
    },
    {
      id: 3,
      farmer: "Lakshmi Devi",
      crop: "Soybean",
      quantity: "200 quintals",
      location: "Dewas, MP",
      basePrice: "₹4,500/quintal",
      currentBid: "₹4,650/quintal",
      timeLeft: "1h 45m",
      quality: "Grade A"
    }
  ]

  const allCrops = [...crops, ...userCrops]

  const activeTenders = [
    {
      id: 'T001',
      tenderNo: 'MP/AGR/2024/001',
      department: 'Department of Agriculture, MP',
      cropRequired: 'Wheat',
      quantity: '5000 quintals',
      deliveryLocation: 'Central Warehouse, Bhopal',
      basePrice: '₹2,200/quintal',
      currentBid: '₹2,150/quintal',
      deadline: '2024-11-15',
      status: 'Active',
      description: 'Quality Grade A wheat required for PDS distribution'
    },
    {
      id: 'T002',
      tenderNo: 'MP/AGR/2024/002',
      department: 'Food Corporation of India',
      cropRequired: 'Rice',
      quantity: '3000 quintals',
      deliveryLocation: 'FCI Godown, Indore',
      basePrice: '₹3,000/quintal',
      currentBid: '₹2,900/quintal',
      deadline: '2024-11-18',
      status: 'Active',
      description: 'Premium quality rice for government schemes'
    },
    {
      id: 'T003',
      tenderNo: 'MP/AGR/2024/003',
      department: 'State Civil Supplies',
      cropRequired: 'Soybean',
      quantity: '2000 quintals',
      deliveryLocation: 'Processing Unit, Dewas',
      basePrice: '₹4,800/quintal',
      currentBid: '₹4,700/quintal',
      deadline: '2024-11-20',
      status: 'Active',
      description: 'Soybean for oil extraction, moisture content < 12%'
    }
  ]

  const allTenders = [...activeTenders, ...userTenders]

  const handleTenderBid = (tender) => {
    if (!user) {
      alert('Please login to place bids')
      return
    }
    setSelectedTender(tender)
    setBidAmount('')
  }

  const submitBid = () => {
    const currentHighest = parseFloat(selectedTender.currentBid.replace(/[₹,\/quintal]/g, ''))
    const newBid = parseFloat(bidAmount)
    
    if (!bidAmount || newBid <= currentHighest) {
      alert(`Please enter a bid amount higher than the current highest bid of ₹${currentHighest}/quintal`)
      return
    }
    
    alert(`Your bid of ₹${bidAmount}/quintal has been submitted for tender ${selectedTender.tenderNo}`)
    setSelectedTender(null)
    setBidAmount('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    if (name === 'cropType' && value === 'Other') {
      setShowOtherInput(true)
    } else if (name === 'cropType') {
      setShowOtherInput(false)
      setFormData({ ...formData, cropType: value, customCropType: '' })
    }
  }

  const handleTenderSubmit = (e) => {
    e.preventDefault()
    
    if (!user || user.userType !== 'buyer') {
      alert('Only registered buyers can create tenders')
      return
    }

    const cropName = tenderForm.cropRequired === 'Other' ? tenderForm.customCropType : tenderForm.cropRequired
    
    if (!cropName || !tenderForm.quantity || !tenderForm.maxPrice || !tenderForm.deliveryLocation || !tenderForm.deadline) {
      alert('Please fill all required fields')
      return
    }

    const newTender = {
      id: `T${Date.now()}`,
      tenderNo: `USER/${user.id}/${new Date().getFullYear()}/${userTenders.length + 1}`,
      department: user.companyName || user.name,
      cropRequired: cropName,
      quantity: `${tenderForm.quantity} quintals`,
      deliveryLocation: tenderForm.deliveryLocation,
      basePrice: `₹${tenderForm.maxPrice}/quintal`,
      currentBid: `₹${tenderForm.maxPrice}/quintal`,
      deadline: tenderForm.deadline,
      status: 'Active',
      description: tenderForm.description || `${tenderForm.qualityRequired} quality ${cropName} required`,
      postedBy: user.id,
      postedAt: new Date().toISOString()
    }

    const updatedTenders = [...userTenders, newTender]
    setUserTenders(updatedTenders)
    localStorage.setItem('marketplaceTenders', JSON.stringify(updatedTenders))
    
    // Reset form
    setTenderForm({
      cropRequired: 'Wheat',
      customCropType: '',
      quantity: '',
      maxPrice: '',
      deliveryLocation: '',
      deadline: '',
      description: '',
      qualityRequired: 'Grade A'
    })
    setActiveTab('tenders')
    
    alert('Your tender has been posted successfully!')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please login to post your crop')
      return
    }

    const cropName = showOtherInput ? formData.customCropType : formData.cropType
    
    if (!cropName || !formData.quantity || !formData.basePrice) {
      alert('Please fill all required fields')
      return
    }

    const newCrop = {
      id: Date.now(),
      farmer: user.name,
      crop: cropName,
      quantity: `${formData.quantity} quintals`,
      location: user.location || 'Not specified',
      basePrice: `₹${formData.basePrice}/quintal`,
      currentBid: `₹${formData.basePrice}/quintal`,
      timeLeft: '24h 00m',
      quality: formData.quality,
      postedAt: new Date().toISOString()
    }

    const updatedCrops = [...userCrops, newCrop]
    setUserCrops(updatedCrops)
    localStorage.setItem('marketplaceCrops', JSON.stringify(updatedCrops))
    
    // Reset form
    setFormData({
      cropType: 'Wheat',
      customCropType: '',
      quantity: '',
      basePrice: '',
      quality: 'Grade A'
    })
    setShowOtherInput(false)
    setActiveTab('crops')
    
    alert('Your crop has been posted successfully!')
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('marketplace.title')}</h2>
          
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('crops')}
              className={`px-6 py-2 rounded-lg font-medium ${
                activeTab === 'crops'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t('marketplace.availableCrops')}
            </button>
            <button
              onClick={() => setActiveTab('tenders')}
              className={`px-6 py-2 rounded-lg font-medium ${
                activeTab === 'tenders'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t('marketplace.activeTenders')}
            </button>
            {user && user.userType !== 'buyer' && (
              <button
                onClick={() => setActiveTab('post')}
                className={`px-6 py-2 rounded-lg font-medium ${
                  activeTab === 'post'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t('marketplace.postYourCrop')}
              </button>
            )}
            {user && user.userType === 'buyer' && (
              <button
                onClick={() => setActiveTab('createTender')}
                className={`px-6 py-2 rounded-lg font-medium ${
                  activeTab === 'createTender'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t('marketplace.createTender')}
              </button>
            )}
          </div>

          {activeTab === 'crops' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCrops.map(crop => (
                <div key={crop.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{crop.crop}</h3>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {crop.quality}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      <span className="font-medium">{t('marketplace.farmer')}:</span> {crop.farmer}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">{t('marketplace.quantity')}:</span> {crop.quantity}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">{t('marketplace.location')}:</span> {crop.location}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">{t('marketplace.basePrice')}:</span> {crop.basePrice}
                    </p>
                    <p className="text-primary-600 font-semibold">
                      <span className="font-medium">{t('marketplace.currentBid')}:</span> {crop.currentBid}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 font-medium">
                      {t('marketplace.endsIn')}: {crop.timeLeft}
                    </span>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition">
                      {t('marketplace.placeBid')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tenders' && (
            <div>
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>{t('marketplace.note')}:</strong> {t('marketplace.tenderNote')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {allTenders.map(tender => (
                  <div key={tender.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {tender.cropRequired} - {tender.quantity}
                        </h3>
                        <p className="text-gray-600 text-sm">{t('marketplace.tenderNo')}: {tender.tenderNo}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {tender.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">{t('marketplace.department')}:</span> {tender.department}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="font-medium">{t('marketplace.deliveryLocation')}:</span> {tender.deliveryLocation}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="font-medium">{t('marketplace.deadline')}:</span> {tender.deadline}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">{t('marketplace.basePrice')}:</span> {tender.basePrice}
                        </p>
                        <p className="text-primary-600 font-semibold text-lg mt-1">
                          {t('marketplace.currentHighestBid')}: {tender.currentBid}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4">{tender.description}</p>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{t('marketplace.timeRemaining')}:</span> 
                        <span className="text-red-600 font-medium ml-1">
                          {Math.floor(Math.random() * 48 + 24)} hours
                        </span>
                      </div>
                      <button
                        onClick={() => handleTenderBid(tender)}
                        className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition"
                      >
                        {t('marketplace.placeBid')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTender && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('marketplace.placeBidFor', { crop: selectedTender.cropRequired })}
                    </h3>
                    <p className="text-gray-600 mb-2">{t('marketplace.tenderNo')}: {selectedTender.tenderNo}</p>
                    <p className="text-gray-600 mb-4">{t('marketplace.currentHighestBid')}: {selectedTender.currentBid}</p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('marketplace.yourBidPerQuintal')}
                      </label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder={t('marketplace.enterBidAmount')}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('marketplace.enterBidAmount')}
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={submitBid}
                        className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition"
                      >
                        {t('marketplace.submitBid')}
                      </button>
                      <button
                        onClick={() => setSelectedTender(null)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
                      >
                        {t('marketplace.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'post' && (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.cropType')} *
                  </label>
                  <select 
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice">Rice</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {showOtherInput && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('marketplace.specifyCustomCrop')} *
                    </label>
                    <input
                      type="text"
                      name="customCropType"
                      value={formData.customCropType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder={t('marketplace.enterCropName')}
                      required={showOtherInput}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.quantityQuintals')} *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.pricePerQuintal')} *
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter price in ₹"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.qualityGrade')}
                  </label>
                  <select 
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800 text-sm">
                      {t('marketplace.pleaseLogin')}
                    </p>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:bg-gray-400"
                  disabled={!user}
                >
                  {t('marketplace.submitVerification')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'createTender' && (
            <form onSubmit={handleTenderSubmit} className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>{t('marketplace.note')}:</strong> {t('marketplace.buyerNote')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.cropRequired')} *
                  </label>
                  <select 
                    value={tenderForm.cropRequired}
                    onChange={(e) => {
                      setTenderForm({ ...tenderForm, cropRequired: e.target.value })
                      if (e.target.value !== 'Other') {
                        setTenderForm({ ...tenderForm, cropRequired: e.target.value, customCropType: '' })
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice">Rice</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {tenderForm.cropRequired === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('marketplace.specifyCustomCrop')} *
                    </label>
                    <input
                      type="text"
                      value={tenderForm.customCropType}
                      onChange={(e) => setTenderForm({ ...tenderForm, customCropType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder={t('marketplace.enterCropName')}
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.quantityRequired')} *
                  </label>
                  <input
                    type="number"
                    value={tenderForm.quantity}
                    onChange={(e) => setTenderForm({ ...tenderForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter quantity needed"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.maxPrice')} *
                  </label>
                  <input
                    type="number"
                    value={tenderForm.maxPrice}
                    onChange={(e) => setTenderForm({ ...tenderForm, maxPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Maximum price you can pay in ₹"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.deliveryLocation')} *
                  </label>
                  <input
                    type="text"
                    value={tenderForm.deliveryLocation}
                    onChange={(e) => setTenderForm({ ...tenderForm, deliveryLocation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t('marketplace.deliveryLocationPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.deadline')} *
                  </label>
                  <input
                    type="date"
                    value={tenderForm.deadline}
                    onChange={(e) => setTenderForm({ ...tenderForm, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.qualityGrade')}
                  </label>
                  <select 
                    value={tenderForm.qualityRequired}
                    onChange={(e) => setTenderForm({ ...tenderForm, qualityRequired: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('marketplace.additionalRequirements')}
                  </label>
                  <textarea
                    value={tenderForm.description}
                    onChange={(e) => setTenderForm({ ...tenderForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                    placeholder={t('marketplace.additionalDesc')}
                  />
                </div>

                {!user || user.userType !== 'buyer' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800 text-sm">
                      {t('marketplace.loginToContinue')}
                    </p>
                  </div>
                ) : null}
                
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:bg-gray-400"
                  disabled={!user || user.userType !== 'buyer'}
                >
                  {t('marketplace.createTenderBtn')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Marketplace