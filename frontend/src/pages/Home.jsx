import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

// category → Unsplash photo URL
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

// first four categories shown as visual cards
const FEATURED_CATS = [
  { name:'Fruits',     emoji:'🍎' },
  { name:'Bakery',     emoji:'🍞' },
  { name:'Vegetables', emoji:'🥦' },
  { name:'Dairy',      emoji:'🥛' },
  { name:'Pantry',     emoji:'🥫' },
]

// community voices shown at the bottom
const TESTIMONIALS = [
  { quote: "I save about $40 a week buying from ResQ. The food quality is genuinely great -- you would never know it was near-expiry.", author: 'Maya R., Buyer', stars: 5 },
  { quote: "We have reduced our end-of-day waste by 70% since listing on ResQ. It brings in extra revenue we would otherwise throw away.", author: 'Carlo M., Bakery Owner', stars: 5 },
  { quote: "As a small food bank, every free donation through ResQ feeds real families. This platform is doing meaningful work.", author: 'Sandra K., Food Bank Coord.', stars: 5 },
]

function StarRow({ count }) {
  return <div className="testi-stars">{'★'.repeat(count)}</div>
}

export default function Home() {
  const [featured, setFeatured] = useState([])

  // pull a small preview for the homepage — no need to load everything
  useEffect(() => {
    fetch('/api.php?route=listings', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setFeatured((d.listings || []).slice(0, 6)))
      .catch(() => {}) // silent fail — homepage still works without listings
  }, [])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />

        <div className="container position-relative">
          <div className="row align-items-center gy-5">

            {/* left: copy */}
            <div className="col-lg-6 fu">
              <div className="hero-tag">
                <span style={{width:7,height:7,borderRadius:'50%',background:'var(--mint)',display:'inline-block'}} />
                Fighting Food Waste Since 2026
              </div>
              <h1>
                Rescue <em>Great Food.</em><br />
                Feed Your Community.
              </h1>
              <p className="hero-lead">
                ResQ connects surplus food from local sellers directly to buyers and
                food banks — fresher ingredients, lower prices, less waste.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link className="btn-cream" to="/listings">Browse Food Now</Link>
                <Link className="btn-outline-f" style={{color:'rgba(255,255,255,.8)',borderColor:'rgba(255,255,255,.35)'}} to="/register">
                  Join Free
                </Link>
              </div>
            </div>

            {/* right: photo collage */}
            <div className="col-lg-6 d-none d-lg-block fu fu-2">
              <div className="hero-photos">
                <div className="hero-photo">
                  <img
                    src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80"
                    alt="Fresh colourful fruits"
                  />
                  <div className="hero-pill">🍎 Fresh Fruits · $3.00</div>
                </div>
                <div className="hero-photo">
                  <img
                    src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80"
                    alt="Artisan bread loaves"
                  />
                  <div className="hero-pill">🍞 Artisan Bread · $2.50</div>
                </div>
                <div className="hero-photo">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
                    alt="Fresh vegetables"
                  />
                  <div className="hero-pill">🥦 Veggies · $5.00</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {[
              ['500+','kg of food rescued'],
              ['60%', 'average savings'],
              ['50+', 'local sellers'],
              ['20+', 'food banks served'],
            ].map(([n, l]) => (
              <div key={l} className="col-6 col-md-3 stat-item">
                <span className="n">{n}</span>
                <span className="l">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by category ────────────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <p className="eyebrow mb-1">What's available</p>
              <h2 style={{color:'var(--forest)',fontSize:'2rem'}}>Shop by Category</h2>
            </div>
            <Link className="btn-outline-f" style={{padding:'.45rem 1.2rem',fontSize:'.88rem'}} to="/listings">
              View all
            </Link>
          </div>

          <div className="d-flex cat-strip overflow-auto pb-2">
            {FEATURED_CATS.map(c => (
              <Link key={c.name} className="cat-card text-decoration-none" to={`/listings?cat=${c.name}`}
                style={{minWidth:140}}>
                <img src={CAT_PHOTOS[c.name]} alt={c.name} loading="lazy" />
                <div className="cat-card-ov" />
                <div className="cat-card-label">{c.emoji} {c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ─────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-4" style={{background:'var(--cream-dark)'}}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <p className="eyebrow mb-1">Available now</p>
                <h2 style={{color:'var(--forest)',fontSize:'2rem'}}>Fresh Listings</h2>
              </div>
              <Link className="btn-forest" style={{padding:'.5rem 1.3rem',fontSize:'.88rem'}} to="/listings">
                All listings
              </Link>
            </div>

            <div className="row g-4">
              {featured.map((l, i) => {
                const img    = CAT_PHOTOS[l.category] || CAT_PHOTOS.default
                const isDon  = l.is_donation == 1
                const saving = l.original_price > 0
                  ? Math.round((1 - l.discounted_price / l.original_price) * 100)
                  : 0

                return (
                  <div key={l.id} className={`col-sm-6 col-lg-4 fu fu-${(i % 3) + 1}`}>
                    <div className="l-card h-100">
                      <div className="l-card-img">
                        <img src={img} alt={l.title} loading="lazy" />
                      </div>
                      <div className="l-card-body">
                        <div className="d-flex gap-2 mb-2 flex-wrap">
                          <span className={isDon ? 'tag tag-purple' : 'tag tag-green'}>
                            {isDon ? '🎁 Free Donation' : l.category}
                          </span>
                          {saving > 0 && <span className="tag tag-amber">-{saving}% off</span>}
                        </div>
                        <h6 style={{fontFamily:'Playfair Display,serif',fontWeight:700,marginBottom:'.4rem'}}>{l.title}</h6>
                        <p style={{fontSize:'.88rem',color:'var(--muted)',flexGrow:1}}>
                          {l.description?.slice(0, 80)}{l.description?.length > 80 ? '…' : ''}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3"
                          style={{borderTop:'1px solid var(--border)'}}>
                          {isDon
                            ? <span className="price-free">Free 🎁</span>
                            : <div className="d-flex align-items-baseline gap-2">
                                <span className="price-now">${parseFloat(l.discounted_price).toFixed(2)}</span>
                                {l.original_price > 0 && <span className="price-was">${parseFloat(l.original_price).toFixed(2)}</span>}
                              </div>
                          }
                          <Link className="btn-forest" style={{padding:'.4rem 1rem',fontSize:'.84rem'}} to={`/listings/${l.id}`}>
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <p className="eyebrow mb-2">Simple by design</p>
            <h2 style={{color:'var(--forest)',fontSize:'2.2rem'}}>How ResQ Works</h2>
          </div>
          <div className="row g-4">
            {[
              { icon:'🏪', bg:'#dcfce7', step:'01', title:'Sellers List Surplus',  desc:'Restaurants and grocery stores post near-expiry food at reduced prices — turning waste into income.' },
              { icon:'🔍', bg:'#fef3c7', step:'02', title:'Buyers Discover Deals', desc:'Browse listings by category, order with one click, and pick up fresh food at a fraction of retail.' },
              { icon:'❤️', bg:'#ede9fe', step:'03', title:'Food Banks Claim Free', desc:'Registered food banks see donation listings and claim them for free, feeding families in need.' },
            ].map(s => (
              <div key={s.step} className="col-md-4">
                <div className="step-card">
                  <div className="step-icon" style={{background:s.bg}}>{s.icon}</div>
                  <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'.12em',color:'var(--muted)',marginBottom:'.5rem'}}>STEP {s.step}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Environmental impact ──────────────────────────────────── */}
      <section className="py-5" style={{background:'var(--forest)'}}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <p className="eyebrow" style={{color:'var(--mint)'}}>Why it matters</p>
              <h2 style={{color:'#fff',fontSize:'2.2rem',marginBottom:'1.25rem'}}>
                Every meal rescued is a small act of <em style={{color:'var(--mint)'}}>rebellion</em>.
              </h2>
              <p style={{color:'rgba(255,255,255,.65)'}}>
                One-third of all food produced globally is wasted. In Canada alone, that's
                $49 billion worth of food thrown away each year. ResQ makes it easy to be
                part of the solution — no lifestyle change required.
              </p>
              <Link className="btn-cream" style={{marginTop:'1.5rem'}} to="/register">Join the movement</Link>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {[
                  ['🌍','1/3','of all food produced globally is wasted'],
                  ['💸','$49B','worth of food wasted in Canada per year'],
                  ['🌱','8%',  'of greenhouse gases come from food waste'],
                  ['❤️','1 in 8','Canadians face food insecurity'],
                ].map(([e, n, l]) => (
                  <div key={n} className="col-sm-6">
                    <div style={{background:'rgba(255,255,255,.07)',borderRadius:'var(--r)',padding:'1.5rem',border:'1px solid rgba(255,255,255,.08)'}}>
                      <div style={{fontSize:'1.8rem',marginBottom:'.5rem'}}>{e}</div>
                      <div style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'var(--mint)',fontWeight:900,lineHeight:1}}>{n}</div>
                      <div style={{fontSize:'.85rem',color:'rgba(255,255,255,.55)',marginTop:'.4rem'}}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-5" style={{background:'var(--cream-dark)'}}>
        <div className="container">
          <div className="text-center mb-5">
            <p className="eyebrow mb-2">Community voices</p>
            <h2 style={{color:'var(--forest)',fontSize:'2rem'}}>Real People, Real Impact</h2>
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="col-md-4">
                <div className="testi-card">
                  <StarRow count={t.stars} />
                  <blockquote>"{t.quote}"</blockquote>
                  <div style={{fontSize:'.85rem',color:'var(--muted)',fontWeight:600}}>— {t.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────── */}
      <section className="py-5 text-center">
        <div className="container" style={{maxWidth:600}}>
          <p className="eyebrow mb-2">Ready to start?</p>
          <h2 style={{color:'var(--forest)',fontSize:'2.2rem',marginBottom:'1rem'}}>
            Join hundreds of Canadians rescuing food every day.
          </h2>
          <p style={{color:'var(--muted)',marginBottom:'2rem'}}>Free to join. No subscription. Just good food at fair prices.</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link className="btn-forest" to="/register">Create Free Account</Link>
            <Link className="btn-outline-f" to="/listings">Browse Listings</Link>
          </div>
        </div>
      </section>
    </>
  )
}
