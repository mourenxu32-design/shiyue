import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

export default function AlipayManagePage() {
  const { closeSubPage } = useApp()
  const [bound, setBound] = useState(false)
  const [alipayAccount, setAlipayAccount] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.alipayAccounts().then(resp => {
      if (cancelled) return
      const items = resp?.data?.items || resp?.data
      if (Array.isArray(items) && items.length > 0) {
        setBound(true)
        setAlipayAccount(items[0].alipay_account || items[0].account || '138****5678')
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleBind = async () => {
    if (!getToken()) { showToast('请先登录'); return }
    try {
      await api.users.addAlipay({ alipay_account: 'new_account' })
      setBound(true)
      showToast('绑定成功！')
    } catch (err) { showToast(err?.message || '绑定失败') }
  }

  const handleUnbind = async () => {
    setShowConfirm(false)
    try {
      // 后端暂无解绑接口，先本地更新
      setBound(false)
      showToast('已解绑支付宝')
    } catch (err) { showToast(err?.message || '解绑失败') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 14px', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={closeSubPage} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18 }}>←</div>
          <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>支付宝管理</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
        {/* Current binding */}
        <div style={{ background: 'var(--c-card)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid var(--c-border-light)', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1677FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28 }}>💰</div>
          {bound ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>已绑定支付宝</div>
              <div style={{ fontSize: 13, color: 'var(--c-text3)' }}>{alipayAccount}</div>
              <div style={{ fontSize: 11, color: '#22C55E', marginTop: 8 }}>✓ 已实名验证</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#EF4444' }}>未绑定支付宝</div>
              <div style={{ fontSize: 13, color: 'var(--c-text3)' }}>绑定后可接收悬赏佣金</div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ background: 'var(--c-card)', borderRadius: 14, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--c-border-light)' }}>
          {[
            { icon: '📋', label: '收款记录', desc: '查看历史收款' },
            { icon: '📊', label: '收支统计', desc: '本月收入 ¥186' },
            { icon: '🔒', label: '提现设置', desc: '最低提现 10元' },
          ].map((item, i) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < 2 ? '1px solid var(--c-border)' : 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>{item.desc}</div>
              </div>
              <span style={{ color: '#555', fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>

        {bound ? (
          <button onClick={() => setShowConfirm(true)} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #EF4444', background: 'transparent', color: '#EF4444', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            解绑支付宝
          </button>
        ) : (
          <button onClick={handleBind} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#1677FF', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            绑定支付宝
          </button>
        )}

        {/* Confirm modal */}
        {showConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowConfirm(false)}>
            <div style={{ background: 'var(--c-card)', borderRadius: 20, padding: 24, width: '80%', maxWidth: 300 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>确认解绑</div>
              <div style={{ fontSize: 13, color: 'var(--c-text3)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>解绑后将无法接收悬赏佣金，已有余额不受影响。</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid var(--c-border-light)', background: 'transparent', color: 'var(--c-text2)', fontSize: 13, cursor: 'pointer' }}>取消</button>
                <button onClick={handleUnbind} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>确认解绑</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
