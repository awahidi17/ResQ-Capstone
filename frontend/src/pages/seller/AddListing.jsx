import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const CATS = ['Fruits','Vegetables','Bakery','Dairy','Pantry','Grains','Breakfast','Other']

export default function AddListing() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title:'', description:'', category:'Fruits',
    original_price:'', discounted_price:'', quantity:1,
    expiry_date:'', is_donation:false,
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const set = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    // enforce a price unless it's a donation
    if (!form.is_donation && +form.discounted_price <= 0) {
      setError('Please enter a valid discounted price'); return
    }
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api.php?route=listings', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          ...form,
          original_price:   form.is_donation ? 0 : +form.original_price,
          discounted_price: form.is_donation ? 0 : +form.discounted_price,
          quantity: +form.quantity,
          is_donation: form.is_donation ? 1 : 0,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 1600)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // show a live savings preview as seller types prices
  const saving = form.original_price > 0 && form.discounted_price > 0
    ? Math.round((1 - form.discounted_price / form.original_price) * 100)
    : null

  if (done) return (
    <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1rem'}}>
      <div style={{fontSize:'4rem'}}>✅</div>
      <h3 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)'}}>Listing published!</h3>
      <p style={{color:'var(--muted)'}}>Redirecting to your dashboard…</p>
    </div>
  )

  return (
    <div className="container py-4">
      <div style={{maxWidth:620,margin:'0 auto'}}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <Link to="/dashboard" className="btn-outline-f" style={{padding:'.35rem .9rem',fontSize:'.85rem'}}>← Back</Link>
          <div>
            <div className="eyebrow">Seller Portal</div>
            <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--forest)',fontSize:'1.75rem',margin:0}}>
              Add New Listing
            </h2>
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:'var(--r)',border:'1px solid var(--border)',padding:'2rem',boxShadow:'var(--shadow-sm)'}}>
          {error && (
            <div style={{background:'#fee2e2',color:'#991b1b',padding:'.85rem 1rem',borderRadius:'var(--r-sm)',marginBottom:'1.25rem',fontSize:'.9rem',border:'1px solid #fca5a5'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* donation toggle — prominent at the top */}
            <label style={{display:'flex',alignItems:'center',gap:'.85rem',background:'#ede9fe',borderRadius:'var(--r-sm)',padding:'1rem 1.25rem',marginBottom:'1.5rem',cursor:'pointer',border:'1px solid #c4b5fd'}}>
              <input type="checkbox" name="is_donation" checked={form.is_donation} onChange={set}
                style={{width:18,height:18,accentColor:'#6d28d9'}} />
              <div>
                <div style={{fontWeight:700,color:'#3b0764'}}>🎁 Mark as Free Donation</div>
                <div style={{fontSize:'.82rem',color:'#5b21b6',marginTop:'.15rem'}}>Food banks can claim this at no cost</div>
              </div>
            </label>

            <div style={{marginBottom:'1rem'}}>
              <label className="form-label">Title *</label>
              <input type="text" name="title" className="form-control" value={form.title} onChange={set}
                required placeholder="e.g. Fresh Organic Apples" />
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows={3} value={form.description} onChange={set}
                placeholder="Describe the food, its condition, quantity, packaging…" />
            </div>

            <div className="row g-3" style={{marginBottom:'1rem'}}>
              <div className="col-7">
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" value={form.category} onChange={set} required>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-5">
                <label className="form-label">Quantity *</label>
                <input type="number" name="quantity" className="form-control" value={form.quantity}
                  onChange={set} min={1} required />
              </div>
            </div>

            {/* price fields — hide for donations */}
            {!form.is_donation && (
              <div className="row g-3" style={{marginBottom:'1rem'}}>
                <div className="col-6">
                  <label className="form-label">Original Price ($)</label>
                  <input type="number" name="original_price" className="form-control" value={form.original_price}
                    onChange={set} step=".01" min="0" placeholder="0.00" />
                </div>
                <div className="col-6">
                  <label className="form-label">Your Price ($) *</label>
                  <input type="number" name="discounted_price" className="form-control" value={form.discounted_price}
                    onChange={set} step=".01" min="0.01" placeholder="0.00" required={!form.is_donation} />
                </div>
              </div>
            )}

            {/* live savings badge — shows while the seller is typing */}
            {saving !== null && !form.is_donation && saving > 0 && (
              <div style={{background:'#dcfce7',borderRadius:'var(--r-sm)',padding:'.85rem 1.1rem',marginBottom:'1rem',border:'1px solid #86efac',fontSize:'.9rem',color:'#15803d'}}>
                🏷️ Buyers save <strong>{saving}%</strong> — that's <strong>${(form.original_price - form.discounted_price).toFixed(2)}</strong> off per unit. Great deal!
              </div>
            )}

            <div style={{marginBottom:'1.5rem'}}>
              <label className="form-label">Expiry Date</label>
              <input type="date" name="expiry_date" className="form-control" value={form.expiry_date}
                onChange={set} min={new Date().toISOString().split('T')[0]} />
            </div>

            <button type="submit" className="btn-forest w-100 justify-content-center py-2"
              style={{borderRadius:'var(--r-sm)',fontSize:'1rem'}} disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Publishing…</> : 'Publish Listing →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
