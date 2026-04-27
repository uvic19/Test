const MOCK_NOTIFS = [
  {
    id: 1, icon: 'notifications', title: 'Background Test Passed',
    body: 'Notification arrived while app was minimized.', time: '2 min ago', read: false
  },
  {
    id: 2, icon: 'schedule', title: '30s Delay Test',
    body: 'Scheduled notification fired on time.', time: '5 min ago', read: false
  },
  {
    id: 3, icon: 'check_circle', title: 'Permission Granted',
    body: 'Notification permission was successfully granted.', time: '10 min ago', read: true
  },
  {
    id: 4, icon: 'vibration', title: 'Vibration Test',
    body: 'Device vibration pattern executed successfully.', time: '15 min ago', read: true
  },
  {
    id: 5, icon: 'camera_alt', title: 'Camera Access',
    body: 'Camera stream opened without errors.', time: '20 min ago', read: true
  },
]

export default function NotificationsScreen() {
  return (
    <div className="screen">
      <div className="screen-content">
        <div className="alert alert-info" style={{marginBottom:16}}>
          This screen shows a log of test events. Real push notifications appear in your system tray.
        </div>

        <div className="card">
          <div className="card-title">Recent Events</div>
          {MOCK_NOTIFS.map((n, i) => (
            <div className="notif-item" key={n.id}>
              <div className={`notif-dot ${n.read ? 'read' : ''}`} />
              <div style={{flex:1}}>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:4}}>
                  <span className="material-icons" style={{fontFamily:'Material Icons', fontSize:18, color:'var(--primary)'}}>{n.icon}</span>
                  <h3>{n.title}</h3>
                </div>
                <p>{n.body}</p>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Notification Support</div>
          {[
            { label: 'Notification API', check: 'Notification' in window },
            { label: 'Service Worker', check: 'serviceWorker' in navigator },
            { label: 'Push Manager', check: 'PushManager' in window },
            { label: 'Background Sync', check: 'SyncManager' in window },
          ].map((item, i) => (
            <div key={i} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none'
            }}>
              <span style={{fontSize:14}}>{item.label}</span>
              <span className={`perm-badge ${item.check ? 'badge-granted' : 'badge-denied'}`}>
                {item.check ? 'Supported' : 'Not supported'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
