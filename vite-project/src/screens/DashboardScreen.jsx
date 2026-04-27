export default function DashboardScreen({ user }) {
  const pwaInstalled = window.matchMedia('(display-mode: standalone)').matches
  const now = new Date()

  const features = [
    { icon: 'notifications', label: 'Push Notifications', status: 'testable' },
    { icon: 'camera_alt', label: 'Camera Access', status: 'testable' },
    { icon: 'mic', label: 'Microphone', status: 'testable' },
    { icon: 'qr_code_scanner', label: 'QR Scanner', status: 'testable' },
    { icon: 'vibration', label: 'Vibration API', status: 'testable' },
    { icon: 'offline_bolt', label: 'Offline Support', status: 'sw' },
  ]

  return (
    <div className="screen">
      <div className="screen-content">
        <div className="welcome-banner">
          <h2>Welcome, {user?.name || 'Tester'}!</h2>
          <p>PWA + TWA test environment ready</p>
          <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
            <span className="chip" style={{background:'rgba(255,255,255,0.2)', color:'white'}}>
              <span className="material-icons" style={{fontSize:14, fontFamily:'Material Icons'}}>
                {pwaInstalled ? 'check_circle' : 'open_in_browser'}
              </span>
              {pwaInstalled ? 'Running Standalone' : 'Running in Browser'}
            </span>
            <span className="chip" style={{background:'rgba(255,255,255,0.2)', color:'white'}}>
              <span className="material-icons" style={{fontSize:14, fontFamily:'Material Icons'}}>schedule</span>
              {now.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{color:'#1a73e8'}}>📱</div>
            <div className="stat-value">{navigator.userAgent.includes('Android') ? 'Android' : 'Desktop'}</div>
            <div className="stat-label">Platform</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{color:'#34a853'}}>⚡</div>
            <div className="stat-value">{navigator.onLine ? 'Online' : 'Offline'}</div>
            <div className="stat-label">Network</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{color:'#fbbc04'}}>🔧</div>
            <div className="stat-value">6</div>
            <div className="stat-label">Tests Ready</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{color:'#ea4335'}}>🔔</div>
            <div className="stat-value" id="notif-permission-dash">
              {Notification.permission === 'granted' ? '✓' : '?'}
            </div>
            <div className="stat-label">Notifications</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Available Test Features</div>
          {features.map((f, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'10px 0',
              borderBottom: i < features.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <span className="material-icons" style={{fontFamily:'Material Icons', color:'var(--primary)', fontSize:22}}>{f.icon}</span>
              <span style={{flex:1, fontSize:14}}>{f.label}</span>
              <span className="perm-badge badge-granted">Ready</span>
            </div>
          ))}
        </div>

        <div className="alert alert-info">
          <strong>TWA/Bubblewrap Note:</strong> Display mode is <strong>{pwaInstalled ? 'standalone' : 'browser'}</strong>. 
          When wrapped with Bubblewrap, this will show as <code>standalone</code>.
        </div>
      </div>
    </div>
  )
}
