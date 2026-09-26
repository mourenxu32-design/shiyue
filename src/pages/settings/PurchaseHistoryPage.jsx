import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav } from './SettingShared'
import api, { getToken } from '../../utils/api'

const localOrders = [
  { id: 1, type: '会员季卡', amount: 25, method: 'wechat', time: '2025-06-15 14:30', orderNo: 'SY20250615143000001', status: 'success' },
  { id: 2, type: '急急卡', amount: 3, method: 'alipay', time: '2025-06-10 09:15', orderNo: 'SY20250610091500002', status: 'success' },
  { id: 3, type: '会员月卡', amount: 12, method: 'wechat', time: '2025-05-15 20:00', orderNo: 'SY20250515200000003', status: 'refunding' },
  { id: 4, type: '会员年卡', amount: 68, method: 'alipay', time: '2025-03-01 10:00', orderNo: 'SY20250301100000004', status: 'refunded' },
]

const tabs = ['全部', '会员', '急急卡']

export default function PurchaseHistoryPage() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const cardBg = isDark ? '#1E2536' : '#FFFFFF'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'
  const navBg = isDark ? '#141820' : '#FFFFFF'

  const [activeTab, setActiveTab] = useState('全部')
  const [orders, setOrders] = useState(localOrders)

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.purchaseHistory().then(resp => {
      if (cancelled) return
      const items = resp?.data?.items || resp?.data
      if (Array.isArray(items) && items.length > 0) {
        const apiStatusMap = { paid: 'success', completed: 'success', refunding: 'refunding', refunded: 'refunded' }
        setOrders(items.map(o => ({
          id: o.id, type: o.product_name || o.item_type || '会员',
          amount: Number(o.amount || o.pay_amount || 0), method: o.pay_method === 'alipay' ? 'alipay' : 'wechat',
          time: o.created_at ? o.created_at.replace('T', ' ').slice(0, 16) : '',
          orderNo: o.order_no || `SY${o.id}`, status: apiStatusMap[o.status] || 'success',
        })))
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const filtered = activeTab === '全部' ? orders :
    activeTab === '会员' ? orders.filter(o => o.type.startsWith('会员')) :
    orders.filter(o => o.type === '急急卡')

  const statusMap = {
    success: { label: '支付成功', color: '#22C55E', bg: isDark ? 'rgba(34,197,94,0.12)' : '#ECFDF5' },
    refunding: { label: '退款中', color: '#F59E0B', bg: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB' },
    refunded: { label: '已退款', color: '#9CA3AF', bg: isDark ? 'rgba(156,163,175,0.12)' : '#F3F4F6' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="购买记录" onBack={() => openSubPage('settings')} />

      <div style={{ display: 'flex', background: navBg, borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
        {tabs.map(t => (
          <div key={t} onClick={() => setActiveTab(t)}
            style={{
              flex: 1, textAlign: 'center', padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              color: activeTab === t ? textColor : subColor, position: 'relative',
            }}>
            {t}
            {activeTab === t && <div style={{ position: 'absolute', bottom: 0, left: '30%', right: '30%', height: 2, background: isDark ? '#D4A853' : '#1E2A3A', borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: isDark ? '#252E42' : '#F0F0F5', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor }}>{I.doc}</div>
            <div style={{ fontSize: 14, color: subColor }}>暂无购买记录</div>
          </div>
        ) : (
          filtered.map(order => {
            const st = statusMap[order.status]
            return (
              <div key={order.id} style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, margin: '0 20px 12px', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: order.type === '急急卡' ? (isDark ? 'rgba(239,68,68,0.15)' : '#FEE2E2') : (isDark ? 'rgba(2,132,199,0.15)' : '#E0F2FE'),
                    color: order.type === '急急卡' ? '#EF4444' : '#0284C7',
                  }}>{order.type}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: textColor, marginBottom: 8 }}>¥{order.amount}<span style={{ fontSize: 14, fontWeight: 500 }}>.00</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: order.method === 'wechat' ? '#22C55E' : '#3B82F6' }}>{order.method === 'wechat' ? I.wechat : I.alipay}</span>
                  <span style={{ fontSize: 12, color: subColor }}>{order.method === 'wechat' ? '微信支付' : '支付宝'}</span>
                </div>
                <div style={{ fontSize: 12, color: subColor, marginBottom: 4 }}>{order.time}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: subColor }}>订单号：{order.orderNo}</span>
                  <span style={{ fontSize: 11, color: isDark ? '#D4A853' : '#1E2A3A', cursor: 'pointer', fontWeight: 600 }}>复制</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
