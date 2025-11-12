const Government = () => {
  const stats = [
    { label: "Total Farmers Registered", value: "12,548", growth: "+18%" },
    { label: "Active Tenders", value: "342", growth: "+25%" },
    { label: "Transactions This Month", value: "8,765", growth: "+32%" },
    { label: "Total Trade Volume", value: "₹45.2 Cr", growth: "+42%" }
  ]

  const recentTransactions = [
    {
      id: 1,
      farmer: "Ramesh Kumar",
      buyer: "ABC Traders",
      crop: "Wheat - 500 quintals",
      amount: "₹11,25,000",
      status: "Completed",
      date: "2024-11-08"
    },
    {
      id: 2,
      farmer: "Suresh Patel",
      buyer: "XYZ Exports",
      crop: "Rice - 300 quintals",
      amount: "₹8,85,000",
      status: "In Transit",
      date: "2024-11-07"
    },
    {
      id: 3,
      farmer: "Lakshmi Devi",
      buyer: "Fresh Foods Ltd",
      crop: "Soybean - 200 quintals",
      amount: "₹9,30,000",
      status: "Payment Pending",
      date: "2024-11-06"
    }
  ]

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Government Portal</h2>
          <p className="text-gray-600 mb-8">
            Complete transparency in agricultural transactions with government oversight
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.label}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">{stat.growth} from last month</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Verification Process</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Farmer Registration</h4>
                    <p className="text-gray-600">Farmers register with Aadhaar and land records</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Crop Listing Verification</h4>
                    <p className="text-gray-600">Government officials verify crop quality and quantity</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tender Creation</h4>
                    <p className="text-gray-600">Verified crops are listed as government tenders</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Supervised Bidding</h4>
                    <p className="text-gray-600">All bids are monitored to ensure fair pricing</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure Transaction</h4>
                    <p className="text-gray-600">Payment released after delivery confirmation</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Benefits of Government Integration</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">🛡️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Protection from Exploitation</h4>
                    <p className="text-gray-600 text-sm">Government oversight prevents middlemen manipulation</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📊</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Data-Driven Policies</h4>
                    <p className="text-gray-600 text-sm">Real-time data helps in better policy making</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">💯</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">100% Transparency</h4>
                    <p className="text-gray-600 text-sm">Every transaction is recorded and traceable</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⚖️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fair Price Discovery</h4>
                    <p className="text-gray-600 text-sm">Market-driven prices under government supervision</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.crop}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.farmer} → {transaction.buyer}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'Completed' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Government