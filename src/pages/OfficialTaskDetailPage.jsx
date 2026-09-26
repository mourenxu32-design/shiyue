import { useState } from 'react'

const inviteSteps = [
  { step: 1, title: '复制邀请码', desc: '点击复制你的专属邀请码', icon: '📋' },
  { step: 2, title: '分享给好友', desc: '将邀请码分享给朋友，邀请他们注册', icon: '📤' },
  { step: 3, title: '好友注册认证', desc: '好友使用你的邀请码注册并完成实名认证', icon: '✅' },
  { step: 4, title: '获得现金奖励', desc: '每成功邀请一人，立得 ¥5 现金', icon: '💰' },
]

export default function OfficialTaskDetailPage({ onBack }) {
  const [copied, setCopied] = useState(false)
  // 接受任务状态：接受后才显示邀请码，持久化到 localStorage
  const [accepted, setAccepted] = useState(() => {
    try { return localStorage.getItem('shiyue_official_invite_accepted') === '1' } catch { return false }
  })
  const inviteCode = '088621'

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAccept = () => {
    try { localStorage.setItem('shiyue_official_invite_accepted', '1') } catch { /* 静默 */ }
    setAccepted(true)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--c-bg)' }}>
      {/* Header */}
      <div style={{
        position: 'relative', padding: '48px 20px 24px',
        background: 'linear-gradient(135deg, #1a0533, #0a1628, #0f172a)',
        overflow: 'hidden',
      }}>
        {/* Animated background circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,128,0.2), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,140,0,0.15), transparent 70%)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'relative' }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 12, border: 'none',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="official-task-badge">🎁 官方活动</span>
        </div>

        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>邀请好友赚现金</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            邀请好友注册莳约App，每成功邀请一人并完成实名认证，即可获得现金奖励，上不封顶！
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Stats bar */}
        <div style={{ display: 'flex', padding: '16px 20px', background: 'var(--c-card)', borderBottom: '1px solid var(--c-border)' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FF0080' }}>¥5</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>每人奖励</div>
          </div>
          <div style={{ width: 1, background: 'var(--c-border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#22C55E' }}>1,523</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>参与人数</div>
          </div>
          <div style={{ width: 1, background: 'var(--c-border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#F59E0B' }}>¥7,615</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>已发奖励</div>
          </div>
        </div>

        {/* Invite Code Section */}
        <div style={{ padding: '20px 16px' }}>
          {accepted ? (
            <div className="official-task-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ position: 'relative', zIndex: 3 }}>
                <div style={{ fontSize: 13, color: 'var(--c-text2)', marginBottom: 8 }}>你的专属邀请码</div>
                <div style={{
                  fontSize: 36, fontWeight: 900, letterSpacing: 8, fontFamily: 'monospace',
                  background: 'linear-gradient(135deg, #FF0080, #FF8C00, #FFE600)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  marginBottom: 12,
                }}>{inviteCode}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text3)', marginBottom: 16 }}>邀请码范围 000000~100000 · 纯数字6位</div>
                <button onClick={handleCopy} style={{
                  width: '100%', padding: '14px 0', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  background: copied ? '#22C55E' : 'linear-gradient(135deg, #FF0080, #FF8C00)',
                  boxShadow: copied ? '0 4px 16px rgba(34,197,94,0.3)' : '0 4px 16px rgba(255,0,128,0.3)',
                  transition: 'all 0.3s',
                }}>
                  {copied ? '✓ 已复制到剪贴板' : '复制邀请码'}
                </button>
              </div>
            </div>
          ) : (
            <div className="official-task-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ position: 'relative', zIndex: 3 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 22, margin: '0 auto 14px',
                  background: 'linear-gradient(135deg, rgba(255,0,128,0.18), rgba(255,140,0,0.18))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                  boxShadow: '0 6px 20px rgba(255,0,128,0.25)',
                }}>🎁</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--c-text)', marginBottom: 8 }}>
                  接受任务，解锁你的专属邀请码
                </div>
                <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.7, marginBottom: 20 }}>
                  接受「邀请好友赚现金」任务后，系统会为你生成唯一邀请码，每邀请 1 位新用户完成注册+认证，立得 ¥5 现金奖励
                </div>
                <button onClick={handleAccept} style={{
                  width: '100%', padding: '14px 0', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FF0080, #FF8C00)',
                  boxShadow: '0 6px 20px rgba(255,0,128,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                  </svg>
                  立即接受任务
                </button>
                <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  接受即表示同意《官方任务参与协议》
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 14, paddingLeft: 4 }}>参与步骤</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inviteSteps.map(s => (
              <div key={s.step} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                background: 'var(--c-card)', borderRadius: 14, border: '1px solid var(--c-border)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(255,0,128,0.1), rgba(255,140,0,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#FF0080',
                      background: 'rgba(255,0,128,0.1)', padding: '1px 6px', borderRadius: 4,
                    }}>STEP {s.step}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{s.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-text2)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div style={{ padding: '0 16px', paddingBottom: accepted ? 100 : 40 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 14, paddingLeft: 4 }}>活动规则</div>
          <div style={{
            padding: '16px', background: 'var(--c-card)', borderRadius: 14,
            border: '1px solid var(--c-border)', fontSize: 12, color: 'var(--c-text2)', lineHeight: 2,
          }}>
            <div>1. 被邀请人需使用邀请码注册并完成实名认证</div>
            <div>2. 奖励将在被邀请人认证通过后 24 小时内发放</div>
            <div>3. 同一设备/IP 注册的账号不计入有效邀请</div>
            <div>4. 活动时间：即日起至 2025年12月31日</div>
            <div>5. 莳约保留对活动的最终解释权</div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {accepted && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px',
          background: 'var(--c-nav)', borderTop: '1px solid var(--c-border)',
          backdropFilter: 'blur(12px)',
        }}>
          <button onClick={handleCopy} style={{
            width: '100%', padding: '15px 0', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer',
            background: 'linear-gradient(135deg, #FF0080, #FF8C00)',
            boxShadow: '0 4px 20px rgba(255,0,128,0.35)',
          }}>
            {copied ? '✓ 已复制 · 去分享给好友' : '复制邀请码 · 开始赚钱'}
          </button>
        </div>
      )}
    </div>
  )
}
