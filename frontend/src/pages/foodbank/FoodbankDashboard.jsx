import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const CAT_PHOTOS = {
  Fruits:    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
  Bakery:    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
  Vegetables:'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  Dairy:     'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
  Pantry:    'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=600&q=80',
  Grains:    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  Breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f10a081a?auto=format&fit=crop&w=600&q=80',
  default:   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
}
export default function FoodbankDashboard() {
  const { user }                  = useAuth()
  const [available, setAvailable] = useState([])
  const [history,   setHistory]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [claiming,  setClaiming]  = useState(null)
  const [msg,       setMsg]       = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api.php?route=listings&is_donation=1', { credentials:'include' }).then(r => r.json()),
      fetch('/api.php?route=donations',              { credentials:'include' }).then(r => r.json()),
    ]).then(([l, d]) => {
      setAvailable(l.listings  || [])
      setHistory(d.donations   || [])
    }).finally(() => setLoading(false))
  }, [])

  const claim = async id => {
    setClaiming(id); setMsg(null)
    try {
      const r = await fetch('/api.php?route=donations', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ listing_id: id, quantity: 1 }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsg({ ok:true, text: d.message })
      // remove the item from available once claimed
      setAvailable(av => av.filter(l => l.id !== id))
    } catch (err) {
      setMsg({ ok:false, text: err.message })
    } finally {
      setClaiming(null)
    }
  }

  const totalClaimed = history.reduce((s, d) => s + parseInt(d.quantity), 0)

  if (loading) return <div className="spin-wrap"><div className="spinner-border spin" /></div>

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="eyebrow mb-1">Food Bank Portal</div>
        <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)'}}>
          Welcome, {user.name} ❤️
        </h2>
        <p style={{color:'var(--muted)'}}>Claim donated food for your community — completely free</p>
      </div>

      {/* stats */}
      <div className="row g-3 mb-4">
        {[
          ['🎁', 'Available Now',   available.length, '#ede9fe'],
          ['✅', 'Total Claims',    history.length,   '#dcfce7'],
          ['📦', 'Units Received',  totalClaimed,     '#fef3c7'],
          ['❤️', 'Families Helped', Math.max(1, Math.round(totalClaimed / 3)), 'var(--cream-dark)'],
        ].map(([e, l, v, bg]) => (
          <div key={l} className="col-6 col-lg-3">
            <div className="d-stat">
              <div className="d-stat-icon" style={{background:bg}}>{e}</div>
              <div>
                <div className="d-stat-val">{v}</div>
                <div className="d-stat-lbl">{l}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* feedback toast */}
      {msg && (
        <div style={{padding:'.85rem 1.1rem',borderRadius:'var(--r-sm)',marginBottom:'1.25rem',
          background: msg.ok ? '#dcfce7' : '#fee2e2',
          color:      msg.ok ? '#15803d' : '#991b1b',
          border:     `1px solid ${msg.ok ? '#86efac' : '#fca5a5'}`,fontSize:'.9rem'}}>
          {msg.ok ? '✅ ' : '⚠️ '}{msg.text}
        </div>
      )}

      {/* available donations */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)',margin:0}}>Available Donations</h5>
        <span className="tag tag-purple">{available.length} available</span>
      </div>

      {available.length === 0 ? (
        <div style={{background:'#fff',borderRadius:'var(--r)',border:'1px solid var(--border)',padding:'2.5rem',textAlign:'center',color:'var(--muted)',marginBottom:'2rem'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'.5rem'}}>🎁</div>
          <p style={{margin:0}}>No donations available right now. Check back soon — sellers post new items regularly.</p>
        </div>
      ) : (
        <div className="row g-4 mb-4">
          {available.map(l => (
            <div key={l.id} className="col-sm-6 col-lg-4">
              <div className="l-card h-100">
                <div className="l-card-img">
                  <img src={CAT_PHOTOS[l.category] || CAT_PHOTOS.default} alt={l.title} loading="lazy" />
                </div>
                <div className="l-card-body">
                  <div className="d-flex gap-2 mb-2">
                    <span className="tag tag-purple">🎁 Free</span>
                    <span className="tag tag-clay">{l.category}</span>
                  </div>
                  <h6 style={{fontFamily:'Playfair Display,serif',fontWeight:700,marginBottom:'.35rem'}}>{l.title}</h6>
                  <p style={{fontSize:'.87rem',color:'var(--muted)',flexGrow:1}}>{l.description?.slice(0, 80)}…</p>
                  <div style={{fontSize:'.8rem',color:'var(--muted)',marginBottom:'1rem'}}>
                    <span>📦 {l.quantity} units</span>
                    {l.expiry_date && <span className="ms-3">📅 {l.expiry_date}</span>}
                  </div>
                  <button className="btn-forest w-100 justify-content-center"
                    style={{borderRadius:'var(--r-sm)'}}
                    onClick={() => claim(l.id)} disabled={claiming === l.id}>
                    {claiming === l.id
                      ? <><span className="spinner-border spinner-border-sm me-1" />Claiming…</>
                      : '❤️ Claim Donation'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* claim history */}
      <h5 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)',margin:'0 0 1rem'}}>Claim History</h5>
      {history.length === 0 ? (
        <p style={{color:'var(--muted)'}}>No claims yet — claim your first donation above.</p>
      ) : (
        <div className="resq-table">
          <table className="table table-hover">
            <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {history.map(d => (
                <tr key={d.id}>
                  <td style={{color:'var(--muted)',fontSize:'.85rem'}}>#{d.id}</td>
                  <td style={{fontWeight:600}}>{d.title}</td>
                  <td>{d.quantity}</td>
                  <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{new Date(d.created_at).toLocaleDateString()}</td>
                  <td><span className={`tag ${d.status === 'received' ? 'tag-green' : 'tag-amber'}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
