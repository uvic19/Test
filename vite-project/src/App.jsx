import { useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import NotificationLabScreen from './screens/NotificationLabScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import DeviceTestScreen from './screens/DeviceTestScreen'
import ProfileScreen from './screens/ProfileScreen'

const TABS = [
  { id: 'dashboard',     icon: 'dashboard',           label: 'Home'    },
  { id: 'notifications', icon: 'notifications',        label: 'Alerts'  },
  { id: 'notif-lab',     icon: 'science',              label: 'Lab'     },
  { id: 'device',        icon: 'devices',              label: 'Device'  },
  { id: 'profile',       icon: 'person',               label: 'Profile' },
]

const SCREEN_TITLES = {
  dashboard:     'PWA Test Lab',
  notifications: 'Notifications',
  'notif-lab':   'Notification Lab',
  device:        'Device Tests',
  profile:       'Profile',
}

export default function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogin = (u) => setUser(u)
  const handleLogout = () => { setUser(null); setActiveTab('dashboard') }

  if (!user) return <LoginScreen onLogin={handleLogin} />

  return (
    <>
      {/* App Bar */}
      <div className="app-bar">
        <span className="app-bar-icon">science</span>
        <h1>{SCREEN_TITLES[activeTab]}</h1>
      </div>

      {/* Screen Content */}
      {activeTab === 'dashboard'     && <DashboardScreen user={user} />}
      {activeTab === 'notifications' && <NotificationsScreen />}
      {activeTab === 'notif-lab'     && <NotificationLabScreen />}
      {activeTab === 'device'        && <DeviceTestScreen />}
      {activeTab === 'profile'       && <ProfileScreen user={user} onLogout={handleLogout} />}

      {/* Bottom Navigation */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`nav-${tab.id}`}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
