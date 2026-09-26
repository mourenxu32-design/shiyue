import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api from '../utils/api'

/* SVG 图标集 */
const Icons = {
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  task: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>,
  post: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  coupon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2H2V8z"/><circle cx="12" cy="16" r="1"/></svg>,
  invite: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  alipay: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  crown: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 20h20L18 8l-4 5-2-7-2 7-4-5z"/></svg>,
  gift: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  store: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l1-5h16l1 5"/><path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9"/><path d="M9 21v-6h6v6"/><path d="M3 9h18"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  help: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chev: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  check: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
}

/* 菜单项组件 */
function MenuItem({ label, desc, icon, iconColor, onClick, showBorder, copyInfo }) {
  const [copied, setCopied] = useState(false)
  const handleClick = () => {
    if (copyInfo) {
      navigator.clipboard?.writeText(copyInfo).catch(() => {})
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } else if (onClick) onClick()
  }
  return (
    <div onClick={handleClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
      borderBottom: showBorder ? '1px solid var(--c-border)' : 'none', cursor: 'pointer',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconColor || 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text2)', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 2 }}>
          {copyInfo && copied ? '已复制邀请码' : desc}
        </div>
      </div>
      {copyInfo && copied
        ? <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700 }}>✓</span>
        : <span style={{ color: 'var(--c-text3)', opacity: 0.5 }}>{Icons.chev}</span>
      }
    </div>
  )
}

export default function ProfilePage() {
  const { openSubPage, setActiveTab, theme, setUserRole } = useApp()
  const [holidayMode, setHolidayMode] = useState(true)
  const [showHolidayConfirm, setShowHolidayConfirm] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  // 加载用户资料
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const resp = await api.users.profile()
        if (cancelled) return
        setUserProfile(resp?.data || null)
      } catch (err) {
        if (!cancelled) console.error('[ProfilePage] 加载资料失败:', err)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // 邀请码弹窗
  const myInviteCode = 'Kx7M2p'
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [copiedInviteCode, setCopiedInviteCode] = useState(false)
  const [inputInviteCode, setInputInviteCode] = useState('')
  const [inviteSubmitStatus, setInviteSubmitStatus] = useState('idle') // idle | success | error
  const [submittedCode, setSubmittedCode] = useState('') // 提交成功后锁定的邀请码

  // 邀请进度 (API 数据优先，fallback 模拟)
  const inviteCount = userProfile?.invite_count ?? 3
  const inviteMilestones = [
    { need: 1, reward: '发布券 ×1', icon: '🎟️', done: inviteCount >= 1 },
    { need: 3, reward: '急急卡 ×3', icon: '⚡', done: inviteCount >= 3 },
    { need: 5, reward: '发布券 ×5', icon: '🎟️', done: inviteCount >= 5 },
    { need: 10, reward: '月卡体验3天', icon: '👑', done: inviteCount >= 10 },
    { need: 20, reward: '年卡8折', icon: '💎', done: inviteCount >= 20 },
  ]
  const nextMilestone = inviteMilestones.find(m => !m.done)
  const maxNeed = inviteMilestones[inviteMilestones.length - 1].need
  const progressPercent = Math.min((inviteCount / maxNeed) * 100, 100)

  const resetInviteModal = () => {
    setShowInviteModal(false)
    setInviteSubmitStatus('idle')
    setInputInviteCode('')
    setSubmittedCode('')
  }

  const handleCopyInviteCode = () => {
    navigator.clipboard?.writeText(myInviteCode).catch(() => {})
    setCopiedInviteCode(true)
    setTimeout(() => setCopiedInviteCode(false), 2000)
  }

  const handleSubmitInviteCode = () => {
    if (inputInviteCode.length !== 6) {
      setInviteSubmitStatus('error')
      setTimeout(() => setInviteSubmitStatus('idle'), 2000)
      return
    }
    setSubmittedCode(inputInviteCode)
    setInviteSubmitStatus('success')
  }

  const isDark = theme === 'dark'
  const pageBg = isDark ? '#181E2C' : 'var(--c-bg)'
  const cardBg = isDark ? '#1E2536' : 'var(--c-card)'
  const border = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const iconBg = isDark ? '#252E42' : '#F0F0F5'
  const subColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'
  const nameColor = isDark ? '#fff' : '#1C1C1E'
  const schoolColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
  const btnBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'

  return (
    <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: pageBg }}>

      {/* ===== 顶部用户信息 ===== */}
      <div style={{ padding: '48px 20px 0', position: 'relative' }}>
        {/* 右上角 */}
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 2 }}>
          <div onClick={() => openSubPage('settings')} style={{ width: 38, height: 38, borderRadius: 12, background: btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isDark ? '#B0B8C8' : '#636366' }}>{Icons.settings}</div>
        </div>

        {/* 头像 + 信息 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: isDark ? 'linear-gradient(135deg, #2A3A50, #3A4A60)' : 'linear-gradient(135deg, #E8E0F0, #D0C8E0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: isDark ? '#D4A853' : '#6B5CE7', fontWeight: 700, border: isDark ? '2px solid rgba(212,168,83,0.3)' : '2px solid rgba(107,92,231,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>鹿</div>
            {/* 认证角标 */}
            <div style={{ position: 'absolute', bottom: -3, right: -3, width: 22, height: 22, borderRadius: 7, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: `2.5px solid ${isDark ? '#181E2C' : '#F2F2F7'}` }}>{Icons.check}</div>
            {/* 性别符号 */}
            <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderRadius: 6, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${isDark ? '#181E2C' : '#F2F2F7'}` }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><circle cx="10" cy="14" r="7"/><path d="M21 3l-6.5 6.5"/><path d="M16 3h5v5"/></svg>
            </div>
          </div>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: nameColor, letterSpacing: 0.3 }}>莳约小鹿</span>
              <span style={{ background: 'linear-gradient(135deg, #D4A853, #E8BE6A)', color: '#1A1F2E', padding: '2px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>年卡会员</span>
            </div>
            <div style={{ fontSize: 12, color: schoolColor, marginBottom: 10, fontWeight: 500 }}>武汉大学 · 计算机学院</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span onClick={() => openSubPage('auth')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)', color: '#22C55E', padding: '4px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.check}</span>
                学生认证
              </span>
              <span onClick={() => openSubPage('auth')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', color: '#3B82F6', padding: '4px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{Icons.check}</span>
                实名认证
              </span>
            </div>
          </div>
        </div>

        {/* 数据统计 */}
        <div style={{ display: 'flex', marginTop: 28, background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
          {[
            { label: '信用分', value: '92', accent: '#4ADE80', sub: '优秀' },
            { label: '发布', value: '32', accent: nameColor, sub: '任务' },
            { label: '完成', value: '28', accent: nameColor, sub: '任务' },
            { label: '好评率', value: '96%', accent: '#D4A853', sub: '' },
          ].map((item, i) => (
            <div key={item.label} onClick={() => i === 0 ? openSubPage('credit') : i === 3 ? openSubPage('reviews') : null}
              style={{ flex: 1, textAlign: 'center', padding: '16px 0 14px', cursor: 'pointer', position: 'relative', borderRight: i < 3 ? `1px solid ${border}` : 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: item.accent, fontFamily: "'DIN Alternate', 'SF Mono', monospace", lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 10, color: subColor, marginTop: 5, fontWeight: 500 }}>{item.sub}{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 快捷入口 ===== */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 14 }}>快捷入口</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[
            { icon: Icons.task, label: '我的悬赏', color: '#6366F1', action: () => openSubPage('published') },
            { icon: Icons.post, label: '我的帖子', color: '#3B82F6', action: () => setActiveTab('forum') },
            { icon: Icons.star, label: '我的收藏', color: '#F59E0B', action: () => setActiveTab('forum') },
            { icon: Icons.coupon, label: '我的卡券', color: '#F97316', action: () => openSubPage('coupons') },
            { icon: Icons.invite, label: '邀请好友', color: '#8B5CF6', action: () => setShowInviteModal(true) }
          ].map(item => (
            <div key={item.label} onClick={item.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 0 10px', borderRadius: 14, cursor: 'pointer', background: cardBg, border: `1px solid ${border}` }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
              <span style={{ fontSize: 11, color: 'var(--c-text2)', fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 假期模式 ===== */}
      <div style={{ padding: '0 20px', marginTop: 20 }}>
        {holidayMode ? (
          <div style={{ padding: '16px 18px', borderRadius: 16, background: isDark ? 'linear-gradient(135deg, #1E2738, #252E42)' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: `1px solid ${isDark ? border : 'rgba(245,158,11,0.2)'}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#FDE68A' : '#92400E', marginBottom: 4 }}>假期模式已开启</div>
                <div style={{ fontSize: 12, color: isDark ? 'rgba(253,230,138,0.6)' : 'rgba(146,64,14,0.6)' }}>已暂停接单，不影响发布悬赏</div>
              </div>
              <button onClick={() => setShowHolidayConfirm(true)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: isDark ? '#D4A853' : '#F59E0B', color: isDark ? '#1A1F2E' : '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>关闭假期</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 18px', borderRadius: 16, background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)', border: `1px solid ${isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.12)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>接单模式已开启</div>
              <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 2 }}>正在正常接收新任务通知</div>
            </div>
          </div>
        )}
      </div>

      {/* ===== 交易服务 ===== */}
      <div style={{ padding: '0 20px', marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, letterSpacing: 0.5 }}>交易服务</div>
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: '2px 16px' }}>
          <MenuItem icon={Icons.task} iconColor={`${'#6366F1'}18`} label="我的悬赏" desc="查看已发布的任务" onClick={() => openSubPage('published')} showBorder />
          <MenuItem icon={Icons.star} iconColor={`${'#F59E0B'}18`} label="我的评价" desc="查看收到的评价" onClick={() => openSubPage('reviews')} showBorder />
          <MenuItem icon={Icons.alipay} iconColor={`${'#3B82F6'}18`} label="支付宝管理" desc="已绑定 138****5678" onClick={() => openSubPage('alipay')} />
        </div>
      </div>

      {/* ===== 社区互动 ===== */}
      <div style={{ padding: '0 20px', marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, letterSpacing: 0.5 }}>社区互动</div>
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: '2px 16px' }}>
          <MenuItem icon={Icons.post} iconColor={`${'#3B82F6'}18`} label="我的帖子" desc="查看发布的帖子" onClick={() => setActiveTab('forum')} showBorder />
          <MenuItem icon={Icons.chat} iconColor={`${'#8B5CF6'}18`} label="我的评论" desc="查看评论记录" onClick={() => setActiveTab('forum')} showBorder />
          <MenuItem icon={Icons.heart} iconColor={`${'#EF4444'}18`} label="我的收藏" desc="收藏的帖子和任务" onClick={() => setActiveTab('forum')} showBorder />
          <MenuItem icon={Icons.eye} iconColor={`${'#6366F1'}18`} label="浏览记录" desc="最近浏览的内容" onClick={() => setActiveTab('forum')} />
        </div>
      </div>

      {/* ===== 会员与权益 ===== */}
      <div style={{ padding: '0 20px', marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, letterSpacing: 0.5 }}>会员与权益</div>
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: '2px 16px' }}>
          <MenuItem icon={Icons.crown} iconColor={`${'#D4A853'}18`} label="会员中心" desc="管理会员和卡券" onClick={() => openSubPage('member')} showBorder />
          <MenuItem icon={Icons.coupon} iconColor={`${'#F97316'}18`} label="我的卡券" desc="急急卡 6张 / 发布券 8张" onClick={() => openSubPage('coupons')} showBorder />
          <MenuItem icon={Icons.gift} iconColor={`${'#8B5CF6'}18`} label="邀请好友" desc="输入邀请码互相绑定" onClick={() => setShowInviteModal(true)} showBorder />
          <MenuItem icon={Icons.shield} iconColor={`${'#22C55E'}18`} label="认证中心" desc="实名+学籍认证" onClick={() => openSubPage('auth')} />
        </div>
      </div>

      {/* ===== 账号与安全 ===== */}
      <div style={{ padding: '0 20px', marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, letterSpacing: 0.5 }}>账号与安全</div>
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, padding: '2px 16px' }}>
          <MenuItem icon={Icons.chart} iconColor={`${'#4ADE80'}18`} label="信用与评价" desc="信用分 92 · 优秀" onClick={() => openSubPage('credit')} showBorder />
          <MenuItem icon={Icons.help} iconColor={`${'#3B82F6'}18`} label="帮助与反馈" desc="常见问题和意见反馈" onClick={() => openSubPage('settings-feedback')} showBorder />
          <MenuItem icon={Icons.doc} iconColor={`${'#636366'}18`} label="用户协议" desc="服务条款和隐私政策" onClick={() => openSubPage('agreement')} />
        </div>
      </div>

      <div style={{ padding: '28px 16px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--c-text3)', fontWeight: 500 }}>莳约 v1.0.0</div>
      </div>

      {/* ===== 切换到商家模式 ===== */}
      <div style={{ padding: '0 20px 40px' }}>
        <button onClick={() => setUserRole('merchant')} style={{
          width: '100%', padding: 16, borderRadius: 16, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: '#fff', fontSize: 15, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-5h16l1 5"/><path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9"/><path d="M9 21v-6h6v6"/><path d="M3 9h18"/></svg>
          切换到商家模式
        </button>
        <div style={{ fontSize: 11, color: 'var(--c-text3)', textAlign: 'center', marginTop: 10, fontWeight: 500 }}>进入商家版界面，可随时切换回用户模式</div>
      </div>

      {/* ===== 关闭假期确认弹窗 ===== */}
      {showHolidayConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowHolidayConfirm(false)}>
          <div style={{ background: cardBg, borderRadius: 24, padding: 28, width: '82%', maxWidth: 320, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, textAlign: 'center', color: 'var(--c-text)' }}>关闭假期模式</div>
            <div style={{ fontSize: 13, color: 'var(--c-text3)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              关闭后将恢复接收新任务通知和接单功能，确定要关闭吗？
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowHolidayConfirm(false)} style={{ flex: 1, padding: 13, borderRadius: 14, border: `1px solid ${border}`, background: 'transparent', color: 'var(--c-text2)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>取消</button>
              <button onClick={() => { setHolidayMode(false); setShowHolidayConfirm(false) }} style={{ flex: 1, padding: 13, borderRadius: 14, border: 'none', background: isDark ? '#D4A853' : '#F59E0B', color: '#1A1F2E', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>确认关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 邀请码弹窗 ===== */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={resetInviteModal}>
          <div style={{ background: cardBg, borderRadius: 24, padding: '28px 24px', width: '88%', maxWidth: 340, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            {/* 标题 */}
            <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', color: 'var(--c-text)', marginBottom: 6 }}>邀请好友</div>
            <div style={{ fontSize: 12, color: 'var(--c-text3)', textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>分享你的邀请码，好友输入后双方均可获得奖励</div>

            {/* 我的邀请码 */}
            <div style={{ background: isDark ? '#252E42' : '#F8F8FA', borderRadius: 16, padding: '16px 18px', marginBottom: 20, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text3)', marginBottom: 10, letterSpacing: 0.5 }}>我的邀请码</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: "'DIN Alternate', 'SF Mono', 'Courier New', monospace", fontSize: 26, fontWeight: 800, color: '#8B5CF6', letterSpacing: 4, lineHeight: 1 }}>
                  {myInviteCode}
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  style={{
                    padding: '10px 18px', borderRadius: 12, border: 'none',
                    background: copiedInviteCode ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                    color: copiedInviteCode ? '#22C55E' : '#8B5CF6',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .25s',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  {copiedInviteCode ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      已复制
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      复制邀请码
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 输入邀请码 */}
            <div style={{ background: isDark ? '#252E42' : '#F8F8FA', borderRadius: 16, padding: '16px 18px', marginBottom: 20, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text3)', marginBottom: 12, letterSpacing: 0.5 }}>输入好友邀请码</div>
              <div style={{ position: 'relative', background: isDark ? '#1A2035' : '#fff', borderRadius: 14, border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                  <input
                    value={inviteSubmitStatus === 'success' ? submittedCode : inputInviteCode}
                    onChange={e => {
                      const v = e.target.value
                      if (v.length <= 6 && /^[A-Za-z0-9]*$/.test(v)) setInputInviteCode(v)
                    }}
                    readOnly={inviteSubmitStatus === 'success'}
                    placeholder="6位字母或数字"
                    style={{
                      width: '100%', padding: '12px 80px 12px 16px', fontSize: 16, fontWeight: 700, boxSizing: 'border-box',
                      letterSpacing: 2, fontFamily: "'DIN Alternate', 'SF Mono', 'Courier New', monospace",
                      background: 'transparent',
                      color: inviteSubmitStatus === 'success'
                        ? (isDark ? 'rgba(255,255,255,0.4)' : '#A0A0A5')
                        : 'var(--c-text)',
                      border: 'none', outline: 'none', borderRadius: 14,
                      cursor: inviteSubmitStatus === 'success' ? 'not-allowed' : 'text',
                    }}
                  />
                  <button
                    onClick={handleSubmitInviteCode}
                    disabled={inviteSubmitStatus === 'success' || inputInviteCode.length !== 6}
                    style={{
                      position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                      padding: '6px 14px', borderRadius: 10, border: 'none',
                      background: inviteSubmitStatus === 'success'
                        ? 'rgba(34,197,94,0.15)'
                        : inputInviteCode.length === 6 ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      color: inviteSubmitStatus === 'success'
                        ? '#22C55E'
                        : inputInviteCode.length === 6 ? '#fff' : (isDark ? 'rgba(255,255,255,0.25)' : '#A0A0A5'),
                      fontSize: 13, fontWeight: 700,
                      cursor: inviteSubmitStatus === 'success' || inputInviteCode.length !== 6 ? 'not-allowed' : 'pointer',
                      transition: 'all .25s', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    {inviteSubmitStatus === 'success' ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        已提交
                      </>
                    ) : '确认'}
                  </button>
              </div>
              {/* 字符计数 */}
              {inviteSubmitStatus === 'idle' && (
                <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 6, textAlign: 'right' }}>{inputInviteCode.length}/6</div>
              )}
              {/* 状态提示 */}
              {inviteSubmitStatus === 'success' && (
                <div style={{ fontSize: 12, color: '#22C55E', fontWeight: 600, marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  邀请码提交成功，双方已获得奖励
                </div>
              )}
              {inviteSubmitStatus === 'error' && (
                <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  邀请码格式错误，请输入6位字母或数字
                </div>
              )}
            </div>

            {/* 邀请进度 */}
            <div style={{ background: isDark ? '#252E42' : '#F8F8FA', borderRadius: 16, padding: '16px 18px', marginBottom: 20, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text3)', letterSpacing: 0.5 }}>邀请进度</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6', fontFamily: "'DIN Alternate', 'SF Mono', monospace" }}>
                  已邀请 <span style={{ fontSize: 18 }}>{inviteCount}</span> 人
                </div>
              </div>

              {/* 进度条 + 里程碑标记 */}
              <div style={{ position: 'relative', height: 48, marginBottom: 16 }}>
                {/* 轨道 */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: 20, height: 4, borderRadius: 2, background: isDark ? '#1A2035' : 'rgba(0,0,0,0.06)' }}>
                  {/* 填充 */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 2,
                    width: `${progressPercent}%`, background: '#8B5CF6', transition: 'width .4s ease',
                  }} />
                </div>
                {/* 里程碑节点 */}
                {inviteMilestones.map((m, i) => {
                  const pos = (m.need / maxNeed) * 100
                  return (
                    <div key={i} style={{
                      position: 'absolute', left: `${pos}%`, top: 0,
                      transform: 'translateX(-50%)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
                    }}>
                      {/* 节点圆点 */}
                      <div style={{
                        width: 12, height: 12, borderRadius: 6,
                        background: m.done ? '#8B5CF6' : (isDark ? '#1A2035' : '#E5E5EA'),
                        border: m.done ? '2px solid rgba(139,92,246,0.4)' : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        transition: 'all .3s',
                      }} />
                      {/* 标签 */}
                      <div style={{ textAlign: 'center', opacity: m.done ? 1 : 0.45 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: m.done ? '#8B5CF6' : 'var(--c-text3)', marginBottom: 1 }}>{m.need}人</div>
                        <div style={{ fontSize: 8, fontWeight: 600, color: m.done ? '#8B5CF6' : 'var(--c-text3)', whiteSpace: 'nowrap' }}>{m.reward}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 下一阶段提示 */}
              {nextMilestone && (
                <div style={{
                  marginTop: 14, padding: '8px 12px', borderRadius: 10,
                  background: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
                  border: `1px solid ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.1)'}`,
                  fontSize: 11, color: '#8B5CF6', fontWeight: 600, textAlign: 'center',
                }}>
                  再邀请 <span style={{ fontWeight: 800 }}>{nextMilestone.need - inviteCount}</span> 人即可获得 {nextMilestone.reward}
                </div>
              )}
              {!nextMilestone && (
                <div style={{
                  marginTop: 14, padding: '8px 12px', borderRadius: 10,
                  background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
                  fontSize: 11, color: '#22C55E', fontWeight: 600, textAlign: 'center',
                }}>
                  所有奖励已解锁！
                </div>
              )}
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={resetInviteModal}
              style={{ width: '100%', padding: 14, borderRadius: 14, border: `1px solid ${border}`, background: 'transparent', color: 'var(--c-text2)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
