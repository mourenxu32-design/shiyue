import { useState } from 'react'
import api, { getToken } from '../utils/api'

export default function MemberPage({ onBack }) {
  const [selected, setSelected] = useState('quarter')
  const [payMethod, setPayMethod] = useState('wechat')
  const [buying, setBuying] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const handleBuy = async () => {
    if (!getToken()) { showToast('请先登录'); return }
    const plan = plans.find(p => p.id === selected)
    if (!plan) return
    setBuying(true)
    try {
      const resp = await api.orders.create({
        merchant_id: 0, items: [{ product_name: `会员-${plan.name}`, unit_price: plan.price, quantity: 1 }],
        pay_method: payMethod, remark: `开通${plan.name}`,
      })
      const orderId = resp?.data?.id
      if (orderId) await api.orders.pay(orderId, payMethod)
      showToast(`${plan.name}开通成功！`)
    } catch (err) { showToast(err?.message || '开通失败，请重试') }
    finally { setBuying(false) }
  }

  const plans = [
    { id: 'month', name: '月卡', price: 12, daily: 0.4, desc: '灵活体验', img: '/cards/month-card.png' },
    { id: 'quarter', name: '季卡', price: 25, daily: 0.28, desc: '稳定之选', img: '/cards/season-card.png' },
    { id: 'year', name: '年卡', price: 68, daily: 0.19, desc: '最划算', hot: true, best: true, img: '/cards/year-card.png' },
  ]

  const accent = '#2563EB'

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, color: 'var(--c-text)' }}>会员中心</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)}
              style={{
                borderRadius: 16, padding: '0 0 14px', textAlign: 'center', cursor: 'pointer', position: 'relative',
                background: plan.best ? 'linear-gradient(135deg, #1E293B, #334155)' : 'var(--c-card)',
                border: selected === plan.id ? `2px solid ${accent}` : '1px solid var(--c-border)',
                color: plan.best ? 'white' : 'var(--c-text)',
                transition: 'all .2s', overflow: 'hidden',
                boxShadow: selected === plan.id ? `0 0 16px ${accent}22` : 'none',
              }}>
              {plan.hot && <span style={{ position: 'absolute', top: 0, right: 0, background: '#EF4444', color: 'white', fontSize: 9, padding: '2px 8px', borderRadius: '0 14px 0 8px', fontWeight: 700, zIndex: 2 }}>热门</span>}
              <div style={{ width: '100%', height: 70, overflow: 'hidden' }}>
                <img src={plan.img} alt={plan.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '8px 12px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: plan.best ? '#F59E0B' : 'var(--c-text2)' }}>{plan.name}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: plan.best ? 'white' : 'var(--c-text)' }}>¥{plan.price}</div>
                <div style={{ fontSize: 10, color: plan.best ? 'rgba(255,255,255,0.5)' : 'var(--c-text3)', marginTop: 2 }}>¥{plan.daily}/天</div>
                <div style={{ fontSize: 10, marginTop: 4, color: plan.best ? 'rgba(255,255,255,0.6)' : 'var(--c-text2)' }}>{plan.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="card" style={{ margin: '0 0 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--c-text)' }}>会员权益</div>
          {[
            { icon: '⚡', label: '每月赠送急急卡×3', desc: '会员每月自动获得3张急急卡' },
            { icon: '🔝', label: '任务置顶曝光', desc: '发布任务获得优先展示' },
            { icon: '🎯', label: '优先接单权益', desc: '接单次数大幅提升' },
            { icon: '🏷️', label: '专属会员标识', desc: '会员皇冠标识彰显身份' },
            { icon: '🎁', label: '专属活动福利', desc: '不定期会员专属活动' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', padding: '10px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--c-border)' : 'none'
            }}>
              <span style={{ fontSize: 18, width: 30, textAlign: 'center' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>{item.desc}</div>
              </div>
              <span style={{ fontSize: 11, color: accent, fontWeight: 700 }}>✓</span>
            </div>
          ))}
        </div>

        {/* 接单权益对比表 */}
        <div className="card" style={{ margin: '0 0 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--c-text)' }}>接单权益对比</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: 'var(--c-text3)', fontWeight: 500 }}>权益</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--c-text3)', fontWeight: 500 }}>免费</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--c-text3)', fontWeight: 500 }}>月卡</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--c-text3)', fontWeight: 500 }}>季卡</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', color: '#F59E0B', fontWeight: 700 }}>年卡</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { board: '校园兼职', free: '3单/天', month: '10单/天', quarter: '18单/天', year: '不限' },
                  { board: 'Cosplay', free: '3单/天\n(≤60元)', month: '10单/天\n(无限额)', quarter: '18单/天\n(无限额)', year: '不限\n(无限额)' },
                  { board: '兼工阁', free: '3单/天\n(≤100元)', month: '10单/天\n(无限额)', quarter: '18单/天\n(无限额)', year: '不限\n(无限额)' },
                ].map((row, i) => (
                  <tr key={row.board} style={{ borderBottom: i < 2 ? '1px solid var(--c-border)' : 'none' }}>
                    <td style={{ padding: '10px 6px', fontWeight: 600, color: 'var(--c-text)', whiteSpace: 'nowrap' }}>{row.board}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: 'var(--c-text3)', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{row.free}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: 'var(--c-text2)', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{row.month}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: 'var(--c-text2)', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{row.quarter}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#F59E0B', fontWeight: 700, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{row.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="card" style={{ margin: '0 0 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--c-text)' }}>常见问题</div>
          {[
            { q: '急急卡用完了怎么办？', a: '可以在商城单独购买，会员价格更优惠' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text)' }}>{item.q}</div>
              <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 2 }}>{item.a}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Payment */}
      <div style={{ background: 'var(--c-nav)', padding: '16px 16px calc(16px + var(--safe-bottom))', borderTop: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {[
            { id: 'wechat', icon: '💚', name: '微信支付' },
            { id: 'alipay', icon: '💙', name: '支付宝' },
          ].map(m => (
            <div key={m.id} onClick={() => setPayMethod(m.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px',
                borderRadius: 12, cursor: 'pointer',
                background: payMethod === m.id ? `${accent}10` : 'var(--c-input)',
                border: payMethod === m.id ? `1.5px solid ${accent}` : '1px solid var(--c-border-light)',
              }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <span style={{ fontSize: 13, flex: 1, color: 'var(--c-text)' }}>{m.name}</span>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                border: `2px solid ${payMethod === m.id ? accent : '#666'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {payMethod === m.id && <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />}
              </span>
            </div>
          ))}
        </div>
        <button onClick={handleBuy} disabled={buying} style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: `linear-gradient(135deg, ${accent}, #1D4ED8)`,
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer',
          boxShadow: `0 4px 16px ${accent}44`,
          opacity: buying ? 0.6 : 1,
        }}>
          {buying ? '处理中...' : `立即开通 · ¥${plans.find(p => p.id === selected)?.price}`}
        </button>
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
