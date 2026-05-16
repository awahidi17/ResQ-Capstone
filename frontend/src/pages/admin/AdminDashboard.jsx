import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const ROLE_COLORS = { admin:'#fee2e2', seller:'#dcfce7', buyer:'#dbeafe', foodbank:'#ede9fe' }
const ROLE_TEXT   = { admin:'#991b1b', seller:'#15803d', buyer:'#1d4ed8', foodbank:'#5b21b6' }
const ROLE_ICONS  = { admin:'🛡️', seller:'🏪', buyer:'🛍️', foodbank:'❤️' }

export default function AdminDashboard() {
  const { user }                  = useAuth()
  const [stats,    setStats]      = useState(null)
  const [users,    setUsers]      = useState([])
  const [listings, setListings]   = useState([])
  const [tab,      setTab]        = useState('overview')
  const [loading,  setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api.php?route=admin/stats',    { credentials:'include' }).then(r => r.json()),
      fetch('/api.php?route=admin/users',    { credentials:'include' }).then(r => r.json()),
      fetch('/api.php?route=admin/listings', { credentials:'include' }).then(r => r.json()),
    ]).then(([s, u, l]) => {
      setStats(s.stats     || {})
      setUsers(u.users     || [])
      setListings(l.listings || [])
    }).finally(() => setLoading(false))
  }, [])

  const removeListing = async id => {
    if (!confirm('Remove this listing from the marketplace?')) return
    await fetch(`/api.php?route=listing&id=${id}`, { method:'DELETE', credentials:'include' })
    setListings(ls => ls.map(l => l.id === id ? { ...l, status:'removed' } : l))
  }

  if (loading) return <div className="spin-wrap"><div className="spinner-border spin" /></div>

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="eyebrow mb-1">Admin Portal</div>
        <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)'}}>
          Platform Overview
        </h2>
        <p style={{color:'var(--muted)'}}>Logged in as {user.name} — full platform access</p>
      </div>

      {/* top-level stat row */}
      {stats && (
        <div className="row g-3 mb-4">
          {[
            ['👥','Registered Users',  stats.total_users,    '#dbeafe'],
            ['📦','Total Listings',    stats.total_listings, '#fef3c7'],
            ['🛍️','Total Orders',     stats.total_orders,   '#dcfce7'],
            ['🎁','Donation Claims',   stats.total_donations,'#ede9fe'],
            ['🌍','Food Saved (kg)',   parseFloat(stats.food_saved_kg || 0).toFixed(1), 'var(--cream-dark)'],
            ['✅','Active Listings',   stats.active_listings,'#dcfce7'],
          ].map(([e, l, v, bg]) => (
            <div key={l} className="col-6 col-md-4 col-lg-2">
              <div className="d-stat" style={{flexDirection:'column',alignItems:'flex-start',gap:'.5rem'}}>
                <div className="d-stat-icon" style={{background:bg}}>{e}</div>
                <div className="d-stat-val" style={{fontSize:'1.5rem'}}>{v}</div>
                <div className="d-stat-lbl">{l}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* tabs */}
      <div style={{borderBottom:'2px solid var(--border)',marginBottom:'1.5rem',display:'flex',gap:'1.5rem'}}>
        {[['overview','📊 Overview'],['users','👥 Users'],['listings','📦 Listings']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{
              paddingBottom:'.75rem',border:'none',background:'none',cursor:'pointer',
              fontWeight:600,fontSize:'.9rem',
              borderBottom: tab === k ? '2px solid var(--forest)' : '2px solid transparent',
              color: tab === k ? 'var(--forest)' : 'var(--muted)',
              marginBottom:'-2px',transition:'color .2s'
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* overview tab: charts-lite using CSS bars */}
      {tab === 'overview' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div style={{background:'#fff',borderRadius:'var(--r)',border:'1px solid var(--border)',padding:'1.5rem',boxShadow:'var(--shadow-sm)'}}>
              <h6 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)',marginBottom:'1.25rem'}}>Users by Role</h6>
              {['admin','seller','buyer','foodbank'].map(role => {
                const count = users.filter(u => u.role === role).length
                const pct   = users.length ? Math.round((count / users.length) * 100) : 0
                return (
                  <div key={role} style={{marginBottom:'1rem'}}>
                    <div className="d-flex justify-content-between mb-1" style={{fontSize:'.88rem'}}>
                      <span style={{fontWeight:600}}>{ROLE_ICONS[role]} {role}</span>
                      <span style={{color:'var(--muted)'}}>{count} users ({pct}%)</span>
                    </div>
                    <div style={{height:8,background:'var(--cream-dark)',borderRadius:50}}>
                      <div style={{width:`${pct}%`,height:'100%',borderRadius:50,background:'var(--leaf)',transition:'width .8s ease'}} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="col-md-6">
            <div style={{background:'#fff',borderRadius:'var(--r)',border:'1px solid var(--border)',padding:'1.5rem',boxShadow:'var(--shadow-sm)'}}>
              <h6 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)',marginBottom:'1.25rem'}}>Platform Summary</h6>
              {[
                ['Total Registered Users',   stats?.total_users],
                ['Listings Ever Created',     stats?.total_listings],
                ['Listings Currently Active', stats?.active_listings],
                ['Successful Orders',         stats?.total_orders],
                ['Donation Claims Made',      stats?.total_donations],
                ['Estimated Food Saved',      `${parseFloat(stats?.food_saved_kg || 0).toFixed(1)} kg`],
              ].map(([l, v]) => (
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'.65rem 0',borderBottom:'1px solid var(--border)',fontSize:'.9rem'}}>
                  <span style={{color:'var(--muted)'}}>{l}</span>
                  <strong style={{color:'var(--forest)'}}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="resq-table">
          <table className="table table-hover">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{u.id}</td>
                  <td style={{fontWeight:600}}>{u.name}</td>
                  <td style={{color:'var(--muted)'}}>{u.email}</td>
                  <td>
                    <span style={{padding:'.2rem .65rem',borderRadius:'50px',fontSize:'.76rem',fontWeight:600,
                      background: ROLE_COLORS[u.role], color: ROLE_TEXT[u.role]}}>
                      {ROLE_ICONS[u.role]} {u.role}
                    </span>
                  </td>
                  <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'listings' && (
        <div className="resq-table">
          <table className="table table-hover">
            <thead><tr><th>#</th><th>Title</th><th>Seller</th><th>Price</th><th>Qty</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.id}>
                  <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{l.id}</td>
                  <td style={{fontWeight:600}}>{l.title}</td>
                  <td style={{color:'var(--muted)'}}>{l.seller_name}</td>
                  <td>{l.is_donation == 1 ? 'Free' : `$${parseFloat(l.discounted_price).toFixed(2)}`}</td>
                  <td>{l.quantity}</td>
                  <td>
                    {l.is_donation == 1
                      ? <span className="tag tag-purple">Donation</span>
                      : <span className="tag tag-green">Sale</span>}
                  </td>
                  <td>
                    <span className={`tag ${l.status === 'active' ? 'tag-green' : 'tag-clay'}`}>{l.status}</span>
                  </td>
                  <td>
                    {l.status === 'active' && (
                      <button onClick={() => removeListing(l.id)}
                        style={{background:'none',border:'none',cursor:'pointer',color:'#dc2626',fontSize:'.85rem',fontWeight:600}}
                        title="Remove listing">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
