import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const socket = io('/', { path: '/socket.io' })

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 10px 0',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    margin: 0
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#10b981',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideIn 0.3s ease-out'
  },
  toastError: {
    background: '#ef4444'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  cardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: '0 0 20px 0',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box'
  },
  inputFocus: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    marginTop: '8px'
  },
  buttonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  buttonDanger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  },
  touristList: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  touristItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '12px',
    background: '#f8fafc',
    transition: 'background-color 0.2s ease'
  },
  touristInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  touristName: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '16px'
  },
  touristId: {
    fontSize: '12px',
    color: '#64748b',
    fontFamily: 'monospace'
  },
  safetyScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  safetyScoreGood: {
    background: '#dcfce7',
    color: '#166534'
  },
  safetyScoreMedium: {
    background: '#fef3c7',
    color: '#92400e'
  },
  safetyScoreLow: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  icon: {
    width: '20px',
    height: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b'
  }
}

export default function App() {
  const [tourists, setTourists] = useState([])
  const [toast, setToast] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentView, setCurrentView] = useState('main') // main, dashboard, zones
  const [dashboardData, setDashboardData] = useState(null)
  const [zones, setZones] = useState([])
  const [alerts, setAlerts] = useState([])
  const [form, setForm] = useState({
    name: '', docType: 'passport', docNumber: '', days: 3,
    tripStart: '', tripEnd: '',
    emergencyName: '', emergencyPhone: ''
  })
  const [panic, setPanic] = useState({ touristId: '', lat: 26.1445, lng: 91.7362 })
  const [zoneForm, setZoneForm] = useState({
    name: '', type: 'restricted', riskLevel: 'high', 
    centerLat: 26.1445, centerLng: 91.7362, radius: 1000, description: ''
  })
  const [language, setLanguage] = useState('en')

  const translations = {
    en: {
      title: 'Tourist Safety Monitor',
      subtitle: 'Real-time safety tracking and emergency response system',
      main: 'Main',
      dashboard: 'Dashboard',
      zones: 'Zones',
      issueId: 'Issue Tourist ID',
      panicAlert: 'Panic Alert',
      registeredTourists: 'Registered Tourists',
      systemStats: 'System Statistics',
      recentAlerts: 'Recent Alerts',
      createZone: 'Create Geo-Zone',
      activeZones: 'Active Zones'
    },
    hi: {
      title: 'पर्यटक सुरक्षा मॉनिटर',
      subtitle: 'रियल-टाइम सुरक्षा ट्रैकिंग और आपातकालीन प्रतिक्रिया प्रणाली',
      main: 'मुख्य',
      dashboard: 'डैशबोर्ड',
      zones: 'क्षेत्र',
      issueId: 'पर्यटक आईडी जारी करें',
      panicAlert: 'पैनिक अलर्ट',
      registeredTourists: 'पंजीकृत पर्यटक',
      systemStats: 'सिस्टम आंकड़े',
      recentAlerts: 'हाल के अलर्ट',
      createZone: 'जियो-ज़ोन बनाएं',
      activeZones: 'सक्रिय क्षेत्र'
    },
    bn: {
      title: 'পর্যটক নিরাপত্তা মনিটর',
      subtitle: 'রিয়েল-টাইম নিরাপত্তা ট্র্যাকিং এবং জরুরি প্রতিক্রিয়া সিস্টেম',
      main: 'প্রধান',
      dashboard: 'ড্যাশবোর্ড',
      zones: 'অঞ্চল',
      issueId: 'পর্যটক আইডি জারি করুন',
      panicAlert: 'প্যানিক অ্যালার্ট',
      registeredTourists: 'নিবন্ধিত পর্যটক',
      systemStats: 'সিস্টেম পরিসংখ্যান',
      recentAlerts: 'সাম্প্রতিক অ্যালার্ট',
      createZone: 'জিও-জোন তৈরি করুন',
      activeZones: 'সক্রিয় অঞ্চল'
    }
  }

  const t = translations[language] || translations.en

  useEffect(() => {
    fetch('/api/tourists').then(r => r.json()).then(setTourists)
    fetch('/api/zones').then(r => r.json()).then(setZones)
    fetch('/api/dashboard').then(r => r.json()).then(setDashboardData)
  }, [])

  useEffect(() => {
    socket.on('tourist:new', t => {
      setToast({ message: 'New tourist registered: ' + (t.name || t.touristId), type: 'success' })
      setTimeout(() => setToast(null), 4000)
      setTourists(prev => [t, ...prev])
    })
    socket.on('alert:panic', a => {
      setToast({ message: '🚨 PANIC ALERT: ' + a.touristId, type: 'error' })
      setTimeout(() => setToast(null), 6000)
      setAlerts(prev => [a, ...prev])
    })
    socket.on('geo:alert', a => {
      setToast({ message: `🚧 GEO-FENCE ALERT: ${a.touristId} entered ${a.zoneName}`, type: 'error' })
      setTimeout(() => setToast(null), 5000)
      setAlerts(prev => [a, ...prev])
    })
    socket.on('zone:new', z => {
      setZones(prev => [z, ...prev])
    })
    return () => { 
      socket.off('tourist:new'); 
      socket.off('alert:panic'); 
      socket.off('geo:alert');
      socket.off('zone:new');
    }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const getSafetyScoreStyle = (score) => {
    if (score >= 80) return styles.safetyScoreGood
    if (score >= 60) return styles.safetyScoreMedium
    return styles.safetyScoreLow
  }

  const getSafetyScoreText = (score) => {
    if (score >= 80) return 'High'
    if (score >= 60) return 'Medium'
    return 'Low'
  }

  async function submitId(e) {
    e.preventDefault()
    if (!form.name || !form.docNumber || !form.tripStart || !form.tripEnd) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    setIsSubmitting(true)
    try {
      const payload = {
        name: form.name,
        docType: form.docType,
        docNumber: form.docNumber,
        itinerary: { days: Number(form.days) },
        emergencyContacts: [{ name: form.emergencyName, phone: form.emergencyPhone }],
        tripStart: form.tripStart,
        tripEnd: form.tripEnd
      }
      const res = await fetch('/api/id', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      const json = await res.json()
      
      if (res.ok) {
        showToast(`✅ Tourist ID issued: ${json.touristId} (Safety Score: ${json.safetyScore})`)
        setForm({
          name: '', docType: 'passport', docNumber: '', days: 3,
          tripStart: '', tripEnd: '',
          emergencyName: '', emergencyPhone: ''
        })
      } else {
        showToast('Failed to issue ID', 'error')
      }
    } catch (error) {
      showToast('Network error', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitPanic(e) {
    e.preventDefault()
    if (!panic.touristId) {
      showToast('Please enter a Tourist ID', 'error')
      return
    }
    
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/alert/panic', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(panic) 
      })
      if (res.ok) { 
        showToast('🚨 Panic alert sent successfully')
        setPanic({ ...panic, touristId: '' })
      } else {
        showToast('Failed to send panic alert', 'error')
      }
    } catch (error) {
      showToast('Network error', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitZone(e) {
    e.preventDefault()
    if (!zoneForm.name) {
      showToast('Please enter zone name', 'error')
      return
    }
    
    setIsSubmitting(true)
    try {
      const payload = {
        name: zoneForm.name,
        type: zoneForm.type,
        riskLevel: zoneForm.riskLevel,
        center: { lat: Number(zoneForm.centerLat), lng: Number(zoneForm.centerLng) },
        radius: Number(zoneForm.radius),
        description: zoneForm.description
      }
      const res = await fetch('/api/zones', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      if (res.ok) { 
        showToast('✅ Zone created successfully')
        setZoneForm({
          name: '', type: 'restricted', riskLevel: 'high', 
          centerLat: 26.1445, centerLng: 91.7362, radius: 1000, description: ''
        })
      } else {
        showToast('Failed to create zone', 'error')
      }
    } catch (error) {
      showToast('Network error', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function generateEFIR(touristId) {
    const reporterName = prompt('Reporter Name:')
    const reporterContact = prompt('Reporter Contact:')
    const description = prompt('Description of incident:')
    
    if (!reporterName || !reporterContact || !description) {
      showToast('All fields are required for E-FIR', 'error')
      return
    }
    
    try {
      const res = await fetch('/api/efir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId,
          reporterName,
          reporterContact,
          lastSeenLocation: 'Unknown',
          description
        })
      })
      const json = await res.json()
      if (res.ok) {
        showToast(`✅ E-FIR generated: ${json.firNumber}`)
      } else {
        showToast('Failed to generate E-FIR', 'error')
      }
    } catch (error) {
      showToast('Network error', 'error')
    }
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
        .input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); outline: none; }
        .tourist-item:hover { background-color: #f1f5f9; }
      `}</style>
      
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div></div>
          <select 
            value={language} 
            onChange={e => setLanguage(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px'
            }}
          >
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 हिंदी</option>
            <option value="bn">🇧🇩 বাংলা</option>
          </select>
        </div>
        
        <h1 style={styles.title}>🛡️ {t.title}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setCurrentView('main')}
            style={{
              padding: '8px 16px',
              background: currentView === 'main' ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏠 {t.main}
          </button>
          <button 
            onClick={() => setCurrentView('dashboard')}
            style={{
              padding: '8px 16px',
              background: currentView === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📊 {t.dashboard}
          </button>
          <button 
            onClick={() => setCurrentView('zones')}
            style={{
              padding: '8px 16px',
              background: currentView === 'zones' ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗺️ {t.zones}
          </button>
        </div>
      </div>

      {toast && (
        <div style={{...styles.toast, ...(toast.type === 'error' ? styles.toastError : {})}}>
          {toast.message}
        </div>
      )}

      {currentView === 'main' && (
        <div>
          <div style={styles.mainGrid}>
          <div className="card" style={styles.card}>
          <h3 style={styles.cardTitle}>
            🆔 {t.issueId}
          </h3>
          <form onSubmit={submitId}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input 
                className="input"
                style={styles.input}
                placeholder="Enter tourist's full name" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Document Type</label>
              <select 
                style={styles.select}
                value={form.docType} 
                onChange={e => setForm({ ...form, docType: e.target.value })}
              >
                <option value="passport">Passport</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Document Number *</label>
              <input 
                className="input"
                style={styles.input}
                placeholder="Enter document number" 
                value={form.docNumber} 
                onChange={e => setForm({ ...form, docNumber: e.target.value })} 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Trip Duration (Days)</label>
              <input 
                className="input"
                style={styles.input}
                type="number" 
                placeholder="Number of days" 
                value={form.days} 
                onChange={e => setForm({ ...form, days: e.target.value })} 
                min="1"
                max="365"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Trip Start Date *</label>
              <input 
                className="input"
                style={styles.input}
                type="date" 
                value={form.tripStart} 
                onChange={e => setForm({ ...form, tripStart: e.target.value })} 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Trip End Date *</label>
              <input 
                className="input"
                style={styles.input}
                type="date" 
                value={form.tripEnd} 
                onChange={e => setForm({ ...form, tripEnd: e.target.value })} 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Emergency Contact Name</label>
              <input 
                className="input"
                style={styles.input}
                placeholder="Emergency contact name" 
                value={form.emergencyName} 
                onChange={e => setForm({ ...form, emergencyName: e.target.value })} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Emergency Contact Phone</label>
              <input 
                className="input"
                style={styles.input}
                placeholder="Emergency contact phone" 
                value={form.emergencyPhone} 
                onChange={e => setForm({ ...form, emergencyPhone: e.target.value })} 
              />
            </div>
            
            <button 
              className="button"
              style={styles.button}
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Issuing...' : 'Issue Tourist ID'}
            </button>
          </form>
        </div>

        <div className="card" style={styles.card}>
          <h3 style={styles.cardTitle}>
            🚨 {t.panicAlert}
          </h3>
          <form onSubmit={submitPanic}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tourist ID *</label>
              <input 
                className="input"
                style={styles.input}
                placeholder="Enter tourist ID" 
                value={panic.touristId} 
                onChange={e => setPanic({ ...panic, touristId: e.target.value })} 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Latitude</label>
              <input 
                className="input"
                style={styles.input}
                type="number" 
                step="0.0001" 
                placeholder="Latitude" 
                value={panic.lat} 
                onChange={e => setPanic({ ...panic, lat: Number(e.target.value) })} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Longitude</label>
              <input 
                className="input"
                style={styles.input}
                type="number" 
                step="0.0001" 
                placeholder="Longitude" 
                value={panic.lng} 
                onChange={e => setPanic({ ...panic, lng: Number(e.target.value) })} 
              />
            </div>
            
            <button 
              className="button"
              style={{...styles.button, ...styles.buttonDanger}}
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Panic Alert'}
            </button>
          </form>
          </div>
        </div>

        <div style={styles.touristList}>
          <h3 style={styles.cardTitle}>
            👥 {t.registeredTourists} ({tourists.length})
          </h3>
          {tourists.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No tourists registered yet. Issue an ID to get started!</p>
            </div>
          ) : (
            <div>
              {tourists.map((t, idx) => (
                <div key={idx} className="tourist-item" style={styles.touristItem}>
                  <div style={styles.touristInfo}>
                    <div style={styles.touristName}>
                      {t.name || 'Unknown Tourist'}
                    </div>
                    <div style={styles.touristId}>
                      ID: {t._id?.toString() || t.touristId}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      📅 {new Date(t.createdAt).toLocaleDateString()} • 
                      📋 {t.docType?.toUpperCase()} • 
                      🗓️ {t.itinerary?.days || 0} days
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.safetyScore !== null && (
                      <div style={{...styles.safetyScore, ...getSafetyScoreStyle(t.safetyScore)}}>
                        🛡️ {getSafetyScoreText(t.safetyScore)} ({t.safetyScore})
                      </div>
                    )}
                    <button 
                      onClick={() => generateEFIR(t._id?.toString() || t.touristId)}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      📝 E-FIR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      )}

      {currentView === 'dashboard' && (
        <div style={styles.mainGrid}>
          <div className="card" style={styles.card}>
            <h3 style={styles.cardTitle}>📊 {t.systemStats}</h3>
            {dashboardData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1' }}>{dashboardData.stats.tourists}</div>
                  <div style={{ color: '#64748b' }}>Total Tourists</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>{dashboardData.stats.alerts}</div>
                  <div style={{ color: '#64748b' }}>24h Alerts</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: '#fecaca', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991b1b' }}>{dashboardData.stats.activeEfirs}</div>
                  <div style={{ color: '#64748b' }}>Active E-FIRs</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: '#d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>{dashboardData.stats.zones}</div>
                  <div style={{ color: '#64748b' }}>Geo-Zones</div>
                </div>
              </div>
            ) : (
              <div>Loading dashboard data...</div>
            )}
          </div>

          <div className="card" style={styles.card}>
            <h3 style={styles.cardTitle}>🚨 {t.recentAlerts}</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {alerts.length === 0 ? (
                <div style={styles.emptyState}>No recent alerts</div>
              ) : (
                alerts.slice(0, 10).map((alert, idx) => (
                  <div key={idx} style={{ 
                    padding: '12px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px', 
                    marginBottom: '8px',
                    background: alert.type === 'PANIC' ? '#fee2e2' : '#fef3c7'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {alert.type === 'PANIC' ? '🚨' : '🚧'} {alert.type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Tourist: {alert.touristId} • {new Date(alert.createdAt).toLocaleString()}
                    </div>
                    {alert.zoneName && (
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Zone: {alert.zoneName} (Risk: {alert.riskLevel})
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {currentView === 'zones' && (
        <div style={styles.mainGrid}>
          <div className="card" style={styles.card}>
            <h3 style={styles.cardTitle}>🗺️ {t.createZone}</h3>
            <form onSubmit={submitZone}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Zone Name *</label>
                <input 
                  className="input"
                  style={styles.input}
                  placeholder="e.g., Restricted Forest Area" 
                  value={zoneForm.name} 
                  onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} 
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Zone Type</label>
                <select 
                  style={styles.select}
                  value={zoneForm.type} 
                  onChange={e => setZoneForm({ ...zoneForm, type: e.target.value })}
                >
                  <option value="restricted">Restricted Area</option>
                  <option value="high_risk">High Risk Zone</option>
                  <option value="monitoring">Monitoring Zone</option>
                  <option value="safe">Safe Zone</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Risk Level</label>
                <select 
                  style={styles.select}
                  value={zoneForm.riskLevel} 
                  onChange={e => setZoneForm({ ...zoneForm, riskLevel: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Center Latitude</label>
                  <input 
                    className="input"
                    style={styles.input}
                    type="number" 
                    step="0.0001" 
                    value={zoneForm.centerLat} 
                    onChange={e => setZoneForm({ ...zoneForm, centerLat: e.target.value })} 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Center Longitude</label>
                  <input 
                    className="input"
                    style={styles.input}
                    type="number" 
                    step="0.0001" 
                    value={zoneForm.centerLng} 
                    onChange={e => setZoneForm({ ...zoneForm, centerLng: e.target.value })} 
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Radius (meters)</label>
                <input 
                  className="input"
                  style={styles.input}
                  type="number" 
                  value={zoneForm.radius} 
                  onChange={e => setZoneForm({ ...zoneForm, radius: e.target.value })} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea 
                  className="input"
                  style={{...styles.input, minHeight: '80px'}}
                  placeholder="Zone description and safety notes" 
                  value={zoneForm.description} 
                  onChange={e => setZoneForm({ ...zoneForm, description: e.target.value })} 
                />
              </div>
              
              <button 
                className="button"
                style={styles.button}
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Zone'}
              </button>
            </form>
          </div>

          <div className="card" style={styles.card}>
            <h3 style={styles.cardTitle}>🗺️ {t.activeZones} ({zones.length})</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {zones.length === 0 ? (
                <div style={styles.emptyState}>No zones created yet</div>
              ) : (
                zones.map((zone, idx) => (
                  <div key={idx} style={{ 
                    padding: '16px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    marginBottom: '12px',
                    background: zone.riskLevel === 'high' ? '#fee2e2' : 
                               zone.riskLevel === 'medium' ? '#fef3c7' : '#d1fae5'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                      {zone.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Type: {zone.type} • Risk: {zone.riskLevel} • Radius: {zone.radius}m
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Center: {zone.center?.lat?.toFixed(4)}, {zone.center?.lng?.toFixed(4)}
                    </div>
                    {zone.description && (
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {zone.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


