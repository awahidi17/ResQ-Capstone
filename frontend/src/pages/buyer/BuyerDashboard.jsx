import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function BuyerDashboard() {
  const { user }              = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api.php?route=orders', { credentials:'include' })
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  const spent      = orders.reduce((s, o) => s + parseFloat(o.total_price), 0)
  const itemsTotal = orders.reduce((s, o) => s + parseInt(o.quantity), 0)
  // rough estimate: average 400g per item rescued
  const kgSaved    = (itemsTotal * 0.4).toFixed(1)

  if (loading) return <div className="spin-wrap"><div className="spinner-border spin" /></div>

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div className="eyebrow mb-1">Buyer Portal</div>
          <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)'}}>
            Your Orders, {user.name}
          </h2>
        </div>
        <Link className="btn-forest" to="/listings">Browse Food</Link>
      </div>

      {/* stats */}
      <div className="row g-3 mb-4">
        {[
          ['🛍️','Orders Placed',  orders.length,     '#fef3c7'],
          ['📦','Items Rescued',  itemsTotal,          '#dcfce7'],
          ['💰','Total Spent',    `$${spent.toFixed(2)}`, '#ede9fe'],
          ['🌍','Food Saved',     `~${kgSaved} kg`,   'var(--cream-dark)'],
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

      {/* order history */}
      <h5 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)',marginBottom:'1rem'}}>Order History</h5>

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="emo">🛍️</span>
          <h5>No orders yet</h5>
          <p>Browse our listings and place your first order!</p>
          <Link className="btn-forest" to="/listings">Browse Listings</Link>
        </div>
      ) : (
        <div className="resq-table">
          <table className="table table-hover">
            <thead>
              <tr><th>#</th><th>Item</th><th>Seller</th><th>Qty</th><th>Paid</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{color:'var(--muted)',fontSize:'.85rem'}}>#{o.id}</td>
                  <td style={{fontWeight:600}}>{o.title}</td>
                  <td style={{color:'var(--muted)'}}>{o.seller_name}</td>
                  <td>{o.quantity}</td>
                  <td style={{fontWeight:700,color:'var(--forest)'}}>${parseFloat(o.total_price).toFixed(2)}</td>
                  <td style={{color:'var(--muted)',fontSize:'.85rem'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><span className="tag tag-green">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
