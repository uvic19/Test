import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onLogin({ email, name: email.split('@')[0] || 'Test User' })
  }

  return (
    <div className="login-screen">
      <div className="login-logo">
        <span className="material-icons">science</span>
      </div>
      <h1 className="login-title">PWA Test Lab</h1>
      <p className="login-subtitle">TWA + Bubblewrap Compatibility Suite</p>

      <div className="login-card">
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <div className="alert alert-error" style={{marginBottom: 12}}>{error}</div>}
          <button
            id="login-btn"
            className="btn btn-primary btn-full"
            type="submit"
            disabled={loading}
          >
            {loading
              ? <span>Signing in…</span>
              : <><span className="material-icons">login</span> Sign In</>
            }
          </button>
        </form>
        <div className="divider" style={{margin: '16px 0 10px'}} />
        <p style={{textAlign:'center', fontSize:12, color:'var(--on-surface-2)'}}>
          Use any email + password to sign in
        </p>
      </div>
    </div>
  )
}
