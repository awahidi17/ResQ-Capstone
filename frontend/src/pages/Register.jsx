import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { value:'buyer',    emoji:'🛍️', label:'Buyer',     desc:'Buy discounted food near you' },
  { value:'seller',   emoji:'🏪', label:'Seller',    desc:'List and sell your surplus food' },
  { value:'foodbank', emoji:'❤️', label:'Food Bank', desc:'Claim free donations for your community' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'buyer' })
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setBusy(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      {/* photo side — different image to login */}
      <div className="auth-visual" style={{backgroundImage:"url('https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=900&q=80')"}}>
        <div className="auth-visual-overlay">
          <div className="auth-visual-quote">
            "Every kilogram of food rescued<br />is a meal on someone's table."
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="auth-form-side">
        <Link to="/" className="resq-brand mb-4 d-block" style={{fontSize:'1.4rem'}}>Res<em>Q</em></Link>

        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.9rem',color:'var(--forest)',marginBottom:'.4rem'}}>
          Join ResQ
        </h2>
        <p style={{color:'var(--muted)',marginBottom:'1.75rem'}}>Create your free account and start making a difference</p>

        {error && (
          <div style={{background:'#fee2e2',color:'#991b1b',border:'1px solid #fca5a5',borderRadius:'var(--r-sm)',padding:'.85rem 1rem',marginBottom:'1.25rem',fontSize:'.9rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* role picker */}
          <div style={{marginBottom:'1.25rem'}}>
            <label className="form-label">I want to join as a…</label>
            <div className="d-flex gap-2">
              {ROLES.map(r => (
                <label key={r.value} style={{flex:1,cursor:'pointer'}}>
                  <input type="radio" name="role" value={r.value}
                    checked={form.role === r.value} onChange={set} className="d-none" />
                  <div style={{
                    padding:'.75rem .5rem', borderRadius:'var(--r-sm)', textAlign:'center',
                    border: form.role === r.value ? '2px solid var(--leaf)' : '1.5px solid var(--border)',
                    background: form.role === r.value ? '#dcfce7' : '#fff',
                    transition:'all .18s',
                  }}>
                    <div style={{fontSize:'1.4rem',marginBottom:'.2rem'}}>{r.emoji}</div>
                    <div style={{fontWeight:700,fontSize:'.82rem',color:'var(--forest)'}}>{r.label}</div>
                    <div style={{fontSize:'.73rem',color:'var(--muted)',lineHeight:1.3}}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{marginBottom:'1rem'}}>
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-control" value={form.name}
              onChange={set} required placeholder="Jane Doe" />
          </div>
          <div style={{marginBottom:'1rem'}}>
            <label className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" value={form.email}
              onChange={set} required placeholder="you@example.com" />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={form.password}
              onChange={set} required placeholder="Min. 6 characters" />
          </div>

          <button type="submit" className="btn-forest w-100 justify-content-center py-2"
            style={{borderRadius:'var(--r-sm)',fontSize:'1rem'}} disabled={busy}>
            {busy ? <><span className="spinner-border spinner-border-sm me-2" />Creating account…</> : 'Create Account →'}
          </button>
        </form>

        <p style={{textAlign:'center',fontSize:'.9rem',marginTop:'1.5rem',color:'var(--muted)'}}>
          Already have an account? <Link to="/login" style={{color:'var(--forest)',fontWeight:600}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
