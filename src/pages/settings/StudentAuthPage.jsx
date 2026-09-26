import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard } from './SettingShared'
import api, { getToken } from '../../utils/api'

export default function StudentAuthPage() {
  const { openSubPage } = useApp()
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const pageBg = isDark ? '#181E2C' : '#F2F2F7'
  const inputBg = isDark ? '#252E42' : '#F5F5F7'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const accentGrad = isDark ? 'linear-gradient(135deg, #D4A853, #E8BE6A)' : 'linear-gradient(135deg, #1E2A3A, #2D3A4A)'

  const [school, setSchool] = useState('')
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.profile().then(resp => {
      if (cancelled) return
      if (resp?.data?.is_student_verified) setVerified(true)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async () => {
    if (!school.trim()) { showToast('请填写学校名称'); return }
    setSubmitting(true)
    try {
      await api.users.verifyStudent({ school_name: school, edu_email: email || undefined })
      setVerified(true)
      showToast('学籍认证提交成功！')
    } catch (err) { showToast(err?.message || '提交失败') }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pageBg }}>
      <SettingNav title="学籍认证" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        {verified ? (
          <>
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
              <div style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 4 }}>学籍认证已通过</div>
              <div style={{ fontSize: 13, color: subColor }}>武汉大学 · 计算机学院 · 大三</div>
            </div>

            <SettingCard>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${borderColor}` }}>
                <span style={{ color: subColor, marginRight: 12, display: 'flex' }}>{I.brief}</span>
                <span style={{ flex: 1, fontSize: 14, color: subColor }}>学校</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>武汉大学</span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${borderColor}` }}>
                <span style={{ color: subColor, marginRight: 12, display: 'flex' }}>{I.doc}</span>
                <span style={{ flex: 1, fontSize: 14, color: subColor }}>学院</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>计算机学院</span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: subColor, marginRight: 12, display: 'flex' }}>{I.star}</span>
                <span style={{ flex: 1, fontSize: 14, color: subColor }}>认证等级</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', background: 'rgba(59,130,246,0.12)', padding: '3px 10px', borderRadius: 8 }}>L3 学生</span>
              </div>
            </SettingCard>
          </>
        ) : (
          <>
            <div style={{ padding: '20px 20px 8px', textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                background: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B',
              }}>{I.brief}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 4 }}>学籍认证</div>
              <div style={{ fontSize: 12, color: subColor }}>认证学籍后可解锁更多功能，发布和接单更受信任</div>
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 8, letterSpacing: 0.5 }}>学籍信息</div>
            </div>
            <SettingCard>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: subColor, marginBottom: 8 }}>学校名称</div>
                <input value={school} onChange={e => setSchool(e.target.value)}
                  placeholder="请输入学校名称"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: inputBg, color: textColor, fontSize: 14, outline: 'none' }}
                />
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: subColor, marginBottom: 8 }}>教育邮箱</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="xxx@whu.edu.cn"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none', background: inputBg, color: textColor, fontSize: 14, outline: 'none' }}
                  />
                  <button onClick={() => showToast('验证码已发送')} style={{
                    padding: '10px 14px', borderRadius: 10, border: 'none', flexShrink: 0,
                    background: isDark ? '#3A4A60' : '#E5E7EB', color: textColor, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>发送验证码</button>
                </div>
              </div>
            </SettingCard>

            <div style={{ padding: '0 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: subColor, marginBottom: 8, letterSpacing: 0.5 }}>学生证照片</div>
            </div>
            <SettingCard>
              <div style={{ padding: '16px', display: 'flex', gap: 10 }}>
                <div style={{
                  flex: 1, aspectRatio: '4/3', borderRadius: 12, background: inputBg,
                  border: `2px dashed ${borderColor}`, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: subColor,
                }}>
                  <span style={{ display: 'flex' }}>{I.upload}</span>
                  <span style={{ fontSize: 11 }}>学生证首页</span>
                </div>
                <div style={{
                  flex: 1, aspectRatio: '4/3', borderRadius: 12, background: inputBg,
                  border: `2px dashed ${borderColor}`, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: subColor,
                }}>
                  <span style={{ display: 'flex' }}>{I.upload}</span>
                  <span style={{ fontSize: 11 }}>注册页</span>
                </div>
              </div>
            </SettingCard>

            <div style={{ padding: '16px 20px' }}>
              <button onClick={handleSubmit} disabled={submitting} style={{
                width: '100%', padding: 14, borderRadius: 14, border: 'none',
                background: accentGrad, color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
              }}>{submitting ? '提交中...' : '提交学籍认证'}</button>
            </div>

            <div style={{ margin: '0 20px 16px', padding: '12px 16px', borderRadius: 12, background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', fontSize: 12, color: isDark ? '#F59E0B' : '#D97706', lineHeight: 1.6 }}>
              学籍认证后可解锁更多高级功能，发布和接单更受信任
            </div>
          </>
        )}
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
