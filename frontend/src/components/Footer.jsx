import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="brand mb-2">Res<em>Q</em></div>
            <p style={{lineHeight:1.7}}>
              A food rescue marketplace connecting surplus sellers with buyers
              and food banks across Canada.
            </p>
          </div>
          <div className="col-6 col-md-2 offset-md-2">
            <div style={{color:'#fff',fontWeight:600,marginBottom:'.75rem',fontSize:'.88rem'}}>Browse</div>
            <div className="d-flex flex-column gap-2">
              <Link to="/listings">All Listings</Link>
              <Link to="/listings?cat=Fruits">Fruits</Link>
              <Link to="/listings?cat=Bakery">Bakery</Link>
              <Link to="/listings?cat=Vegetables">Vegetables</Link>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div style={{color:'#fff',fontWeight:600,marginBottom:'.75rem',fontSize:'.88rem'}}>Account</div>
            <div className="d-flex flex-column gap-2">
              <Link to="/login">Sign In</Link>
              <Link to="/register">Join Free</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>
          <div className="col-md-2">
            <div style={{color:'#fff',fontWeight:600,marginBottom:'.75rem',fontSize:'.88rem'}}>Impact</div>
            <div style={{fontSize:.85+'rem',lineHeight:1.7}}>
              <div>🌍 500kg+ rescued</div>
              <div>💰 60% avg savings</div>
              <div>❤️ 20+ food banks</div>
            </div>
          </div>
        </div>

        <hr />

        <div className="d-flex justify-content-between flex-wrap gap-2" style={{fontSize:'.82rem'}}>
          <span>© 2026 ResQ — Rescue Food, Reduce Waste</span>
          <span>Built with React + PHP + MySQL · CS Capstone Project</span>
        </div>
      </div>
    </footer>
  )
}
