import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// maps listing status to a visual style
const STATUS_STYLE = {
  active:  { bg:'#dcfce7', color:'#15803d', label:'Active'  },
  sold:    { bg:'#f3f4f6', color:'#374151', label:'Sold'    },
  expired: { bg:'#fef3c7', color:'#92400e', label:'Expired' },
  removed: { bg:'#fee2e2', color:'#991b1b', label:'Removed' },
}

function StatCard({ emoji, label, value, bg }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="d-stat">
        <div className="d-stat-icon" style={{background: bg || 'var(--cream-dark)'}}>
          {emoji}
        </div>
        <div>
          <div className="d-stat-val">{value}</div>
          <div className="d-stat-lbl">{label}</div>
        </div>
      </div>
    </div>
  )
}

export default function SellerDashboard() {
  const { user }                = useAuth()
  const [listings, setListings] = useState([])
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab, setTab]           = useState('listings')

  useEffect(() => {
    // load both in parallel — no need to wait for one before the other
    Promise.all([
      fetch('/api.php?route=seller/listings', { credentials:'include' }).then(r => r.json()),
      fetch('/api.php?route=orders',          { credentials:'include' }).then(r => r.json()),
    ]).then(([l, o]) => {
      setListings(l.listings || [])
      setOrders(o.orders   || [])
    }).finally(() => setLoading(false))
  }, [])

  const removeItem = async id => {
    if (!confirm('Remove this listing from the marketplace?')) return
    await fetch(`/api.php?route=listing&id=${id}`, { method:'DELETE', credentials:'include' })
    setListings(ls => ls.map(l => l.id === id ? { ...l, status:'removed' } : l))
  }

  // summary numbers for the stat row
  const active  = listings.filter(l => l.status === 'active').length
  const revenue = orders.reduce((s, o) => s + parseFloat(o.total_price), 0)

  if (loading) return <div className="spin-wrap"><div className="spinner-border spin" /></div>

  return (
    <div className="container py-4">
      {/* header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div className="eyebrow mb-1">Seller Portal</div>
          <h2 style={{color:'var(--forest)',fontFamily:'Playfair Display,serif'}}>
            Welcome back, {user.name} 👋
          </h2>
        </div>
        <Link className="btn-forest" to="/seller/add">+ New Listing</Link>
      </div>

      {/* stat row */}
      <div className="row g-3 mb-4">
        <StatCard emoji="📦" label="Active Listings" value={active}                     bg="#dcfce7" />
        <StatCard emoji="📋" label="Orders Received" value={orders.length}              bg="#fef3c7" />
        <StatCard emoji="💰" label="Revenue Earned"  value={`$${revenue.toFixed(2)}`}  bg="#ede9fe" />
        <StatCard emoji="🌱" label="Total Listed"    value={listings.length}            bg="var(--cream-dark)" />
      </div>

      {/* tabs */}
      <div style={{borderBottom:'2px solid var(--border)',marginBottom:'1.5rem',display:'flex',gap:'1.5rem'}}>
        {[['listings','My Listings',listings.length],['orders','Orders Received',orders.length]].map(([k,l,n]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{
              paddingBottom:'.75rem', border:'none', background:'none', cursor:'pointer',
              fontWeight:600, fontSize:'.9rem', borderBottom: tab === k ? '2px solid var(--forest)' : '2px solid transparent',
              color: tab === k ? 'var(--forest)' : 'var(--muted)', marginBottom:'-2px', transition:'color .2s'
            }}>
            {l} <span style={{background:'var(--cream-dark)',borderRadius:'50px',padding:'.1rem .5rem',fontSize:'.75rem',marginLeft:'.35rem'}}>{n}</span>
          </button>
        ))}
      </div>

      {tab === 'listings' && (
        listings.length === 0 ? (
          <div className="empty-state">
            <span className="emo">📦</span>
            <h5>No listings yet</h5>
            <p>Add your first food item and start earning</p>
            <Link className="btn-forest" to="/seller/add">Create First Listing</Link>
          </div>
        ) : (
          <div className="resq-table">
            <table className="table table-hover">
              <thead>
                <tr><th>Item</th><th>Category</th><th>Price</th><th>Qty</th><th>Expires</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {listings.map(l => {
                  const s = STATUS_STYLE[l.status] || STATUS_STYLE.active
                  return (
                    <tr key={l.id}>
                      <td style={{fontWeight:600}}>{l.title}</td>
                      <td style={{color:'var(--muted)'}}>{l.category || '—'}</td>
                      <td>{l.is_donation == 1
                        ? <span className="tag tag-purple">Free</span>
                        : <strong>${parseFloat(l.discounted_price).toFixed(2)}</strong>
                      }</td>
                      <td>{l.quantity}</td>
                      <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{l.expiry_date || '—'}</td>
                      <td><span style={{padding:'.2rem .65rem',borderRadius:'50px',fontSize:'.76rem',fontWeight:600,background:s.bg,color:s.color}}>{s.label}</span></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link to={`/listings/${l.id}`} className="btn-outline-f"
                            style={{padding:'.25rem .65rem',fontSize:'.78rem',borderWidth:'1.5px'}}>View</Link>
                          {l.status === 'active' && (
                            <button className="btn-outline-f" onClick={() => removeItem(l.id)}
                              style={{padding:'.25rem .65rem',fontSize:'.78rem',color:'#dc2626',borderColor:'#fca5a5',borderWidth:'1.5px'}}>
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'orders' && (
        orders.length === 0 ? (
          <div className="empty-state">
            <span className="emo">📋</span>
            <h5>No orders yet</h5>
            <p>Orders appear here once buyers purchase your listings</p>
          </div>
        ) : (
          <div className="resq-table">
            <table className="table table-hover">
              <thead>
                <tr><th>#</th><th>Item</th><th>Buyer</th><th>Qty</th><th>Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{color:'var(--muted)',fontSize:'.85rem'}}>#{o.id}</td>
                    <td style={{fontWeight:600}}>{o.title}</td>
                    <td style={{color:'var(--muted)'}}>{o.buyer_name}</td>
                    <td>{o.quantity}</td>
                    <td style={{fontWeight:700,color:'var(--forest)'}}>${parseFloat(o.total_price).toFixed(2)}</td>
                    <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
