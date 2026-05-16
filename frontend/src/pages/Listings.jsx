import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

// each category gets a real Unsplash photo as the card thumbnail
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
const CATS = ['All','Fruits','Vegetables','Bakery','Dairy','Pantry','Grains','Breakfast']

function ListingCard({ l }) {
  const img    = CAT_PHOTOS[l.category] || CAT_PHOTOS.default
  const isDon  = l.is_donation == 1
  const saving = l.original_price > 0
    ? Math.round((1 - l.discounted_price / l.original_price) * 100)
    : 0

  // warn if expiry is within 3 days
  const expiringSoon = l.expiry_date && (() => {
    const days = Math.ceil((new Date(l.expiry_date) - Date.now()) / 86_400_000)
    return days >= 0 && days <= 3
  })()

  return (
    <div className="col-sm-6 col-lg-4 fu">
      <div className="l-card h-100">
        <div className="l-card-img">
          <img src={img} alt={l.title} loading="lazy" />
          {expiringSoon && (
            <div style={{position:'absolute',top:10,right:10}}>
              <span className="tag tag-red">⏰ Expiring soon</span>
            </div>
          )}
        </div>

        <div className="l-card-body">
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <span className={isDon ? 'tag tag-purple' : 'tag tag-green'}>
              {isDon ? '🎁 Donation' : l.category}
            </span>
            {saving > 0 && <span className="tag tag-amber">-{saving}% off</span>}
          </div>

          <h6 style={{fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'1rem',marginBottom:'.35rem'}}>
            {l.title}
          </h6>
          <p style={{fontSize:'.87rem',color:'var(--muted)',flexGrow:1,lineHeight:1.5}}>
            {l.description?.slice(0, 85)}{l.description?.length > 85 ? '…' : ''}
          </p>

          <div style={{fontSize:'.8rem',color:'var(--muted)',marginBottom:'.75rem'}}>
            <span>🏪 {l.seller_name}</span>
            {l.expiry_date && <span className="ms-3">📅 {l.expiry_date}</span>}
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2"
            style={{borderTop:'1px solid var(--border)'}}>
            {isDon ? (
              <span className="price-free">Free 🎁</span>
            ) : (
              <div>
                <span className="price-now">${parseFloat(l.discounted_price).toFixed(2)}</span>
                {l.original_price > 0 && (
                  <span className="price-was ms-2">${parseFloat(l.original_price).toFixed(2)}</span>
                )}
              </div>
            )}
            <div className="d-flex align-items-center gap-2">
              <small style={{color:'var(--muted)'}}>×{l.quantity}</small>
              <Link className="btn-forest" style={{padding:'.38rem 1rem',fontSize:'.82rem'}} to={`/listings/${l.id}`}>
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Listings() {
  const [searchParams]         = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [cat, setCat]           = useState(searchParams.get('cat') || 'All')
  const [search, setSearch]     = useState('')
  const [donOnly, setDonOnly]   = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams({ route:'listings' })
    if (cat !== 'All') p.set('category', cat)
    if (search)        p.set('search', search)
    if (donOnly)       p.set('is_donation', 1)

    fetch(`/api.php?${p}`, { credentials:'include' })
      .then(r => r.json())
      .then(d => setListings(d.listings || []))
      .finally(() => setLoading(false))
  }, [cat, donOnly])

  // re-fetch when category or donation toggle changes
  useEffect(() => { load() }, [load])

  const handleSearch = e => {
    e.preventDefault()
    load()
  }

  return (
    <>
      {/* page header */}
      <div className="page-hero">
        <div className="container">
          <h2>Browse Food Listings</h2>
          <p>Discover great deals and help reduce food waste in your community</p>
        </div>
      </div>

      <div className="container pb-5">
        {/* search + filters */}
        <div style={{background:'#fff',borderRadius:'var(--r)',border:'1px solid var(--border)',padding:'1.25rem',marginBottom:'1.75rem',boxShadow:'var(--shadow-sm)'}}>
          <form onSubmit={handleSearch} className="d-flex gap-2 mb-3 flex-wrap">
            <div className="search-bar flex-grow-1" style={{maxWidth:440}}>
              <span style={{color:'var(--muted)'}}>🔍</span>
              <input
                type="text" placeholder="Search by name, category…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-forest" style={{padding:'.6rem 1.4rem'}}>Search</button>
          </form>

          {/* category chips */}
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {CATS.map(c => (
              <button key={c} type="button" className={`chip ${cat === c ? 'on' : ''}`}
                onClick={() => setCat(c)}>{c}</button>
            ))}
            <div className="ms-auto">
              <label style={{cursor:'pointer',display:'flex',alignItems:'center',gap:'.4rem',fontSize:'.88rem',color:'var(--muted)',fontWeight:500}}>
                <input type="checkbox" checked={donOnly} onChange={e => setDonOnly(e.target.checked)} />
                🎁 Donations only
              </label>
            </div>
          </div>
        </div>

        {/* results */}
        {loading ? (
          <div className="spin-wrap">
            <div className="spinner-border spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <span className="emo">🔍</span>
            <h5>Nothing found</h5>
            <p>Try a different search term or category</p>
          </div>
        ) : (
          <>
            <p style={{color:'var(--muted)',fontSize:'.9rem',marginBottom:'1.25rem'}}>
              Showing <strong>{listings.length}</strong> listing{listings.length !== 1 ? 's' : ''}
              {cat !== 'All' && <> in <strong>{cat}</strong></>}
            </p>
            <div className="row g-4">
              {listings.map(l => <ListingCard key={l.id} l={l} />)}
            </div>
          </>
        )}
      </div>
    </>
  )
}
