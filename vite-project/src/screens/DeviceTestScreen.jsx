import { useState, useRef, useEffect } from 'react'
import QrScanner from 'qr-scanner'

function useLog() {
  const [logs, setLogs] = useState([])
  const add = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [{ msg, type, time }, ...prev].slice(0, 30))
  }
  return { logs, add, clearLogs: () => setLogs([]) }
}

function PermissionRow({ icon, name, status }) {
  const badge = {
    granted: <span className="perm-badge badge-granted">Granted</span>,
    denied:  <span className="perm-badge badge-denied">Denied</span>,
    prompt:  <span className="perm-badge badge-prompt">Prompt</span>,
    unknown: <span className="perm-badge badge-unknown">Unknown</span>,
  }[status] || <span className="perm-badge badge-unknown">—</span>

  return (
    <div className="perm-item">
      <span className="perm-icon material-icons">{icon}</span>
      <span className="perm-name">{name}</span>
      {badge}
    </div>
  )
}

export default function DeviceTestScreen() {
  const { logs, add, clearLogs } = useLog()

  // permissions state
  const [perms, setPerms] = useState({
    notifications: Notification.permission,
    camera: 'unknown',
    microphone: 'unknown',
    vibration: 'vibrate' in navigator ? 'granted' : 'denied',
  })

  // camera
  const cameraVideoRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)

  // audio
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  // QR scanner
  const qrVideoRef = useRef(null)
  const qrScannerRef = useRef(null)
  const [qrActive, setQrActive] = useState(false)
  const [qrResult, setQrResult] = useState('')

  // Query permissions on mount
  useEffect(() => {
    const query = async () => {
      try {
        const cam = await navigator.permissions.query({ name: 'camera' })
        const mic = await navigator.permissions.query({ name: 'microphone' })
        setPerms(p => ({ ...p, camera: cam.state, microphone: mic.state }))
      } catch (_) {}
    }
    query()
    return () => {
      stopCamera()
      stopQr()
    }
  }, [])

  // ---- CAMERA ----
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      cameraStreamRef.current = stream
      if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream
      setCameraActive(true)
      setPerms(p => ({ ...p, camera: 'granted' }))
      add('✓ Camera stream started', 'ok')
    } catch (e) {
      setPerms(p => ({ ...p, camera: 'denied' }))
      add(`✗ Camera: ${e.message}`, 'err')
    }
  }

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop())
      cameraStreamRef.current = null
    }
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null
    setCameraActive(false)
    add('Camera stopped', 'info')
  }

  // ---- MICROPHONE ----
  const startRecording = async () => {
    try {
      setAudioUrl(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      setPerms(p => ({ ...p, microphone: 'granted' }))
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(t => t.stop())
        setRecording(false)
        add('✓ Recording complete — press play!', 'ok')
      }
      mr.start()
      setRecording(true)
      add('🎙 Recording 5 seconds…', 'warn')
      setTimeout(() => { if (mr.state === 'recording') mr.stop() }, 5000)
    } catch (e) {
      setPerms(p => ({ ...p, microphone: 'denied' }))
      add(`✗ Microphone: ${e.message}`, 'err')
    }
  }

  // ---- QR SCANNER ----
  const startQr = async () => {
    try {
      setQrResult('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      stream.getTracks().forEach(t => t.stop()) // just check permission

      const scanner = new QrScanner(
        qrVideoRef.current,
        result => {
          setQrResult(result.data)
          add(`✓ QR Decoded: ${result.data}`, 'ok')
          stopQr()
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      )
      qrScannerRef.current = scanner
      await scanner.start()
      setQrActive(true)
      setPerms(p => ({ ...p, camera: 'granted' }))
      add('📷 QR Scanner started — point at a QR code', 'info')
    } catch (e) {
      add(`✗ QR Scanner: ${e.message}`, 'err')
    }
  }

  const stopQr = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setQrActive(false)
  }

  // ---- VIBRATION ----
  const testVibrate = () => {
    if (!('vibrate' in navigator)) {
      add('✗ Vibration not supported on this device', 'err')
      return
    }
    navigator.vibrate([200, 100, 200, 100, 400])
    add('✓ Vibration pattern sent (buzz-buzz-long)', 'ok')
  }

  return (
    <div className="screen">
      <div className="screen-content">

        {/* Permission Status */}
        <div className="section-title">
          <span className="material-icons">security</span>
          Permission Status
        </div>
        <div className="card">
          <div className="perm-grid">
            <PermissionRow icon="notifications" name="Notifications" status={perms.notifications} />
            <PermissionRow icon="camera_alt" name="Camera" status={perms.camera} />
            <PermissionRow icon="mic" name="Microphone" status={perms.microphone} />
            <PermissionRow icon="vibration" name="Vibration" status={perms.vibration} />
          </div>
        </div>

        {/* Camera Test */}
        <div className="section-title">
          <span className="material-icons">camera_alt</span>
          Camera Test
        </div>
        <div className="card">
          <video
            ref={cameraVideoRef}
            className="camera-preview"
            autoPlay
            playsInline
            muted
            style={{ display: cameraActive ? 'block' : 'none' }}
          />
          {!cameraActive && (
            <div style={{
              background:'#000', borderRadius:'var(--radius)', aspectRatio:'4/3',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#555', flexDirection:'column', gap:8, marginBottom:8
            }}>
              <span className="material-icons" style={{fontFamily:'Material Icons', fontSize:40, color:'#555'}}>videocam_off</span>
              <span style={{fontSize:12}}>Camera off</span>
            </div>
          )}
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button id="camera-start" className="btn btn-primary" style={{flex:1}} onClick={startCamera} disabled={cameraActive}>
              <span className="material-icons">videocam</span> Open Camera
            </button>
            <button id="camera-stop" className="btn btn-filled" style={{flex:1}} onClick={stopCamera} disabled={!cameraActive}>
              <span className="material-icons">videocam_off</span> Stop
            </button>
          </div>
        </div>

        {/* Microphone Test */}
        <div className="section-title">
          <span className="material-icons">mic</span>
          Microphone Test
        </div>
        <div className="card">
          <p style={{fontSize:13, color:'var(--on-surface-2)', marginBottom:10}}>
            Records 5 seconds of audio then plays it back.
          </p>
          <button
            id="mic-record"
            className={`btn btn-full ${recording ? 'btn-error' : 'btn-primary'}`}
            onClick={startRecording}
            disabled={recording}
          >
            <span className="material-icons">{recording ? 'fiber_manual_record' : 'mic'}</span>
            {recording ? 'Recording… (5s)' : 'Record 5 Seconds'}
          </button>
          {audioUrl && (
            <div style={{marginTop:12}}>
              <p style={{fontSize:12, color:'var(--on-surface-2)', marginBottom:6}}>▶ Playback:</p>
              <audio src={audioUrl} controls className="audio-playback" />
            </div>
          )}
        </div>

        {/* QR Scanner */}
        <div className="section-title">
          <span className="material-icons">qr_code_scanner</span>
          QR Code Scanner
        </div>
        <div className="card">
          {qrActive && (
            <div className="qr-container">
              <video ref={qrVideoRef} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              <div className="qr-overlay">
                <div className="qr-frame">
                  <div className="qr-corner tl" />
                  <div className="qr-corner tr" />
                  <div className="qr-corner bl" />
                  <div className="qr-corner br" />
                </div>
              </div>
            </div>
          )}
          {!qrActive && (
            <div style={{
              background:'#000', borderRadius:'var(--radius)', aspectRatio:'1',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#555', flexDirection:'column', gap:8, marginBottom:8
            }}>
              <span className="material-icons" style={{fontFamily:'Material Icons', fontSize:48, color:'#555'}}>qr_code_2</span>
              <span style={{fontSize:12}}>Scanner off</span>
            </div>
          )}
          {qrResult && (
            <div className="qr-result">
              <strong>Result:</strong> {qrResult}
            </div>
          )}
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button id="qr-start" className="btn btn-primary" style={{flex:1}} onClick={startQr} disabled={qrActive}>
              <span className="material-icons">qr_code_scanner</span> Scan QR
            </button>
            <button id="qr-stop" className="btn btn-filled" style={{flex:1}} onClick={stopQr} disabled={!qrActive}>
              <span className="material-icons">stop</span> Stop
            </button>
          </div>
        </div>

        {/* Vibration */}
        <div className="section-title">
          <span className="material-icons">vibration</span>
          Vibration Test
        </div>
        <div className="card">
          <p style={{fontSize:13, color:'var(--on-surface-2)', marginBottom:10}}>
            Sends a vibration pattern: short-short-long. Works on Android.
          </p>
          <button id="vibrate-test" className="btn btn-primary btn-full" onClick={testVibrate}>
            <span className="material-icons">vibration</span>
            Test Vibration
          </button>
        </div>

        {/* Log */}
        <div className="section-title">
          <span className="material-icons">terminal</span>
          Test Log
        </div>
        <div className="card" style={{padding:0}}>
          <div style={{padding:'8px 12px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:12, fontWeight:500, color:'var(--on-surface-2)'}}>Output</span>
            <button className="btn btn-filled" style={{padding:'3px 10px', fontSize:12, minHeight:'auto'}} onClick={clearLogs}>Clear</button>
          </div>
          <div className="notif-log" id="device-log" style={{borderRadius:'0 0 12px 12px'}}>
            {logs.length === 0
              ? <div className="log-entry"><span className="log-msg" style={{color:'#888'}}>Run a test above…</span></div>
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
