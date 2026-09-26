import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { clearToken } from '../../utils/api'
import api from '../../utils/api'

/* SVG 图标 */
const Icons = {
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  palette: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9-10-9z"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  grad: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  ban: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  card: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  pin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24z"/></svg>,
  ticket: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>,
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  gear: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  msg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  trash: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  chev: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  moon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  scroll: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zM6 17V3a2 2 0 0 1 2-2h12v14H8a2 2 0 0 0-2 2z"/></svg>,
}

/* 设置项组件 */
function SettingItem({ icon, iconBg, label, status, statusColor, danger, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0',
      borderBottom: '1px solid var(--c-border)', cursor: 'pointer',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg || 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#EF4444' : 'var(--c-text2)', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: danger ? '#EF4444' : 'var(--c-text)' }}>{label}</span>
      </div>
      {status && <span style={{ fontSize: 12, color: statusColor || 'var(--c-text3)', fontWeight: 500 }}>{status}</span>}
      <span style={{ color: 'var(--c-text3)', opacity: 0.4 }}>{Icons.chev}</span>
    </div>
  )
}

export default function SettingsPage() {
  const { openSubPage, theme, toggleTheme } = useApp()
  const [showLogout, setShowLogout] = useState(false)
  const [profile, setProfile] = useState(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    api.users.profile().then(res => {
      if (res?.data) setProfile(res.data)
    }).catch(() => {})
  }, [])

  const pageBg = isDark ? '#181E2C' : 'var(--c-bg)'
  const cardBg = isDark ? '#1E2536' : 'var(--c-card)'
  const border = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const btnBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
  const nameColor = isDark ? '#fff' : '#1C1C1E'

  const card = (children) => (
    <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, margin: '0 20px 14px', padding: '0 16px' }}>
      {children}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pageBg }}>
      {/* Nav */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div onClick={() => openSubPage(null)} style={{ width: 38, height: 38, borderRadius: 12, background: btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: nameColor }}>{Icons.back}</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 18, color: nameColor }}>设置</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: 8, paddingBottom: 24 }}>

        {/* 主题模式 */}
        {card(
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>{Icons.palette}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>主题模式</span>
            </div>
            <div style={{ display: 'flex', background: isDark ? '#252E42' : '#F0F0F5', borderRadius: 12, padding: 3, gap: 2 }}>
              <div onClick={() => toggleTheme('dark')} style={{
                padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                background: theme === 'dark' ? (isDark ? '#3A4A60' : '#1E2A3A') : 'transparent',
                color: theme === 'dark' ? '#fff' : 'var(--c-text3)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {Icons.moon} 暗夜
              </div>
              <div onClick={() => toggleTheme('light')} style={{
                padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                background: theme === 'light' ? (isDark ? '#3A4A60' : '#1E2A3A') : 'transparent',
                color: theme === 'light' ? '#fff' : 'var(--c-text3)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {Icons.sun} 白日
              </div>
            </div>
          </div>
        )}

        {/* 账号与安全 */}
        {card(<>
          <SettingItem icon={Icons.lock} iconBg={isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'} label="账号安全" onClick={() => openSubPage('settings-account')} />
          <SettingItem icon={Icons.shield} iconBg={isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)'} label="实名认证" status={profile?.is_realname_verified ? '已认证' : '未认证'} statusColor={profile?.is_realname_verified ? '#22C55E' : '#F59E0B'} onClick={() => openSubPage('settings-auth')} />
          <SettingItem icon={Icons.grad} iconBg={isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)'} label="学籍认证" status={profile?.is_student_verified ? '已认证' : '未认证'} statusColor={profile?.is_student_verified ? '#22C55E' : '#F59E0B'} onClick={() => openSubPage('settings-student')} />
        </>)}

        {/* 偏好与隐私 */}
        {card(<>
          <SettingItem icon={Icons.eye} iconBg={isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)'} label="隐私设置" onClick={() => openSubPage('settings-privacy')} />
          <SettingItem icon={Icons.bell} iconBg={isDark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)'} label="通知设置" onClick={() => openSubPage('settings-notify')} />
          <SettingItem icon={Icons.ban} iconBg={isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'} label="黑名单管理" onClick={() => openSubPage('settings-blacklist')} />
        </>)}

        {/* 资产与支付 */}
        {card(<>
          <SettingItem icon={Icons.card} iconBg={isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'} label="我的支付宝" status="已绑定 ····5678" statusColor="#22C55E" onClick={() => openSubPage('settings-alipay')} />
          <SettingItem icon={Icons.ticket} iconBg={isDark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)'} label="我的发布券" status="剩余 8 张" onClick={() => openSubPage('coupons')} />
          <SettingItem icon={Icons.book} iconBg={isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'} label="购买记录" onClick={() => openSubPage('settings-purchase')} />
        </>)}

        {/* 系统 */}
        {card(<>
          <SettingItem icon={Icons.gear} iconBg={isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.1)'} label="通用设置" onClick={() => openSubPage('settings-general')} />
        </>)}

        {/* 关于 */}
        {card(<>
          <SettingItem icon={Icons.info} iconBg={isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'} label="关于莳约" status="v1.0.0" onClick={() => openSubPage('settings-about')} />
          <SettingItem icon={Icons.doc} iconBg={isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.1)'} label="用户协议" onClick={() => openSubPage('agreement')} />
          <SettingItem icon={Icons.shield} iconBg={isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.1)'} label="隐私政策" onClick={() => openSubPage('privacy-policy')} />
          <SettingItem icon={Icons.scroll} iconBg={isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.1)'} label="社区公约" onClick={() => openSubPage('community-rules')} />
        </>)}

        {/* 其他 */}
        {card(<>
          <SettingItem icon={Icons.msg} iconBg={isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)'} label="意见反馈" onClick={() => openSubPage('settings-feedback')} />
          <SettingItem icon={Icons.trash} iconBg={isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'} label="清除缓存" status="23.5MB" onClick={() => alert('确认清除 23.5MB 缓存数据？')} />
        </>)}

        {/* 退出登录 */}
        <div style={{ padding: '20px 20px 0' }}>
          <button onClick={() => setShowLogout(true)} style={{
            width: '100%', padding: '15px', borderRadius: 14, background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)'}`,
            color: '#EF4444', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>退出登录</button>
        </div>
      </div>

      {/* 退出确认弹窗 */}
      {showLogout && (
        <div onClick={() => setShowLogout(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: cardBg, borderRadius: 24, padding: 28, width: '82%', maxWidth: 320, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-text)', marginBottom: 8, textAlign: 'center' }}>确认退出登录？</div>
            <div style={{ fontSize: 13, color: 'var(--c-text3)', marginBottom: 24, textAlign: 'center', lineHeight: 1.6 }}>退出后需要重新登录</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowLogout(false)} style={{ flex: 1, padding: 13, borderRadius: 14, border: `1px solid ${border}`, background: 'transparent', color: 'var(--c-text2)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>取消</button>
              <button onClick={() => { clearToken(); window.location.reload() }} style={{ flex: 1, padding: 13, borderRadius: 14, border: 'none', background: '#EF4444', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>确认退出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
