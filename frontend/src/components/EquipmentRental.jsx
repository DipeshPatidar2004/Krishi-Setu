import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../hooks/useLanguage'

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — adjust these to match your app
// ─────────────────────────────────────────────────────────────────────────────
//const API = '/api/equipment'
const API = 'http://localhost:4000/api/equipment'

// Get logged in user safely
const getUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem('krishiSetuUser') || '{}'
    )
  } catch {
    return {}
  }
}

// Simple headers (NO AUTH / NO TOKEN)
const authHeaders = () => {
  const user = getUser()
  return {
    'Content-Type': 'application/json',
    'x-user-id': user?._id || user?.id || '',
    'x-user-name': user?.name || '',
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  tractor: '🚜', harvester: '🌾', seeder: '🌱',
  rotavator: '⚙️', sprayer: '💧', other: '🔧',
}

const todayStr = () => new Date().toISOString().split('T')[0]

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS  (defined outside main — prevents remount on rerender)
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => !msg ? null : (
  <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg text-white text-sm font-medium shadow-xl ${type === 'error' ? 'bg-red-600' : 'bg-green-700'}`}>
    {type === 'error' ? '❌' : '✅'} {msg}
  </div>
)

const Err = ({ err }) => err ? <p className="text-xs text-red-500 mt-1">{err}</p> : null

const Spinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
    <p>{label}</p>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// BROWSE TAB
// ─────────────────────────────────────────────────────────────────────────────
const BrowseTab = ({ equipment, onRentClick, currentUserId, t }) => {
  const [q,      setQ]      = useState('')
  const [filter, setFilter] = useState('all')

  const list = equipment
    .filter(e => filter === 'all' ? true : filter === 'available' ? e.available : !e.available)
    .filter(e => !q.trim() || [e.name, e.ownerName, e.location, e.description].join(' ').toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      {/* Search + filter row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text" placeholder="🔍 Search by name, location, owner..."
          value={q} onChange={e => setQ(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {['all', 'available', 'rented'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filter === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'}`}>
            {f === 'all' ? 'All' : f === 'available' ? '✅ Available' : '🔴 Rented'}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">Showing <strong>{list.length}</strong> of {equipment.length} equipment</p>

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🚜</div>
          <p className="text-lg font-semibold text-gray-600">No equipment found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map(eq => {
            const isOwner = String(eq.ownerId?._id || eq.ownerId) === String(currentUserId)
            return (
              <div key={eq._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-primary-200 transition bg-white flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{CATEGORY_ICONS[eq.category] || '🔧'}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{eq.name}</h3>
                      <p className="text-gray-500 text-sm">by {eq.ownerName}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm flex-shrink-0 font-medium ${eq.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {eq.available ? t('equipment.available') : t('equipment.rented')}
                  </span>
                </div>

                <p className="text-gray-700 text-sm">{eq.description || 'No description provided.'}</p>

                <div className="text-sm text-gray-500 flex flex-col gap-1">
                  <span>📍 {eq.location}</span>
                  <span>📞 {eq.contact}</span>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{Number(eq.ratePerDay).toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-gray-400">/day</span>
                  </p>
                  {isOwner ? (
                    <span className="text-xs text-gray-400 italic">Your listing</span>
                  ) : (
                    <button
                      disabled={!eq.available}
                      onClick={() => onRentClick(eq)}
                      className={`px-6 py-2 rounded-md font-medium transition ${eq.available ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      {eq.available ? t('equipment.rentNow') : t('equipment.notAvailable')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Why rent section */}
      <div className="mt-12 bg-primary-50 p-8 rounded-lg">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('equipment.why')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '✅', title: t('equipment.verified'),  desc: t('equipment.verifiedDesc')  },
            { icon: '💰', title: t('equipment.secure'),    desc: t('equipment.secureDesc')    },
            { icon: '📱', title: t('equipment.tracking'),  desc: t('equipment.trackingDesc')  },
          ].map(i => (
            <div key={i.title} className="text-center">
              <div className="text-4xl mb-2">{i.icon}</div>
              <h4 className="font-semibold mb-1">{i.title}</h4>
              <p className="text-gray-700 text-sm">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST EQUIPMENT TAB
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', category: 'tractor', description: '', location: '', ratePerDay: '', contact: '' }

const ListTab = ({ myListings, onSubmit, t }) => {
  const [form,   setForm]   = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name       = 'Equipment name is required'
    if (!form.location.trim()) e.location   = 'Location is required'
    if (!form.ratePerDay || Number(form.ratePerDay) <= 0) e.ratePerDay = 'Enter a valid rate'
    if (!form.contact.trim())  e.contact    = 'Contact number is required'
    if (!/^\d{10}$/.test(form.contact.trim())) e.contact = 'Enter valid 10-digit number'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try { await onSubmit(form); setForm(EMPTY_FORM); setErrors({}) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('equipment.listYourEquipment')}</h3>
          <p className="text-sm text-gray-500 mb-6">Your name is taken from your logged-in account automatically.</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Equipment name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Equipment name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. John Deere Tractor 50HP" value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <Err err={errors.name} />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="tractor">🚜 Tractor</option>
                <option value="harvester">🌾 Harvester</option>
                <option value="seeder">🌱 Seeder / Drill</option>
                <option value="rotavator">⚙️ Rotavator / Cultivator</option>
                <option value="sprayer">💧 Sprayer / Pump</option>
                <option value="other">🔧 Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea rows={3} placeholder="Condition, capacity, suitable crops, year of purchase..."
                value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>

            {/* Location + Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Indore, MP" value={form.location}
                  onChange={e => set('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <Err err={errors.location} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rate per day (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="1" placeholder="e.g. 1200" value={form.ratePerDay}
                  onChange={e => set('ratePerDay', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <Err err={errors.ratePerDay} />
              </div>
            </div>

            {/* Contact */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact number <span className="text-red-500">*</span></label>
              <input type="tel" placeholder="10-digit mobile number" value={form.contact}
                onChange={e => set('contact', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <Err err={errors.contact} />
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-sm disabled:opacity-60">
              {saving ? 'Saving to database...' : '✅ Submit Listing'}
            </button>
          </form>
        </div>
      </div>

      {/* Side panel */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h4 className="font-bold text-green-800 mb-3">💡 Tips for a good listing</h4>
          <ul className="text-sm text-green-700 space-y-2 list-disc pl-4">
            <li>Mention make, model and year</li>
            <li>Describe condition honestly — builds trust</li>
            <li>Specify what crops or tasks it suits best</li>
            <li>Keep contact reachable during season</li>
          </ul>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h4 className="font-bold text-gray-800 mb-3">📊 Your listings</h4>
          <p className="text-3xl font-bold text-primary-600">{myListings.length}</p>
          <p className="text-sm text-gray-500 mb-3">total listed</p>
          <div className="flex gap-6">
            <div>
              <p className="text-xl font-bold text-green-600">{myListings.filter(e => e.available).length}</p>
              <p className="text-xs text-gray-400">available</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{myListings.filter(e => !e.available).length}</p>
              <p className="text-xs text-gray-400">rented out</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const RequestsTab = ({ incoming, outgoing, onUpdateStatus }) => {
  const [view, setView] = useState('incoming')

  const ReqCard = ({ r, isIncoming }) => {
    const days = Math.max(1, Math.round((new Date(r.toDate) - new Date(r.fromDate)) / 86400000))
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap justify-between items-start gap-3">
        <div>
          {isIncoming ? (
            <p className="font-semibold text-gray-900 text-sm">
              <span className="text-gray-700">{r.renterName}</span> wants to rent{' '}
              <span className="text-primary-600">{r.equipmentName}</span>
            </p>
          ) : (
            <p className="font-semibold text-gray-900 text-sm">
              Your request for <span className="text-primary-600">{r.equipmentName}</span>
              <span className="text-gray-400 font-normal"> · owner: {r.ownerName}</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            📅 {fmtDate(r.fromDate)} → {fmtDate(r.toDate)} ({days} day{days > 1 ? 's' : ''})
          </p>
          <p className="text-xs text-gray-500 mt-0.5">📞 {r.renterContact}</p>
          {r.message && <p className="text-xs text-gray-400 italic mt-1">"{r.message}"</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : r.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {r.status}
          </span>
          {isIncoming && r.status === 'pending' && (
            <>
              <button onClick={() => onUpdateStatus(r._id, 'accepted')}
                className="bg-primary-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-700 transition">Accept</button>
              <button onClick={() => onUpdateStatus(r._id, 'declined')}
                className="border border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition">Decline</button>
            </>
          )}
        </div>
      </div>
    )
  }

  const pending  = incoming.filter(r => r.status === 'pending')
  const accepted = incoming.filter(r => r.status === 'accepted')
  const declined = incoming.filter(r => r.status === 'declined')

  return (
    <div>
      {/* Toggle incoming / outgoing */}
      <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden w-fit">
        <button onClick={() => setView('incoming')}
          className={`px-5 py-2 text-sm font-medium transition ${view === 'incoming' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          📥 Received {pending.length > 0 && `(${pending.length} pending)`}
        </button>
        <button onClick={() => setView('outgoing')}
          className={`px-5 py-2 text-sm font-medium transition ${view === 'outgoing' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          📤 Sent {outgoing.length > 0 && `(${outgoing.length})`}
        </button>
      </div>

      {view === 'incoming' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[{ label: 'Total', value: incoming.length, color: 'text-gray-900' },
              { label: 'Pending', value: pending.length, color: 'text-yellow-600' },
              { label: 'Accepted', value: accepted.length, color: 'text-green-600' }]
              .map(s => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
          </div>

          {incoming.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">📥</div>
              <p className="text-lg font-semibold text-gray-600">No incoming requests yet</p>
              <p className="text-sm mt-1">List equipment so other farmers can request it.</p>
            </div>
          ) : (
            <>
              {pending.length  > 0 && <Section title="🕐 Pending"  badge={pending.length}>{pending.map(r  => <ReqCard key={r._id} r={r} isIncoming />)}</Section>}
              {accepted.length > 0 && <Section title="✅ Accepted">{accepted.map(r => <ReqCard key={r._id} r={r} isIncoming />)}</Section>}
              {declined.length > 0 && <Section title="❌ Declined">{declined.map(r => <ReqCard key={r._id} r={r} isIncoming />)}</Section>}
            </>
          )}
        </>
      )}

      {view === 'outgoing' && (
        outgoing.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📤</div>
            <p className="text-lg font-semibold text-gray-600">No sent requests yet</p>
            <p className="text-sm mt-1">Browse equipment and click "Request Rental"</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {outgoing.map(r => <ReqCard key={r._id} r={r} isIncoming={false} />)}
          </div>
        )
      )}
    </div>
  )
}

const Section = ({ title, badge, children }) => (
  <div className="mb-6">
    <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
      {title}
      {badge && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{badge}</span>}
    </h3>
    <div className="flex flex-col gap-3">{children}</div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// MY LISTINGS TAB
// ─────────────────────────────────────────────────────────────────────────────
const MyListingsTab = ({ myListings, onToggle, onDelete, onListNew }) => {
  const [q, setQ] = useState('')

  const items = myListings.filter(e =>
    !q.trim() || [e.name, e.location].join(' ').toLowerCase().includes(q.toLowerCase())
  )

  if (myListings.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">📋</div>
      <p className="text-lg font-semibold text-gray-600">You have no listings yet</p>
      <button onClick={onListNew} className="mt-3 bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
        ➕ List your first equipment
      </button>
    </div>
  )

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Filter listings..." value={q} onChange={e => setQ(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <button onClick={onListNew} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
          ➕ List new equipment
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">{items.length} listing{items.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(eq => (
          <div key={eq._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{CATEGORY_ICONS[eq.category] || '🔧'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{eq.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {eq.location}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${eq.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {eq.available ? 'Available' : 'Rented'}
              </span>
            </div>

            {eq.description && <p className="text-sm text-gray-600">{eq.description}</p>}

            <div className="text-xs text-gray-400 flex flex-col gap-1">
              <span>📞 {eq.contact}</span>
              <span>Listed {fmtDate(eq.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xl font-bold text-primary-600">
                ₹{Number(eq.ratePerDay).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-gray-400">/day</span>
              </span>
              <div className="flex gap-2">
                <button onClick={() => onToggle(eq._id)}
                  className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition">
                  {eq.available ? 'Mark Rented' : 'Mark Available'}
                </button>
                <button onClick={() => onDelete(eq._id)}
                  className="text-xs border border-red-200 rounded-lg px-2.5 py-1.5 text-red-500 hover:bg-red-50 transition">
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RENT MODAL
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_RENT = { renterContact: '', fromDate: todayStr(), toDate: '', message: '' }

const RentModal = ({ eq, onConfirm, onClose }) => {
  const [form,   setForm]   = useState(EMPTY_RENT)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(EMPTY_RENT); setErrors({}) }, [eq?._id])

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: '' })) }

  const days = form.fromDate && form.toDate
    ? Math.max(0, Math.round((new Date(form.toDate) - new Date(form.fromDate)) / 86400000)) : 0
  const cost = days > 0 && eq ? days * eq.ratePerDay : null

  const validate = () => {
    const e = {}
    if (!form.renterContact.trim()) e.renterContact = 'Contact number is required'
    if (!/^\d{10}$/.test(form.renterContact.trim())) e.renterContact = 'Enter valid 10-digit number'
    if (!form.fromDate) e.fromDate = 'Start date is required'
    if (!form.toDate)   e.toDate   = 'End date is required'
    if (form.fromDate && form.toDate && new Date(form.toDate) <= new Date(form.fromDate))
      e.toDate = 'End date must be after start date'
    return e
  }

  const handleConfirm = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try { await onConfirm(form) } finally { setSaving(false) }
  }

  if (!eq) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Request Rental</h2>
            <p className="text-sm text-gray-500 mt-0.5">{eq.name} · ₹{Number(eq.ratePerDay).toLocaleString('en-IN')}/day</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl ml-4">✕</button>
        </div>

        {/* Owner info */}
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 mb-4">
          📞 Owner: <strong>{eq.ownerName}</strong> · {eq.contact} · 📍 {eq.location}
        </div>

        <p className="text-xs text-gray-400 mb-4 italic">Your name from your account will be shared with the owner.</p>

        {/* Contact */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Your contact number <span className="text-red-500">*</span></label>
          <input type="tel" placeholder="10-digit mobile number" value={form.renterContact}
            onChange={e => set('renterContact', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <Err err={errors.renterContact} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">From date <span className="text-red-500">*</span></label>
            <input type="date" min={todayStr()} value={form.fromDate}
              onChange={e => set('fromDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Err err={errors.fromDate} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">To date <span className="text-red-500">*</span></label>
            <input type="date" min={form.fromDate || todayStr()} value={form.toDate}
              onChange={e => set('toDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Err err={errors.toDate} />
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Message (optional)</label>
          <textarea rows={2} placeholder="Any special requirements for the owner..."
            value={form.message} onChange={e => set('message', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>

        {/* Cost estimate */}
        {cost && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700 font-semibold mb-4">
            💰 Estimated: ₹{cost.toLocaleString('en-IN')} for {days} day{days > 1 ? 's' : ''}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleConfirm} disabled={saving}
            className="flex-[2] bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition disabled:opacity-60">
            {saving ? 'Sending...' : '📤 Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const EquipmentRental = () => {
  const { t } = useLanguage()

  const currentUser = getUser()  // { _id, name, ... } from localStorage after login

  // ── state ──
  const [tab,          setTab]          = useState('browse')
  const [allEquipment, setAllEquipment] = useState([])
  const [myListings,   setMyListings]   = useState([])
  const [incoming,     setIncoming]     = useState([])   // requests FOR my equipment
  const [outgoing,     setOutgoing]     = useState([])   // requests I sent
  const [loading,      setLoading]      = useState(true)
  const [apiError,     setApiError]     = useState('')
  const [rentTarget,   setRentTarget]   = useState(null)
  const [toast,        setToast]        = useState(null)

  const pendingCount = incoming.filter(r => r.status === 'pending').length

  // ── load all data from MongoDB ──
  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true); setApiError('')
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        fetch(`${API}`,                   { headers: authHeaders() }),
        fetch(`${API}/my`,                { headers: authHeaders() }),
        fetch(`${API}/requests/incoming`, { headers: authHeaders() }),
        fetch(`${API}/requests/outgoing`, { headers: authHeaders() }),
      ])
      if (!r1.ok) throw new Error('Could not load equipment. Make sure you are logged in and backend is running.')
      const [all, my, inc, out] = await Promise.all([r1.json(), r2.ok ? r2.json() : [], r3.ok ? r3.json() : [], r4.ok ? r4.json() : []])
      setAllEquipment(all); setMyListings(my); setIncoming(inc); setOutgoing(out)
    } catch (e) {
      setApiError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  // ── add listing ──
  const handleListSubmit = useCallback(async (form) => {
    try {
      const res = await fetch(`${API}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      const newItem = await res.json()
      setAllEquipment(p => [newItem, ...p])
      setMyListings(p   => [newItem, ...p])
      showToast('Equipment listed and saved!')
      setTab('browse')
    } catch (e) { showToast(e.message || 'Failed to list equipment', 'error') }
  }, [])

  // ── send rental request ──
  const handleRentConfirm = useCallback(async (form) => {
    if (!rentTarget) return
    try {
      const res = await fetch(`${API}/${rentTarget._id}/request`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      const newReq = await res.json()
      setOutgoing(p => [newReq, ...p])
      setRentTarget(null)
      showToast('Request sent! Owner will contact you.')
    } catch (e) { showToast(e.message || 'Failed to send request', 'error') }
  }, [rentTarget])

  // ── accept / decline ──
  const handleUpdateStatus = useCallback(async (reqId, status) => {
    try {
      const res = await fetch(`${API}/requests/${reqId}/status`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setIncoming(p => p.map(r => r._id === reqId ? updated : r))
      if (status === 'accepted') {
        setAllEquipment(p => p.map(e => e._id === updated.equipmentId ? { ...e, available: false } : e))
        setMyListings(p  => p.map(e => e._id === updated.equipmentId ? { ...e, available: false } : e))
      }
      showToast(status === 'accepted' ? 'Request accepted!' : 'Request declined.')
    } catch (e) { showToast('Failed to update request', 'error') }
  }, [])

  // ── toggle availability ──
  const handleToggle = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/${id}/availability`, { method: 'PATCH', headers: authHeaders() })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setAllEquipment(p => p.map(e => e._id === id ? updated : e))
      setMyListings(p   => p.map(e => e._id === id ? updated : e))
    } catch { showToast('Failed to update availability', 'error') }
  }, [])

  // ── delete listing ──
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Remove this listing? This cannot be undone.')) return
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error()
      setAllEquipment(p => p.filter(e => e._id !== id))
      setMyListings(p   => p.filter(e => e._id !== id))
      showToast('Listing removed.')
    } catch { showToast('Failed to remove listing', 'error') }
  }, [])

  const TABS = [
    { id: 'browse',     label: t('equipment.allEquipment'),     icon: '🚜' },
    { id: 'list',       label: t('equipment.listYourEquipment'), icon: '➕' },
    { id: 'requests',   label: 'Requests', icon: '📥',           badge: pendingCount },
    { id: 'mylistings', label: 'My Listings', icon: '📋' },
  ]

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">

          {/* Header */}
          <div className="px-8 pt-8 pb-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('equipment.title')}</h2>
            <p className="text-gray-600">{t('equipment.subtitle')}</p>
            {currentUser?.name && (
              <p className="text-sm text-primary-600 mt-1">Logged in as <strong>{currentUser.name}</strong></p>
            )}

            {/* Tabs */}
            <div className="flex gap-0 mt-6 border-b border-gray-200 overflow-x-auto">
              {TABS.map(tb => (
                <button key={tb.id} onClick={() => setTab(tb.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === tb.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}>
                  <span>{tb.icon}</span>
                  <span>{tb.label}</span>
                  {tb.badge > 0 && (
                    <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {tb.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? <Spinner label="Loading from database..." /> : apiError ? (
              <div className="text-center py-16">
                <p className="text-red-500 font-semibold text-lg">⚠️ {apiError}</p>
                <p className="text-sm text-gray-500 mt-2">Make sure your backend is running and you are logged in.</p>
                <button onClick={loadAll} className="mt-4 bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                  Retry
                </button>
              </div>
            ) : (
              <>
                {tab === 'browse'     && <BrowseTab equipment={allEquipment} onRentClick={eq => setRentTarget(eq)} currentUserId={currentUser?._id || currentUser?.id} t={t} />}
                {tab === 'list'       && <ListTab myListings={myListings} onSubmit={handleListSubmit} t={t} />}
                {tab === 'requests'   && <RequestsTab incoming={incoming} outgoing={outgoing} onUpdateStatus={handleUpdateStatus} />}
                {tab === 'mylistings' && <MyListingsTab myListings={myListings} onToggle={handleToggle} onDelete={handleDelete} onListNew={() => setTab('list')} />}
              </>
            )}
          </div>

        </div>
      </div>

      <RentModal eq={rentTarget} onConfirm={handleRentConfirm} onClose={() => setRentTarget(null)} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

export default EquipmentRental