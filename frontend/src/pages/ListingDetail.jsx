import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

export default function ListingDetail() {
  const { id }   = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [qty,     setQty]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [busy,    setBusy]    = useState(false)
  const [msg,     setMsg]     = useState(null)

  useEffect(() => {
    fetch(`/api.php?route=listing&id=${id}`, { credentials:'include' })
      .then(r => r.json())
      .then(d => { if (d.listing) setListing(d.listing) })
      .finally(() => setLoading(false))
  }, [id])

  // shared handler for both orders and donation claims
  const submit = async (route) => {
    if (!user) { navigate('/login'); return }
    setBusy(true); setMsg(null)
    try {
      const r = await fetch(`/api.php?route=${route}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id, quantity: qty }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsg({ ok: true, text: d.message })
      setListing(l => ({ ...l, quantity: l.quantity - qty }))
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  if (loading) return (
    <div className="spin-wrap"><div className="spinner-border spin" /></div>
  )
  if (!listing) return (
    <div className="container py-5">
      <div className="alert alert-warning">Listing not found. <Link to="/listings">Back to listings</Link></div>
    </div>
  )

  const isDon   = listing.is_donation == 1
  const img     = CAT_PHOTOS[listing.category] || CAT_PHOTOS.default
  const saving  = listing.original_price > 0
    ? Math.round((1 - listing.discounted_price / listing.original_price) * 100)
    : 0
  const totalSaving = (listing.original_price - listing.discounted_price) * qty

  return (
    <div className="container py-5">
      <Link to="/listings" className="btn-outline-f mb-4 d-inline-flex"
        style={{padding:'.4rem 1rem',fontSize:'.85rem'}}>
        ← Back to listings
      </Link>

      <div className="row g-5 align-items-start">
        {/* left: hero image */}
        <div className="col-lg-6">
          <div style={{borderRadius:'var(--r)',overflow:'hidden',aspectRatio:'4/3',boxShadow:'var(--shadow-lg)'}}>
            <img src={img} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          </div>

          {/* seller info card below image */}
          <div style={{background:'#fff',borderRadius:'var(--r)',border:'1px solid var(--border)',padding:'1.25rem',marginTop:'1rem',boxShadow:'var(--shadow-sm)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'var(--cream-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>
                🏪
              </div>
              <div>
                <div style={{fontWeight:600,color:'var(--forest)'}}>{listing.seller_name}</div>
                <div style={{fontSize:'.82rem',color:'var(--muted)'}}>Verified seller on ResQ</div>
              </div>
            </div>
          </div>
        </div>

        {/* right: details + action */}
        <div className="col-lg-6">
          {/* tags row */}
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <span className={isDon ? 'tag tag-purple' : 'tag tag-green'}>
              {isDon ? '🎁 Free Donation' : listing.category}
            </span>
            {saving > 0 && <span className="tag tag-amber">-{saving}% off</span>}
            {listing.status !== 'active' && <span className="tag tag-red">{listing.status}</span>}
          </div>

          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'var(--forest)',marginBottom:'.75rem'}}>
            {listing.title}
          </h1>
          <p style={{color:'var(--muted)',lineHeight:1.7,marginBottom:'1.5rem'}}>{listing.description}</p>

          {/* quick facts */}
          <div style={{background:'var(--cream)',borderRadius:'var(--r-sm)',padding:'1.1rem 1.25rem',marginBottom:'1.5rem'}}>
            <div className="row g-2" style={{fontSize:'.88rem'}}>
              <div className="col-6">📦 <strong>{listing.quantity}</strong> units available</div>
              {listing.expiry_date && <div className="col-6">📅 Expires <strong>{listing.expiry_date}</strong></div>}
              <div className="col-6">🏪 Sold by <strong>{listing.seller_name}</strong></div>
              <div className="col-6">🏷️ Category: <strong>{listing.category}</strong></div>
            </div>
          </div>

          {/* price display */}
          {isDon ? (
            <div style={{background:'#ede9fe',borderRadius:'var(--r-sm)',padding:'1.1rem 1.25rem',marginBottom:'1.5rem',border:'1px solid #c4b5fd'}}>
              <span className="price-free" style={{fontSize:'1.6rem'}}>Free Donation 🎁</span>
              <p style={{margin:'.4rem 0 0',fontSize:'.88rem',color:'#5b21b6'}}>Available at no cost for registered food banks</p>
            </div>
          ) : (
            <div style={{marginBottom:'1.5rem'}}>
              <div style={{display:'flex',alignItems:'baseline',gap:'.75rem',marginBottom:'.3rem'}}>
                <span className="price-now" style={{fontSize:'2rem'}}>${parseFloat(listing.discounted_price).toFixed(2)}</span>
                {listing.original_price > 0 && (
                  <span className="price-was" style={{fontSize:'1.1rem'}}>${parseFloat(listing.original_price).toFixed(2)}</span>
                )}
              </div>
              {saving > 0 && (
                <span className="tag tag-amber">You save ${(listing.original_price - listing.discounted_price).toFixed(2)} per unit</span>
              )}
            </div>
          )}

          {/* feedback message */}
          {msg && (
            <div style={{padding:'.85rem 1.1rem',borderRadius:'var(--r-sm)',marginBottom:'1rem',
              background: msg.ok ? '#dcfce7' : '#fee2e2',
              color:      msg.ok ? '#15803d' : '#991b1b',
              border:     `1px solid ${msg.ok ? '#86efac' : '#fca5a5'}`}}>
              {msg.ok ? '✅ ' : '⚠️ '}{msg.text}
            </div>
          )}

          {/* action section */}
          {listing.status === 'active' && listing.quantity > 0 ? (
            <div>
              {/* quantity stepper — only for paid items */}
              {!isDon && (
                <div className="d-flex align-items-center gap-3 mb-4">
                  <span style={{fontWeight:600,fontSize:'.9rem',color:'var(--forest)'}}>Quantity</span>
                  <div style={{display:'flex',alignItems:'center',gap:0,background:'var(--cream)',borderRadius:'50px',border:'1px solid var(--border)'}}>
                    <button onClick={() => setQty(q => Math.max(1, q-1))}
                      style={{width:36,height:36,border:'none',background:'transparent',cursor:'pointer',fontSize:'1.2rem',borderRadius:'50px',color:'var(--forest)'}}>−</button>
                    <span style={{width:32,textAlign:'center',fontWeight:700,color:'var(--forest)'}}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(listing.quantity, q+1))}
                      style={{width:36,height:36,border:'none',background:'transparent',cursor:'pointer',fontSize:'1.2rem',borderRadius:'50px',color:'var(--forest)'}}>+</button>
                  </div>
                  {qty > 1 && saving > 0 && (
                    <span className="tag tag-green">Total saving: ${totalSaving.toFixed(2)}</span>
                  )}
                </div>
              )}

              {/* the actual CTA — varies by role */}
              {!user ? (
                <Link className="btn-forest w-100 justify-content-center py-3" to="/login">
                  Login to {isDon ? 'Claim Donation' : 'Order'}
                </Link>
              ) : isDon && user.role === 'foodbank' ? (
                <button className="btn-forest w-100 justify-content-center py-3"
                  onClick={() => submit('donations')} disabled={busy}>
                  {busy ? <span className="spinner-border spinner-border-sm me-2" /> : '❤️ '}
                  Claim This Donation
                </button>
              ) : !isDon && user.role === 'buyer' ? (
                <button className="btn-forest w-100 justify-content-center py-3"
                  onClick={() => submit('orders')} disabled={busy}>
                  {busy ? <span className="spinner-border spinner-border-sm me-2" /> : '🛍️ '}
                  Order for ${(listing.discounted_price * qty).toFixed(2)}
                </button>
              ) : (
                <p style={{color:'var(--muted)',fontSize:'.9rem',background:'var(--cream)',padding:'.85rem',borderRadius:'var(--r-sm)'}}>
                  {isDon
                    ? '❕ Only food banks can claim donation items. Register as a food bank to claim.'
                    : '❕ Only buyers can place orders. Register as a buyer to order food.'}
                </p>
              )}
            </div>
          ) : (
            <div style={{background:'var(--cream)',borderRadius:'var(--r-sm)',padding:'1rem 1.25rem',color:'var(--muted)'}}>
              This listing is no longer available.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
