import { useState } from 'react'
import { useApp } from '../../App'

/* SVG Icons */
const I = {
  back: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4L6 10l7 6"/></svg>,
  chev: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>,
  check: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7l3 3 5-6"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  font: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="M5 9l2.5-5L10 9M6 8h3"/></svg>,
  board: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 6h6M5 9h4"/></svg>,
  pkg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l7 4v6l-7 4-7-4V5l7-4z"/><path d="M1 5l7 4 7-4M8 9v6"/></svg>,
  img: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="12" rx="2"/><circle cx="5" cy="6" r="1.5"/><path d="M1 12l4-4 3 3 3-4 4 5"/></svg>,
  play: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M6 5l5 3-5 3z" fill="currentColor"/></svg>,
  trash: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>,
  phone: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="1" width="8" height="14" rx="2"/><path d="M7 13h2"/></svg>,
  lock: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="10" height="8" rx="2"/><path d="M5 7V5a3 3 0 116 0v2"/></svg>,
  device: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="9" rx="2"/><path d="M4 15h8"/></svg>,
  warn: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L1 14h14L8 1z"/><path d="M8 6v4M8 12v0.5"/></svg>,
  eye: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>,
  alipay: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="11" rx="2"/><path d="M1 6h14"/></svg>,
  online: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>,
  shield: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L2 4v4c0 4 3 7 6 8 3-1 6-4 6-8V4L8 1z"/></svg>,
  filter: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 2h14M3 6h10M5 10h6M6 14h4"/></svg>,
  star: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l2 4.5h4.5L12 9l1.5 4.5L8 11l-4.5 2.5L5 9 2.5 5.5h4.5z"/></svg>,
  task: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8l2 2 4-4"/></svg>,
  brief: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="12" height="10" rx="2"/><path d="M6 4V2h4v2"/></svg>,
  ban: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M4 4l8 8"/></svg>,
  spark: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v6M5 4l6 0M3 8l10 0M5 12l6 0M8 9v6"/></svg>,
  bell: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1a5 5 0 00-5 5v3l-1 2h12l-1-2V6a5 5 0 00-5-5zM6 13a2 2 0 004 0"/></svg>,
  msg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 10c0 .5-.5 1-1 1H5l-3 3V3c0-.5.5-1 1-1h10c.5 0 1 .5 1 1v7z"/></svg>,
  gift: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="12" height="8" rx="1"/><path d="M8 2c-1-1-3-1-3 1s2 3 3 3c1 0 3-1 3-3s-2-2-3-1"/><path d="M2 9h12"/></svg>,
  clock: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>,
  pin: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1C5.5 1 3.5 3 3.5 5.5c0 3.5 4.5 9.5 4.5 9.5s4.5-6 4.5-9.5C12.5 3 10.5 1 8 1z"/><circle cx="8" cy="5.5" r="1.5"/></svg>,
  sun: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/></svg>,
  palm: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 15V8M8 8c0-3 2-5 5-5M8 8c0-4-2-6-5-6M8 8c0-2 1-4 3-5M8 8c0-3-1-5-3-6M4 15h8"/></svg>,
  announce: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6v4h3l4 3V3L6 6H3z"/><path d="M12 5c1 1 1 5 0 6"/></svg>,
  mobile: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="1" width="8" height="14" rx="2"/><path d="M7 13h2"/></svg>,
  upload: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 11V3M5 6l3-3 3 3M2 11v3h12v-3"/></svg>,
  vibrate: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="1" width="6" height="14" rx="1.5"/><path d="M2 5v6M14 5v6M0 7v2M16 7v2"/></svg>,
  sound: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h2l4-4v12l-4-4H2V6z"/><path d="M11 5c1 1 1 5 0 6M13 3c2 2 2 8 0 10"/></svg>,
  globe: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c-2 2-2 10 0 12M8 2c2 2 2 10 0 12"/></svg>,
  mail: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M1 3l7 5 7-5"/></svg>,
  headset: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9V7a6 6 0 1112 0v2"/><rect x="1" y="9" width="3" height="5" rx="1"/><rect x="12" y="9" width="3" height="5" rx="1"/></svg>,
  wechat: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.5 3C2.5 3 0 5 0 7.5c0 1.5.8 2.7 2 3.5L1.5 13l2-1c.6.2 1.3.3 2 .3"/><path d="M10.5 7c-3 0-5.5 2-5.5 4.5s2.5 4.5 5.5 4.5c.7 0 1.3-.1 2-.3l2 1-.5-2c1.2-.8 2-2 2-3.5C16 9 13.5 7 10.5 7z"/></svg>,
  card: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M1 7h14"/></svg>,
  plus: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4v12M4 10h12"/></svg>,
  doc: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1h7l4 4v10H3V1z"/><path d="M10 1v4h4M6 8h4M6 11h6"/></svg>,
  user: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3 3-5 6-5s6 2 6 5"/></svg>,
}

export { I }

/* ─── Shared Components ─── */
export function SettingNav({ title, onBack }) {
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const navBg = isDark ? '#141820' : '#FFFFFF'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const iconBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
  const borderColor = isDark ? '#2A3040' : '#E5E7EB'
  return (
    <div style={{ background: navBg, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, borderBottom: `1px solid ${borderColor}` }}>
      <div onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: textColor }}>{I.back}</div>
      <span style={{ flex: 1, fontWeight: 700, fontSize: 16, color: textColor, textAlign: 'center', marginRight: 34 }}>{title}</span>
    </div>
  )
}

export function SectionLabel({ children }) {
  const { theme } = useApp()
  return <div style={{ padding: '16px 24px 8px', fontSize: 12, fontWeight: 600, color: theme === 'dark' ? '#8090A8' : '#999', letterSpacing: 0.5 }}>{children}</div>
}

function useCard() {
  const { theme } = useApp()
  const isDark = theme === 'dark'
  return {
    cardBg: isDark ? '#1E2536' : '#FFFFFF',
    border: isDark ? '#2A3040' : '#E8E8EC',
    pageBg: isDark ? '#181E2C' : '#F2F2F7',
    inputBg: isDark ? '#252E42' : '#F5F5F7',
    textColor: isDark ? '#F0F2F5' : '#1A1A1A',
    subColor: isDark ? '#8090A8' : '#999',
    isDark,
  }
}

export function SettingCard({ children }) {
  const { cardBg, border } = useCard()
  return <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, margin: '0 20px 14px', overflow: 'hidden' }}>{children}</div>
}

export function SettingRow({ icon, label, status, statusColor, danger, onClick, last }) {
  const { border, textColor, subColor } = useCard()
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
      borderBottom: last ? 'none' : `1px solid ${border}`,
    }}>
      <span style={{ fontSize: 18, width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#EF4444' : subColor }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? '#EF4444' : textColor }}>{label}</span>
      {status && <span style={{ fontSize: 12, color: statusColor || subColor }}>{status}</span>}
      <span style={{ color: subColor }}>{I.chev}</span>
    </div>
  )
}

export function SettingToggle({ icon, label, desc, value, onChange, disabled }) {
  const { border, textColor, subColor, isDark } = useCard()
  const activeColor = isDark ? '#4A90D9' : '#1E2A3A'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      borderBottom: `1px solid ${border}`,
    }}>
      <span style={{ fontSize: 18, width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: disabled ? subColor : textColor }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: subColor, marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={() => !disabled && onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: disabled ? 'default' : 'pointer',
          background: value ? activeColor : (isDark ? '#3A4455' : '#D1D5DB'),
          position: 'relative', transition: 'background .2s', opacity: disabled ? 0.5 : 1,
        }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2,
          left: value ? 22 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>
    </div>
  )
}

export function SettingChoice({ icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const { border, textColor, subColor, inputBg, isDark } = useCard()
  const activeColor = isDark ? '#D4A853' : '#1E2A3A'
  return (
    <div>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
        borderBottom: `1px solid ${border}`,
      }}>
        <span style={{ fontSize: 18, width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: textColor }}>{label}</span>
        <span style={{ fontSize: 12, color: activeColor, fontWeight: 600 }}>{value}</span>
        <span style={{ color: subColor, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>{I.chev}</span>
      </div>
      {open && (
        <div style={{ padding: '8px 16px 12px', background: inputBg }}>
          {options.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              style={{
                padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
                background: value === opt ? (isDark ? 'rgba(212,168,83,0.1)' : 'rgba(30,42,58,0.06)') : 'transparent',
                color: value === opt ? activeColor : subColor,
                fontWeight: value === opt ? 600 : 400,
              }}>
              {value === opt && <span style={{ color: activeColor }}>{I.check}</span>}
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SettingSlider({ icon, label, options, value, onChange }) {
  const { border, textColor, subColor, inputBg, isDark } = useCard()
  const idx = options.indexOf(value)
  const activeColor = isDark ? '#4A90D9' : '#1E2A3A'
  return (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 18, width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: textColor }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {options.map((opt, i) => (
          <div key={opt} onClick={() => onChange(opt)}
            style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: i === idx ? 600 : 400,
              background: i === idx ? activeColor : inputBg,
              color: i === idx ? 'white' : subColor, transition: 'all .2s',
            }}>
            {opt}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConfirmModal({ title, desc, onConfirm, onCancel, confirmText, danger }) {
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const cardBg = isDark ? '#1E2536' : '#FFFFFF'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const btnBg = isDark ? '#252E42' : '#F0F0F5'
  return (
    <div onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: cardBg, borderRadius: 20, padding: 24, width: '80%', maxWidth: 320, textAlign: 'center', border: `1px solid ${isDark ? '#2A3040' : '#E8E8EC'}` }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: textColor, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: subColor, marginBottom: 20, lineHeight: 1.6 }}>{desc}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: 12, borderRadius: 12, background: btnBg, border: 'none', fontSize: 14, fontWeight: 600, color: textColor, cursor: 'pointer' }}>取消</button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: 12, borderRadius: 12, background: danger ? '#EF4444' : (isDark ? '#4A90D9' : '#1E2A3A'), border: 'none', fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>{confirmText || '确认'}</button>
        </div>
      </div>
    </div>
  )
}
