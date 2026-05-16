import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

// role → icon mapping for the user menu
const ROLE_ICON = { admin:'🛡️', seller:'🏪', buyer:'🛍️', foodbank:'❤️' }

export default function Navbar() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()
  const { pathname }      = useLocation()
  const [scrolled, setScrolled] = useState(false)

  // add shadow once user scrolls past the hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path) => pathname === path ? 'nav-pill active-link' : 'nav-pill'

  return (
    <nav className={`resq-nav ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="container d-flex align-items-center justify-content-between gap-3">

        {/* brand */}
        <Link className="resq-brand" to="/">Res<em>Q</em></Link>

        {/* main links */}
        <div className="d-none d-md-flex align-items-center gap-1">
          <Link className={isActive('/listings')} to="/listings">Browse Food</Link>
          {user && <Link className={isActive('/dashboard')} to="/dashboard">Dashboard</Link>}
          {user?.role === 'seller' && (
            <Link className={isActive('/seller/add')} to="/seller/add">+ Add Listing</Link>
          )}
        </div>

        {/* auth section */}
        <div className="d-flex align-items-center gap-2">
          {user ? (
            <>
              {/* show role badge on wider screens */}
              <span className="d-none d-lg-flex align-items-center gap-1"
                style={{ fontSize:'.85rem', color:'var(--muted)', fontWeight:500 }}>
                {ROLE_ICON[user.role]} {user.name}
              </span>
              <button className="btn-outline-f btn-sm py-1 px-3" style={{fontSize:'.85rem'}} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn-outline-f" style={{padding:'.4rem 1.1rem',fontSize:'.88rem'}} to="/login">Login</Link>
              <Link className="btn-forest"   style={{padding:'.4rem 1.1rem',fontSize:'.88rem'}} to="/register">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
