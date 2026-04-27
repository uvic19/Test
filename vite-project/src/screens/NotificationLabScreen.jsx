import { useState, useRef, useEffect } from 'react'

function useLog() {
  const [logs, setLogs] = useState([])
  const add = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [{ msg, type, time }, ...prev].slice(0, 50))
  }
  return { logs, add, clearLogs: () => setLogs([]) }
}

const scheduledTimers = []

function scheduleNotif(title, body, delayMs, add) {
  if (Notification.permission !== 'granted') {
    add('Permission not granted. Request it first.', 'err')
    return
  }
  add(`Scheduled: "${title}" in ${delayMs / 1000}s`, 'warn')
  const t = setTimeout(() => {
    const n = new Notification(title, {
      body: `${body}\n⏰ Fired at: ${new Date().toLocaleTimeString()}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: title,
      requireInteraction: delayMs >= 60000,
    })
    add(`✓ Fired: "${title}"`, 'ok')
    n.onclick = () => window.focus()
  }, delayMs)
  scheduledTimers.push(t)
}

export default function NotificationLabScreen() {
  const { logs, add, clearLogs } = useLog()
  const [permission, setPermission] = useState(Notification.permission)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') add('✓ Notification permission GRANTED', 'ok')
      else if (result === 'denied') add('✗ Notification permission DENIED', 'err')
      else add('Permission prompt dismissed', 'warn')
    } catch (e) {
      add(`Error: ${e.message}`, 'err')
    }
  }

  const sendInstant = () => {
    if (Notification.permission !== 'granted') { add('No permission!', 'err'); return }
    new Notification('⚡ Instant Test', {
      body: `Fired instantly at ${new Date().toLocaleTimeString()}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
    })
    add('✓ Instant notification sent', 'ok')
  }

  const startPersistentReminder = () => {
    if (Notification.permission !== 'granted') { add('No permission!', 'err'); return }
    if (intervalRef.current) { add('Already running. Cancel first.', 'warn'); return }
    add('⏱ Persistent reminder started (every 5 min)', 'warn')
    let count = 0
    intervalRef.current = setInterval(() => {
      count++
      new Notification(`🔔 Reminder #${count}`, {
        body: `Repeating reminder fired at ${new Date().toLocaleTimeString()}`,
        icon: '/pwa-192x192.png',
      })
      add(`✓ Reminder #${count} fired`, 'ok')
    }, 5 * 60 * 1000)
  }

  const cancelAll = () => {
    scheduledTimers.forEach(t => clearTimeout(t))
    scheduledTimers.length = 0
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    add('✓ All scheduled notifications cancelled', 'ok')
  }

  const permBadge = {
    granted: <span className="perm-badge badge-granted">Granted</span>,
    denied: <span className="perm-badge badge-denied">Denied</span>,
    default: <span className="perm-badge badge-prompt">Not asked</span>,
  }[permission]

  return (
    <div className="screen">
      <div className="screen-content">
        <div className="card" style={{background:'linear-gradient(135deg,#667eea,#764ba2)', border:'none'}}>
          <div style={{color:'white'}}>
            <h2 style={{color:'white', fontSize:18}}>🔔 Notification Lab</h2>
            <p style={{color:'rgba(255,255,255,0.85)', fontSize:13, marginTop:4}}>
              Test all notification scenarios for TWA/PWA. Current permission: {' '}
              <strong style={{color:'white'}}>{permission}</strong>
            </p>
          </div>
        </div>

        {/* Permission */}
        <div className="card">
          <div className="card-title">1. Permission</div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
            <span>Status:</span> {permBadge}
          </div>
          <button id="notif-request-perm" className="btn btn-primary btn-full" onClick={requestPermission}>
            <span className="material-icons">notifications</span>
            Request Permission
          </button>
        </div>

        {/* Instant */}
        <div className="card">
          <div className="card-title">2. Instant</div>
          <button id="notif-instant" className="btn btn-success btn-full" onClick={sendInstant}>
            <span className="material-icons">send</span>
            Send Instant Notification
          </button>
        </div>

        {/* Scheduled */}
        <div className="card">
          <div className="card-title">3. Scheduled</div>
          <div className="lab-grid">
            <div className="lab-btn-row">
              <button id="notif-10s" className="btn btn-outline" onClick={() =>
                scheduleNotif('⏱ 10s Test', 'Scheduled 10 second delay notification', 10_000, add)}>
                <span className="material-icons">schedule</span>
                10 Seconds
              </button>
              <button id="notif-30s" className="btn btn-outline" onClick={() =>
                scheduleNotif('⏱ 30s Test', 'Scheduled 30 second delay notification', 30_000, add)}>
                <span className="material-icons">schedule</span>
                30 Seconds
              </button>
            </div>
            <button id="notif-bg" className="btn btn-warning btn-full" onClick={() =>
              scheduleNotif('📵 Background Test', 'Minimized/screen-off notification test — fired after 1 minute', 60_000, add)}>
              <span className="material-icons">bedtime</span>
              Background Test (1 min — minimize app now)
            </button>
          </div>
        </div>

        {/* Persistent */}
        <div className="card">
          <div className="card-title">4. Persistent Reminder</div>
          <p style={{fontSize:13, color:'var(--on-surface-2)', marginBottom:10}}>
            Fires every 5 minutes — simulates appointment reminders.
          </p>
          <button id="notif-persistent" className="btn btn-filled btn-full" onClick={startPersistentReminder}>
            <span className="material-icons">repeat</span>
            Start Persistent Reminder (5 min interval)
          </button>
        </div>

        {/* Cancel */}
        <div className="card">
          <div className="card-title">5. Cancel All</div>
          <button id="notif-cancel-all" className="btn btn-error btn-full" onClick={cancelAll}>
            <span className="material-icons">cancel</span>
            Cancel All Scheduled
          </button>
        </div>

        {/* Log */}
        <div className="card">
          <div className="card-title" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>Activity Log</span>
            <button className="btn btn-filled" style={{padding:'4px 10px', fontSize:12, minHeight:'auto'}} onClick={clearLogs}>Clear</button>
          </div>
          <div className="notif-log" id="notif-log">
            {logs.length === 0
              ? <div className="log-entry"><span className="log-msg" style={{color:'#888'}}>No activity yet…</span></div>
              : logs.map((l, i) => (
                <div className="log-entry" key={i}>
                  <span className="log-time">{l.time}</span>
                  <span className={`log-msg log-${l.type}`}>{l.msg}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
