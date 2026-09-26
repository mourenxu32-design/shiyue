import { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'
import api from '../utils/api'

const PHONE_RE = /^1[3-9]\d{9}$/

export default function LoginPage() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef(null)

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [countdown])

  const canSend = PHONE_RE.test(phone) && countdown === 0 && !sending

  const handleSendCode = async () => {
    if (!canSend) return
    setError('')
    setSending(true)
    try {
      const res = await api.auth.sendCode(phone)
      // 开发模式：验证码在响应中返回
      if (res?.data?.code) {
        setCode(res.data.code)
      }
      setCountdown(60)
    } catch (e) {
      setError(e.message || '发送失败')
    } finally {
      setSending(false)
    }
  }

  const canSubmit = PHONE_RE.test(phone) && code.length >= 4 && agreed && !loading

  const handleSubmit = async () => {
    if (!agreed) {
      setError('请先阅读并同意服务条款和隐私政策')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.auth.smsLogin(phone, code)
      openSubPage(null)
    } catch (e) {
      setError(e.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDevLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await api.auth.devLogin()
      openSubPage(null)
    } catch (e) {
      setError(e.message || '测试登录失败')
    } finally {
      setLoading(false)
    }
  }

  const bg = isDark ? '#0F172A' : '#F8FAFC'
  const inputBg = isDark ? '#0F172A' : '#F1F5F9'
  const inputBorder = isDark ? '#334155' : '#E2E8F0'
  const textPrimary = isDark ? '#F1F5F9' : '#1E293B'
  const textSecondary = isDark ? '#94A3B8' : '#64748B'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg, overflowY: 'auto' }}>
      {/* 返回按钮 */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={() => openSubPage(null)} style={{
          width: 36, height: 36, borderRadius: 10, background: inputBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          border: `1px solid ${inputBorder}`, fontSize: 18, color: textSecondary,
        }}>←</div>
      </div>

      {/* Logo 区域 */}
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, color: '#fff', fontWeight: 700,
          fontFamily: '"Noto Serif SC", serif',
          boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
        }}>莳</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginTop: 12, letterSpacing: 4 }}>莳约</div>
        <div style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>悬赏为约，揭榜来莳</div>
      </div>

      {/* 表单 */}
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 手机号 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: textSecondary, marginBottom: 6 }}>手机号</div>
          <input
            type="tel" maxLength={11} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="请输入11位手机号"
            style={{
              width: '100%', padding: '14px 14px', borderRadius: 12, fontSize: 16,
              background: inputBg, border: `1px solid ${PHONE_RE.test(phone) ? '#22C55E' : inputBorder}`,
              color: textPrimary, outline: 'none', boxSizing: 'border-box',
              letterSpacing: 1,
            }}
          />
          {phone.length === 11 && !PHONE_RE.test(phone) && (
            <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>手机号格式不正确</div>
          )}
        </div>

        {/* 验证码 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: textSecondary, marginBottom: 6 }}>验证码</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="tel" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="请输入验证码"
              style={{
                flex: 1, padding: '14px 14px', borderRadius: 12, fontSize: 16,
                background: inputBg, border: `1px solid ${code.length >= 4 ? '#22C55E' : inputBorder}`,
                color: textPrimary, outline: 'none', boxSizing: 'border-box',
                letterSpacing: 4,
              }}
            />
            <button
              onClick={handleSendCode}
              disabled={!canSend}
              style={{
                flexShrink: 0, width: 110, borderRadius: 12, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
                background: canSend ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : (isDark ? '#334155' : '#CBD5E1'),
                color: canSend ? '#fff' : textSecondary,
                transition: 'all .2s',
              }}
            >
              {sending ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: 13, color: '#EF4444',
          }}>{error}</div>
        )}

        {/* 协议勾选 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
          <div onClick={() => setAgreed(!agreed)} style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, cursor: 'pointer',
            background: agreed ? '#2563EB' : 'transparent',
            border: agreed ? 'none' : `2px solid ${inputBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s',
          }}>
            {agreed && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            )}
          </div>
          <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.7 }}>
            我已阅读并同意
            <span onClick={() => openSubPage('agreement')} style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>《服务条款》</span>
            和
            <span onClick={() => openSubPage('privacy-policy')} style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>《隐私政策》</span>
          </div>
        </div>

        {/* 提交按钮 */}
        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 16, fontWeight: 700,
          border: 'none', cursor: 'pointer', marginTop: 8,
          background: !canSubmit
            ? (isDark ? '#334155' : '#CBD5E1')
            : 'linear-gradient(135deg, #2563EB, #7C3AED)',
          color: !canSubmit ? textSecondary : '#fff',
          boxShadow: !canSubmit ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
          transition: 'all .2s',
        }}>
          {loading ? '登录中...' : '登录'}
        </button>

        {/* 测试登录按钮 */}
        <button onClick={handleDevLogin} disabled={loading} style={{
          width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600,
          border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`, cursor: 'pointer', marginTop: 10,
          background: 'transparent',
          color: textSecondary,
          transition: 'all .2s',
        }}>
          测试登录（免验证码）
        </button>
      </div>

      {/* 底部说明 */}
      <div style={{ textAlign: 'center', padding: '24px 0 40px', fontSize: 12, color: textSecondary }}>
        未注册的手机号验证后将自动创建账号
      </div>
    </div>
  )
}
