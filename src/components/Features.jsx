const Features = () => {
  const features = [
    {
      title: "Direct Market Access",
      description: "Connect directly with verified buyers, eliminating middlemen and ensuring better prices for your produce",
      icon: "🌾"
    },
    {
      title: "Government Supervised Tenders",
      description: "All transactions happen through government-verified tenders, ensuring fairness and transparency",
      icon: "🏛️"
    },
    {
      title: "Secure Payment System",
      description: "Safe wallet system where payments are released only after successful product delivery",
      icon: "💰"
    },
    {
      title: "Equipment Rental",
      description: "Rent out your farming equipment to earn extra income when not in use",
      icon: "🚜"
    },
    {
      title: "Real-time Price Discovery",
      description: "Transparent bidding system ensures farmers get the best market price for their produce",
      icon: "📊"
    },
    {
      title: "Simple Digital Platform",
      description: "User-friendly interface designed for farmers with limited digital knowledge",
      icon: "📱"
    }
  ]

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Breaking the Chains of Agricultural Exploitation
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Krishi Setu provides a comprehensive solution to the challenges faced by Indian farmers
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