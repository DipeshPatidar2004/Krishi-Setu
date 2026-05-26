import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const Marketplace = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('crops')
  const [userCrops, setUserCrops] = useState([])
  const [userTenders, setUserTenders] = useState([])
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [selectedTender, setSelectedTender] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState(null)
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
  const fetchCrops = async () => {
  const res = await fetch(`${API_BASE}/api/marketPlace/getcrops`);
  const data = await res.json();
  setUserCrops(data);
  }

  const fetchTenders = async () => {
    const res = await fetch(`${API_BASE}/api/marketPlace/gettenders`);
    const data = await res.json();
    setUserTenders(data);
  }

  useEffect(() => {
     fetchCrops();
     fetchTenders();
  },[]);

  const crops = [
  ]

  const allCrops = [...crops, ...userCrops]

  const activeTenders = []

  const allTenders = [...activeTenders, ...userTenders]

  const handleTenderBid = (tender) => {
    if (!user) {
      alert('Please login to place bids')
      return
    }
    if(user.userType !== 'farmer'){
      alert("Only famer can apply for this tender")
      return
    }
    setSelectedTender(tender)
    setBidAmount('')
  }
  
  const submitCropBid = async () => {
      try {
        const newBid = Number(bidAmount)

        if (!bidAmount) {
          alert(`Please enter a bid amount`)
          return
        }

        const bidData = {
          buyerName: user.name,
          buyerEmail: user.email,
          bidAmount: newBid,

          farmerEmail: selectedCrop.email,
          cropName: selectedCrop.crop
        }

        const res = await fetch(`${API_BASE}/api/marketPlace/cropbid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bidData)
        })

        if (!res.ok) {
          throw new Error("Bid failed")
        }

        alert(`Bid of ₹${newBid} submitted successfully`)

        setSelectedCrop(null)
        setBidAmount("")

      } catch (err) {
        console.error(err)
        alert("Error submitting bid")
      }
  }

  const submitBid = async () => {
  try {
    const newBid = parseFloat(bidAmount);

    if (!bidAmount) {
      alert(
        `Please enter a bid amount`
      );
      return;
    }

    const bidDetail = {
      name: user.name,
      email: user.email,
      userType: user.userType,
      bidingAmount: newBid,
      buyerEmail: selectedTender.email, 
      tenderNo: selectedTender.tenderNo 
    };

    const res = await fetch(`${API_BASE}/api/marketPlace/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bidDetail),
    });

    if (!res.ok) {
      throw new Error("Failed to submit bid");
    }

    alert(
      `Your bid of ₹${bidAmount}/quintal has been submitted for tender ${selectedTender.tenderNo}`
    );

    setSelectedTender(null);
    setBidAmount("");
  } catch (error) {
    console.error(error);
    alert("Error submitting bid");
  }
};

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
  const handleCropBid = (crop) => {
    if (!user) {
      alert("Please login to place bid")
      return
    }
    if(user.userType !== 'buyer'){
      alert("Only buyer can bid")
      return
    }
    setSelectedCrop(crop)
    setBidAmount("")
  }
  const handleTenderSubmit = async(e) => {
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
      tenderNo: `${user.name}/${user._id}/${cropName}/${new Date().getFullYear()}/${userTenders.length + 1}`,
      name:user.name,
      email: user.email,
      department: user.companyName || user.name,
      cropRequired: cropName,
      quantity: `${tenderForm.quantity} quintals`,
      deliveryLocation: tenderForm.deliveryLocation,
      basePrice: `₹${tenderForm.maxPrice}/quintal`,
      deadline: tenderForm.deadline,
      status: 'Active',
      description: tenderForm.description || `${tenderForm.qualityRequired} quality ${cropName} required`,
      postedBy: user.id,
      postedAt: new Date().toISOString()
    }
    const res = await fetch(`${API_BASE}/api/marketPlace/posttenders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTender),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);
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
    await fetchTenders();
    setActiveTab('tenders')
    
    alert('Your tender has been posted successfully!')
  }
  
  const handleSubmit = async(e) => {
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
      farmer: user.name,
      email:user.email,
      crop: cropName,
      quantity: Number(formData.quantity),
      location: user.location || 'Not specified',
      basePrice: Number(formData.basePrice),
      timeLeft: new Date(Date.now() + 24 * 60 * 60 * 1000),
      quality: formData.quality,
      postedAt: new Date().toISOString()
    }
    const res = await fetch(`${API_BASE}/api/marketPlace/postcrops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCrop),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);
    
    setFormData({
      cropType: 'Wheat',
      customCropType: '',
      quantity: '',
      basePrice: '',
      quality: 'Grade A'
    })
    setShowOtherInput(false)
    await fetchCrops();
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
                    <p className="text-primary-600 font-semibold">
                      <span className="font-medium">{t('marketplace.basePrice')}:</span> {crop.basePrice}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 font-medium">
                      {t('marketplace.endsIn')}: {crop.timeLeft}
                    </span>
                    <button
                      onClick={() => handleCropBid(crop)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition">
                      {t('marketplace.placeBid')}
                    </button>
                  </div>
                </div>
              ))}
            
          {selectedCrop && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

                  <div className="bg-white rounded-lg max-w-md w-full p-6">

                    <h3 className="text-xl font-semibold mb-4">
                      Place Bid for {selectedCrop.crop}
                    </h3>

                    <p className="text-gray-600 mb-3">
                      Base Price: ₹{selectedCrop.basePrice}
                    </p>

                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md mb-4"
                      placeholder="Enter your bid"
                    />

                    <div className="flex space-x-3">

                      <button
                        onClick={submitCropBid}
                        className="flex-1 bg-primary-600 text-white py-2 rounded-md"
                      >
                        Submit Bid
                      </button>

                      <button
                        onClick={() => setSelectedCrop(null)}
                        className="flex-1 bg-gray-300 py-2 rounded-md"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>
                </div>
              )}
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
                        <p className="text-primary-600 font-semibold text-lg mt-1">
                          {t('marketplace.basePrice')}: {tender.basePrice}
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
                        {t('marketplace.applyTender')}
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