import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard, ConfirmModal } from './SettingShared'
import api, { getToken } from '../../utils/api'

export default function SettingsAlipayPage() {
  const { openSubPage } = useApp()
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const pageBg = isDark ? '#181E2C' : '#F2F2F7'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'

  const [bound, setBound] = useState(false)
  const [showUnbind, setShowUnbind] = useState(false)
  const [alipayAccount, setAlipayAccount] = useState('138****5678')
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

  const handleUnbind = () => {
    setBound(false)
    setShowUnbind(false)
    showToast('已解绑支付宝')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pageBg }}>
      <SettingNav title="支付宝管理" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        {/* 绑定状态 */}
        <div style={{ textAlign: 'center', padding: '28px 20px 20px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
            background: bound ? '#1677FF' : (isDark ? '#252E42' : '#F0F0F5'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: bound ? '0 4px 20px rgba(22,119,255,0.3)' : 'none',
          }}>
            <span style={{ display: 'flex', color: bound ? '#fff' : subColor, transform: 'scale(1.8)' }}>{I.alipay}</span>
          </div>
          {bound ? (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, color: textColor, marginBottom: 4 }}>已绑定支付宝</div>
              <div style={{ fontSize: 13, color: subColor }}>{alipayAccount}</div>
              <div style={{ fontSize: 12, color: '#22C55E', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-6"/></svg>
                已实名验证
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>未绑定支付宝</div>
              <div style={{ fontSize: 13, color: subColor }}>绑定后可接收悬赏佣金</div>
            </>
          )}
        </div>

        {/* 功能列表 */}
        <SettingCard>
          {[
            { icon: I.card, label: '收款记录', desc: '查看历史收款' },
            { icon: I.star, label: '收支统计', desc: '本月收入 ¥186' },
            { icon: I.lock, label: '提现设置', desc: '最低提现 10元' },
          ].map((item, i) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
              borderBottom: i < 2 ? `1px solid ${borderColor}` : 'none',
            }}>
              <span style={{ display: 'flex', color: subColor }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: textColor }}>{item.label}</div>
                <div style={{ fontSize: 12, color: subColor, marginTop: 2 }}>{item.desc}</div>
              </div>
              <span style={{ color: subColor }}>{I.chev}</span>
            </div>
          ))}
        </SettingCard>

        {/* 绑定/解绑按钮 */}
        <div style={{ padding: '8px 20px 20px' }}>
          {bound ? (
            <button onClick={() => setShowUnbind(true)}
              style={{
                width: '100%', padding: 14, borderRadius: 14,
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
                background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.04)',
                color: '#EF4444', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>解绑支付宝</button>
          ) : (
            <button onClick={handleBind}
              style={{
                width: '100%', padding: 14, borderRadius: 14, border: 'none',
                background: '#1677FF', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>绑定支付宝</button>
          )}
        </div>

        <div style={{ padding: '0 20px', marginTop: 4 }}>
          <div style={{ fontSize: 11, color: subColor, lineHeight: 1.8, padding: '0 16px' }}>
            支付宝账户用于接收悬赏任务的佣金，绑定后请勿随意更换。如遇问题请联系客服。
          </div>
        </div>
      </div>

      {showUnbind && (
        <ConfirmModal
          title="确认解绑"
          desc="解绑后将无法接收悬赏佣金，已有余额不受影响。"
          danger
          confirmText="确认解绑"
          onConfirm={handleUnbind}
          onCancel={() => setShowUnbind(false)}
        />
      )}
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
