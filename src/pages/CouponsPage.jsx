import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

const localCoupons = [
  { id: 3, type: 'publish', name: '发布抵扣券', count: 5, expireAt: '2025-07-30', status: '可用' },
  { id: 4, type: 'publish', name: '发布折扣券 8折', count: 3, expireAt: '2025-12-31', status: '可用' },
  { id: 5, type: 'urgent', name: '急急卡', count: 6, expireAt: '2025-10-01', status: '可用' },
  { id: 6, type: 'publish', name: '发布抵扣券', count: 2, expireAt: '2025-05-01', status: '已过期' },
]

const typeColors = { publish: '#22C55E', urgent: '#EF4444' }
const typeIcons = { publish: '🎟️', urgent: '⚡' }

export default function CouponsPage() {
  const { closeSubPage, openSubPage } = useApp()
  const [tab, setTab] = useState('可用')
  const [coupons, setCoupons] = useState(localCoupons)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.coupons.mine().then(resp => {
      if (cancelled) return
      const items = resp?.data?.items
      if (Array.isArray(items) && items.length > 0) {
        const statusMap = { active: '可用', used: '已使用', expired: '已过期' }
        setCoupons(items.map(c => ({
          id: c.id, type: c.coupon_type === 'urgent' ? 'urgent' : 'publish',
          name: c.name || c.coupon_type, count: c.quantity ?? 1,
          expireAt: c.expire_at ? c.expire_at.slice(0, 10) : '',
          status: statusMap[c.status] || c.status || '可用',
          _raw: c,
        })))
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleUse = async (coupon) => {
    if (!getToken()) { showToast('请先登录'); return }
    try {
      await api.coupons.use(coupon.type, 0)
      showToast(`已使用「${coupon.name}」`)
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: '已使用' } : c))
    } catch (err) { showToast(err?.message || '使用失败') }
  }

  const filtered = coupons.filter(c => c.status === tab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 0', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div onClick={closeSubPage} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18 }}>←</div>
          <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>我的卡券</div>
          <span onClick={() => openSubPage('shop')} style={{ fontSize: 12, color: 'var(--c-accent)', cursor: 'pointer' }}>去商店购买</span>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {['可用', '已使用', '已过期'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: tab === t ? 'var(--c-text)' : '#666',
              borderBottom: tab === t ? '3px solid var(--c-accent)' : '3px solid transparent',
            }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
            <div style={{ fontSize: 14 }}>暂无{tab}的卡券</div>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-light)', borderRadius: 14, padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            {c.type === 'urgent' ? (
              <img src="/cards/urgent-card.png" alt="急急卡" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${typeColors[c.type]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{typeIcons[c.type]}</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>数量 ×{c.count} · 有效期至 {c.expireAt}</div>
            </div>
            {c.status === '可用' ? (
              <button onClick={() => handleUse(c)} style={{ background: typeColors[c.type], color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>使用</button>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>{c.status}</span>
            )}
          </div>
        ))}
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
