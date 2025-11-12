const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Krishi Setu</h3>
            <p className="text-gray-400 mb-4">
              Empowering farmers through digital transparency and eliminating middlemen 
              exploitation in agricultural trade.
            </p>
            <div className="flex space-x-4">
              <span className="text-sm text-gray-400">
                A project by students of Acropolis Institute of Technology and Research, Indore
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-400 mb-2">
              Prof. Nisha Rathi<br />
              Prof. Ashish Anjana
            </p>
            <p className="text-gray-400">
              Acropolis Institute of Technology<br />
              and Research, Indore (M.P)
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Krishi Setu. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Developed by: Anshu Bilawliya, Hritik Patel, Akash Baraskar, Dipesh Patidar
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer