import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const socket = io('/', { path: '/socket.io' })

export default function App() {
  const [tourists, setTourists] = useState([])
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    name: '', docType: 'passport', docNumber: '', days: 3,
    tripStart: '', tripEnd: '',
    emergencyName: '', emergencyPhone: ''
  })
  const [panic, setPanic] = useState({ touristId: '', lat: 26.1445, lng: 91.7362 })

  useEffect(() => {
    fetch('/api/tourists').then(r => r.json()).then(setTourists)
  }, [])

  useEffect(() => {
    socket.on('tourist:new', t => {
      setToast('New tourist: ' + (t.name || t.touristId))
      setTimeout(() => setToast(null), 3000)
      setTourists(prev => [t, ...prev])
    })
    socket.on('alert:panic', a => {
      setToast('PANIC: ' + a.touristId)
      setTimeout(() => setToast(null), 3000)
    })
    return () => { socket.off('tourist:new'); socket.off('alert:panic') }
  }, [])

  async function submitId(e) {
    e.preventDefault()
    const payload = {
      name: form.name,
      docType: form.docType,
      docNumber: form.docNumber,
      itinerary: { days: Number(form.days) },
      emergencyContacts: [{ name: form.emergencyName, phone: form.emergencyPhone }],
      tripStart: form.tripStart,
      tripEnd: form.tripEnd
    }
    const res = await fetch('/api/id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()
    setToast('Issued ID: ' + json.touristId)
    setTimeout(() => setToast(null), 3000)
  }

  async function submitPanic(e) {
    e.preventDefault()
    const res = await fetch('/api/alert/panic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(panic) })
    if (res.ok) { setToast('Panic sent'); setTimeout(() => setToast(null), 3000) }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h2>Tourist Safety – MERN Demo</h2>
      {toast && <div style={{ background: '#333', color: '#fff', padding: 8, borderRadius: 6, display: 'inline-block' }}>{toast}</div>}
      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        <form onSubmit={submitId} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, width: 400 }}>
          <h3>Issue Tourist ID</h3>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <select value={form.docType} onChange={e => setForm({ ...form, docType: e.target.value })} style={{ width: '100%', marginBottom: 8 }}>
            <option value="passport">Passport</option>
            <option value="aadhaar">Aadhaar</option>
          </select>
          <input placeholder="Document Number" value={form.docNumber} onChange={e => setForm({ ...form, docNumber: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input type="number" placeholder="Days" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <label>Trip Start</label>
          <input type="date" value={form.tripStart} onChange={e => setForm({ ...form, tripStart: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <label>Trip End</label>
          <input type="date" value={form.tripEnd} onChange={e => setForm({ ...form, tripEnd: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input placeholder="Emergency Name" value={form.emergencyName} onChange={e => setForm({ ...form, emergencyName: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input placeholder="Emergency Phone" value={form.emergencyPhone} onChange={e => setForm({ ...form, emergencyPhone: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <button type="submit">Issue ID</button>
        </form>

        <form onSubmit={submitPanic} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, width: 400 }}>
          <h3>Panic Alert</h3>
          <input placeholder="Tourist ID" value={panic.touristId} onChange={e => setPanic({ ...panic, touristId: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input type="number" step="0.0001" placeholder="Latitude" value={panic.lat} onChange={e => setPanic({ ...panic, lat: Number(e.target.value) })} style={{ width: '100%', marginBottom: 8 }} />
          <input type="number" step="0.0001" placeholder="Longitude" value={panic.lng} onChange={e => setPanic({ ...panic, lng: Number(e.target.value) })} style={{ width: '100%', marginBottom: 8 }} />
          <button type="submit">Send Panic</button>
        </form>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Recent Tourists</h3>
        <ul>
          {tourists.map((t, idx) => (
            <li key={idx}>{t.name || t.touristId}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}


