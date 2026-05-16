import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// pre-fill button roles for demo convenience
const DEMO_EMAILS = { admin:'admin@resq.local', seller:'seller@resq.local', buyer:'buyer@resq.local', foodbank:'foodbank@resq.local' }

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // quick-fill demo credentials with one click
  const fillDemo = role => setForm({ email: DEMO_EMAILS[role], password:'password123' })

  return (
    <div className="auth-wrap">
      {/* photo side */}
      <div className="auth-visual">
        <div className="auth-visual-overlay">
          <div className="auth-visual-quote">
            "The best time to fight food waste<br />was yesterday. The next best time is now."
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="auth-form-side">
        <Link to="/" className="resq-brand mb-4 d-block" style={{fontSize:'1.4rem'}}>Res<em>Q</em></Link>

        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.9rem',color:'var(--forest)',marginBottom:'.4rem'}}>
          Welcome back
        </h2>
        <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Sign in to your ResQ account</p>

        {error && (
          <div style={{background:'#fee2e2',color:'#991b1b',border:'1px solid #fca5a5',borderRadius:'var(--r-sm)',padding:'.85rem 1rem',marginBottom:'1.25rem',fontSize:'.9rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'1rem'}}>
            <label className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" value={form.email}
              onChange={set} required placeholder="you@example.com" />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={form.password}
              onChange={set} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-forest w-100 justify-content-center py-2" disabled={busy}
            style={{borderRadius:'var(--r-sm)',fontSize:'1rem'}}>
            {busy ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</> : 'Sign In'}
          </button>
        </form>

        {/* demo account quick access */}
        <div style={{marginTop:'2rem',paddingTop:'1.5rem',borderTop:'1px solid var(--border)'}}>
          <p style={{fontSize:'.82rem',color:'var(--muted)',marginBottom:'.6rem',textAlign:'center'}}>
            Try a demo account
          </p>
          <div className="d-flex gap-2 flex-wrap justify-content-center">
            {Object.keys(DEMO_EMAILS).map(r => (
              <button key={r} onClick={() => fillDemo(r)}
                style={{padding:'.3rem .85rem',borderRadius:'50px',border:'1.5px solid var(--border)',background:'var(--cream)',fontSize:'.8rem',fontWeight:600,cursor:'pointer',color:'var(--forest)',transition:'all .2s'}}
                onMouseOver={e => e.currentTarget.style.borderColor='var(--leaf)'}
                onMouseOut={e  => e.currentTarget.style.borderColor='var(--border)'}>
                {r}
              </button>
            ))}
          </div>
          <p style={{textAlign:'center',fontSize:'.8rem',color:'var(--muted)',marginTop:'.5rem'}}>
            Password: <code>password123</code>
          </p>
        </div>

        <p style={{textAlign:'center',fontSize:'.9rem',marginTop:'1.5rem',color:'var(--muted)'}}>
          New to ResQ? <Link to="/register" style={{color:'var(--forest)',fontWeight:600}}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
