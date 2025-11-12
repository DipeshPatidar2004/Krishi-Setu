const PasswordStrength = ({ password }) => {
  const calculateStrength = () => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    return strength
  }

  const strength = calculateStrength()
  const strengthText = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'][strength]

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-1 bg-gray-200 rounded">
          <div 
            className={`h-1 rounded transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{strengthText}</span>
      </div>
    </div>
  )
}

export default PasswordStrength