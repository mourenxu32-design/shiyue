import { useState, useEffect } from 'react'
import api, { getToken } from '../utils/api'

export default function InvitePage({ onBack }) {
  const [inviteCode, setInviteCode] = useState('SHIYUE2025')
  const [inviteCount, setInviteCount] = useState(0)
  const [tiers, setTiers] = useState([
    { count: 1, reward: '发布券 ×1', done: false },
    { count: 3, reward: '置顶卡 ×1', done: false },
    { count: 5, reward: '季卡3天', done: false },
    { count: 10, reward: '发布券 ×5', done: false },
    { count: 20, reward: '年卡30天', done: false },
  ])
  const [invitees, setInvitees] = useState([])
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.profile().then(resp => {
      if (cancelled) return
      const u = resp?.data
      if (u?.invite_code) setInviteCode(u.invite_code)
      const cnt = u?.invite_count ?? 0
      setInviteCount(cnt)
      setTiers(prev => prev.map(t => ({ ...t, done: cnt >= t.count })))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      showToast('邀请码已复制！')
    } catch {
      showToast('复制失败，请手动复制')
    }
  }

  const handleShare = (method) => {
    const text = `来莳约一起玩吧！使用我的邀请码 ${inviteCode} 注册，双方都有奖励哦～`
    if (method === 'copy') {
      navigator.clipboard.writeText(text).then(() => showToast('链接已复制！')).catch(() => showToast('复制失败'))
    } else {
      showToast(`已生成${method}分享`)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, color: 'var(--c-text)' }}>邀请好友</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Invite Code */}
        <div className="card" style={{ margin: '0 0 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 8 }}>你的邀请码</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-primary)', letterSpacing: 4, marginBottom: 12, fontFamily: 'monospace' }}>{inviteCode}</div>
          <button onClick={handleCopy} className="btn btn-purple btn-sm">复制邀请码</button>
        </div>

        {/* Progress */}
        <div className="card" style={{ margin: '0 0 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--c-text)' }}>邀请进度（已邀请 {inviteCount} 人）</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {tiers.map((tier, i) => (
              <div key={tier.count} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', margin: '0 auto 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: tier.done ? 'var(--c-primary)' : 'var(--c-input)',
                  color: tier.done ? 'white' : 'var(--c-text3)',
                  border: tier.done ? 'none' : '2px solid var(--c-border-light)',
                }}>{tier.count}</div>
                <div style={{ fontSize: 9, color: tier.done ? 'var(--c-primary)' : 'var(--c-text3)' }}>{tier.reward}</div>
                {i < tiers.length - 1 && (
                  <div style={{ position: 'absolute', top: 14, left: '60%', right: '-40%', height: 2, background: tier.done ? 'var(--c-primary)' : 'var(--c-border-light)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reward History */}
        <div className="card" style={{ margin: '0 0 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--c-text)' }}>奖励记录</div>
          {invitees.map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < invitees.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
              <div>
                <span style={{ fontSize: 13, color: 'var(--c-text)' }}>{inv.name}</span>
                <span style={{ fontSize: 11, color: 'var(--c-text3)', marginLeft: 8 }}>{inv.time}</span>
              </div>
              <span className="tag tag-green" style={{ fontSize: 10 }}>{inv.reward}</span>
            </div>
          ))}
        </div>

        {/* Share Methods */}
        <div className="card" style={{ margin: '0 0 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--c-text)' }}>分享给好友</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { icon: '💚', label: '微信' },
              { icon: '🔗', label: '复制链接' },
              { icon: '📱', label: '短信' },
              { icon: '📋', label: '生成海报' },
            ].map(m => (
              <div key={m.label} onClick={() => handleShare(m.label)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 20 }}>{m.icon}</div>
                <div style={{ fontSize: 10, color: 'var(--c-text3)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div style={{ fontSize: 11, color: 'var(--c-text3)', lineHeight: 1.8, padding: '8px 0' }}>
          规则说明：好友完成注册并绑定学籍后，双方均可获得邀请奖励。
        </div>
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
