export default function ProfileScreen({ user, onLogout }) {
  const pwaInstalled = window.matchMedia('(display-mode: standalone)').matches

  const items = [
    { icon: 'person', label: 'Account', sub: user?.email || 'test@example.com' },
    { icon: 'security', label: 'Permissions', sub: 'Manage app permissions' },
    { icon: 'storage', label: 'Storage', sub: 'Cache & local data' },
    { icon: 'info', label: 'App Version', sub: 'v1.0.0 — PWA Test Lab' },
    { icon: 'open_in_new', label: 'Display Mode', sub: pwaInstalled ? 'Standalone (TWA ready)' : 'Browser tab' },
  ]

  const ua = navigator.userAgent
  const platform = ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Desktop'

  return (
    <div className="screen">
      <div className="screen-content">
        <div className="profile-hero">
          <div className="avatar">person</div>
          <div className="profile-name">{user?.name || 'Test User'}</div>
          <div className="profile-email">{user?.email || 'test@example.com'}</div>
          <div style={{marginTop:10, display:'flex', gap:8}}>
            <span className="chip" style={{background:'rgba(255,255,255,0.2)', color:'white', fontSize:11}}>
              {platform}
            </span>
            <span className="chip" style={{background:'rgba(255,255,255,0.2)', color:'white', fontSize:11}}>
              PWA {pwaInstalled ? '✓' : '(browser)'}
            </span>
          </div>
        </div>

        <div className="card">
          {items.map((item, i) => (
            <div className="profile-list-item" key={i}>
              <span className="material-icons">{item.icon}</span>
              <div className="profile-list-item-text">
                <span>{item.label}</span>
                <small>{item.sub}</small>
              </div>
              <span className="chevron material-icons">chevron_right</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Device Info</div>
          {[
            { label: 'User Agent', val: ua.slice(0, 60) + '…' },
            { label: 'Screen', val: `${screen.width}×${screen.height}` },
            { label: 'Device Pixel Ratio', val: window.devicePixelRatio },
            { label: 'Online', val: navigator.onLine ? 'Yes' : 'No' },
            { label: 'Language', val: navigator.language },
          ].map((row, i) => (
            <div key={i} style={{
              display:'flex', justifyContent:'space-between', alignItems:'flex-start',
              padding:'8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', gap:12
            }}>
              <span style={{fontSize:12, color:'var(--on-surface-2)', flexShrink:0}}>{row.label}</span>
              <span style={{fontSize:12, fontWeight:500, textAlign:'right', wordBreak:'break-word'}}>{String(row.val)}</span>
            </div>
          ))}
        </div>

        <button id="logout-btn" className="btn btn-error btn-full" onClick={onLogout} style={{marginBottom:16}}>
          <span className="material-icons">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  )
}
