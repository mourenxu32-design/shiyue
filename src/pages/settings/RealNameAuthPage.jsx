import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard } from './SettingShared'
import api, { getToken } from '../../utils/api'

export default function RealNameAuthPage() {
  const { openSubPage } = useApp()
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [idNum, setIdNum] = useState('')
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const pageBg = isDark ? '#181E2C' : '#F2F2F7'
  const inputBg = isDark ? '#252E42' : '#F5F5F7'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const accentGrad = isDark ? 'linear-gradient(135deg, #D4A853, #E8BE6A)' : 'linear-gradient(135deg, #1E2A3A, #2D3A4A)'

  const [verified, setVerified] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.profile().then(resp => {
      if (cancelled) return
      if (resp?.data?.is_realname_verified) setVerified(true)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async () => {
    if (!name.trim() || !idNum.trim()) { showToast('请填写完整信息'); return }
    setSubmitting(true)
    try {
      await api.users.verifyRealname({ name, id_number: idNum })
      setVerified(true)
      showToast('实名认证提交成功！')
    } catch (err) { showToast(err?.message || '提交失败') }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pageBg }}>
      <SettingNav title="实名认证" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        {verified ? (
          <>
            {/* 已认证状态 */}
            <div style={{ textAlign: 'center', padding: '32px 20px 24px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                background: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 11l4 4 8-9"/></svg>
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 4 }}>实名认证已通过</div>
              <div style={{ fontSize: 13, color: subColor }}>认证时间：2025-06-01</div>
            </div>

            <SettingCard>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${borderColor}` }}>
                <span style={{ color: subColor, marginRight: 12, display: 'flex' }}>{I.user}</span>
                <span style={{ flex: 1, fontSize: 14, color: subColor }}>姓名</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>鹿**</span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${borderColor}` }}>
                <span style={{ color: subColor, marginRight: 12, display: 'flex' }}>{I.shield}</span>
                <span style={{ flex: 1, fontSize: 14, color: subColor }}>身份证号</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>320***********1234</span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: subColor, marginRight: 12, display: 'flex' }}>{I.card}</span>
                <span style={{ flex: 1, fontSize: 14, color: subColor }}>认证等级</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '3px 10px', borderRadius: 8 }}>L2 实名</span>
              </div>
            </SettingCard>

            <div style={{ padding: '0 20px', marginTop: 8 }}>
              <div style={{ fontSize: 11, color: subColor, lineHeight: 1.8, padding: '8px 16px' }}>
                实名认证信息已加密存储，仅用于平台信用体系验证，不会泄露给第三方。
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 未认证 - 表单 */}
            <div style={{ padding: '20px 20px 8px', textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1',
              }}>{I.shield}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 4 }}>实名认证</div>
              <div style={{ fontSize: 12, color: subColor }}>完成实名认证后可提升信用等级</div>
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 8, letterSpacing: 0.5 }}>个人信息</div>
            </div>
            <SettingCard>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: subColor, marginBottom: 8 }}>真实姓名</div>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="请输入真实姓名"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none',
                    background: inputBg, color: textColor, fontSize: 14, outline: 'none',
                  }}
                />
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: subColor, marginBottom: 8 }}>身份证号码</div>
                <input value={idNum} onChange={e => setIdNum(e.target.value)}
                  placeholder="请输入身份证号码"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none',
                    background: inputBg, color: textColor, fontSize: 14, outline: 'none',
                  }}
                />
              </div>
            </SettingCard>

            <div style={{ padding: '0 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 8, letterSpacing: 0.5 }}>证件照片</div>
            </div>
            <SettingCard>
              <div style={{ padding: '16px', display: 'flex', gap: 10 }}>
                <div style={{
                  flex: 1, aspectRatio: '4/3', borderRadius: 12, background: inputBg,
                  border: `2px dashed ${borderColor}`, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: subColor,
                }}>
                  <span style={{ display: 'flex' }}>{I.upload}</span>
                  <span style={{ fontSize: 11 }}>身份证正面</span>
                </div>
                <div style={{
                  flex: 1, aspectRatio: '4/3', borderRadius: 12, background: inputBg,
                  border: `2px dashed ${borderColor}`, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: subColor,
                }}>
                  <span style={{ display: 'flex' }}>{I.upload}</span>
                  <span style={{ fontSize: 11 }}>身份证反面</span>
                </div>
              </div>
            </SettingCard>

            <div style={{ padding: '16px 20px' }}>
              <button onClick={handleSubmit} disabled={submitting}
                style={{
                  width: '100%', padding: 14, borderRadius: 14, border: 'none',
                  background: accentGrad, color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                }}>{submitting ? '提交中...' : '提交实名认证'}</button>
            </div>

            <div style={{ padding: '0 20px' }}>
              <div style={{ fontSize: 11, color: subColor, lineHeight: 1.8, padding: '0 16px' }}>
                提交即表示同意《莳约实名认证协议》，信息仅用于身份验证，平台将严格保护您的隐私。
              </div>
            </div>
          </>
        )}
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
