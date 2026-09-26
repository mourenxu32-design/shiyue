import { useState } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

const memberCards = [
  { id: 'month', name: '月卡', studentPrice: 12, price: 18, days: 30, color: '#4A90D9', desc: '适合短期体验', img: '/cards/month-card.png' },
  { id: 'season', name: '季卡', studentPrice: 26, price: 32, days: 90, color: '#9B59B6', desc: '稳定之选', img: '/cards/season-card.png' },
  { id: 'year', name: '年卡', studentPrice: 68, price: 88, days: 365, color: '#E67E22', desc: '超值推荐', hot: true, img: '/cards/year-card.png' },
]

const benefits = [
  { icon: '📌', text: '任务置顶曝光' },
  { icon: '⚡', text: '优先接单权益' },
  { icon: '🎯', text: '专属会员标识' },
  { icon: '🎁', text: '专属活动福利' },
]

const urgentCards = [
  { id: 5, name: '急急卡 × 2', desc: '任务标记闪电急单', price: 1 },
  { id: 6, name: '急急卡 × 6', desc: '3倍打包更划算', price: 3, original: 3 },
  { id: 7, name: '急急卡 × 20', desc: '量大从优', price: 8, original: 10 },
]

export default function ShopPage() {
  const { closeSubPage } = useApp()
  const [tab, setTab] = useState('member')
  const [selected, setSelected] = useState('year')
  const [isStudent, setIsStudent] = useState(true) // 是否学生认证
  const [buying, setBuying] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const handleBuyMember = async () => {
    if (!getToken()) { showToast('请先登录'); return }
    const card = memberCards.find(c => c.id === selected)
    if (!card) return
    setBuying(true)
    try {
      const price = isStudent ? card.studentPrice : card.price
      const resp = await api.orders.create({
        merchant_id: 0, items: [{ product_name: `会员卡-${card.name}`, unit_price: price, quantity: 1 }],
        pay_method: 'alipay', remark: `购买${card.name} ${card.days}天`,
      })
      const orderId = resp?.data?.id
      if (orderId) await api.orders.pay(orderId, 'alipay')
      showToast(`购买成功！${card.name}已激活`)
    } catch (err) { showToast(err?.message || '购买失败，请重试') }
    finally { setBuying(false) }
  }

  const handleBuyUrgent = async (card) => {
    if (!getToken()) { showToast('请先登录'); return }
    setBuying(true)
    try {
      const resp = await api.orders.create({
        merchant_id: 0, items: [{ product_name: card.name, unit_price: card.price, quantity: 1 }],
        pay_method: 'alipay', remark: `购买${card.name}`,
      })
      const orderId = resp?.data?.id
      if (orderId) await api.orders.pay(orderId, 'alipay')
      showToast(`购买成功！${card.name}已到账`)
    } catch (err) { showToast(err?.message || '购买失败，请重试') }
    finally { setBuying(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      {/* Nav */}
      <div style={{ flexShrink: 0, padding: '12px 16px 0', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div onClick={closeSubPage} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18 }}>←</div>
          <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>莳约商店</div>
          <span style={{ fontSize: 13, color: 'var(--c-text3)' }}>消费记录</span>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[{ id: 'member', label: '会员卡' }, { id: 'urgent', label: '急急卡' }].map(t => (
            <div key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                color: tab === t.id ? 'var(--c-text)' : 'var(--c-text3)',
                borderBottom: tab === t.id ? '3px solid var(--c-accent)' : '3px solid transparent',
              }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'member' && (
          <>
            {/* Member Cards */}
            <div style={{ padding: '16px 16px 8px' }}>
              {memberCards.map(card => {
                const showPrice = isStudent ? card.studentPrice : card.price
                const altPrice = isStudent ? card.price : card.studentPrice
                const perDay = (showPrice / card.days).toFixed(2)
                return (
                  <div key={card.id}
                    onClick={() => setSelected(card.id)}
                    style={{
                      background: selected === card.id ? '#1E2A3A' : 'var(--c-card)',
                      border: selected === card.id ? '2px solid var(--c-accent)' : '1px solid var(--c-border-light)',
                      borderRadius: 16, marginBottom: 12, cursor: 'pointer',
                      transition: 'all .2s', position: 'relative', overflow: 'hidden'
                    }}>
                    {card.hot && <div style={{ position: 'absolute', top: 0, right: 0, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: '0 16px 0 8px', zIndex: 2 }}>热门</div>}
                    {/* Card Image */}
                    <div style={{ width: '100%', height: 120, overflow: 'hidden', borderRadius: '16px 16px 0 0', position: 'relative' }}>
                      <img src={card.img} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }} />
                    </div>
                    {/* Info */}
                    <div style={{ padding: '12px 16px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text)' }}>{card.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>{card.desc} · 有效期 {card.days} 天</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: isStudent ? '#22C55E' : '#FFD700' }}>¥{showPrice}</div>
                          <div style={{ fontSize: 10, color: 'var(--c-text3)' }}>约 ¥{perDay}/天</div>
                        </div>
                      </div>
                      {isStudent && (
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 10, color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '2px 6px', borderRadius: 4 }}>学生省 ¥{card.price - card.studentPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Benefits */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>会员专属权益</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {benefits.map((b, i) => (
                  <div key={i} style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-light)', borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{b.icon}</span>
                    <span style={{ fontSize: 13 }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy Button */}
            <div style={{ padding: '0 16px 20px' }}>
              <button onClick={handleBuyMember} disabled={buying} style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff',
                fontSize: 16, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                opacity: buying ? 0.6 : 1,
              }}>
                立即购买 · ¥{(isStudent ? memberCards.find(c => c.id === selected)?.studentPrice : memberCards.find(c => c.id === selected)?.price)}
              </button>
              {buying && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-text3)', marginTop: 8 }}>处理中...</div>}
            </div>
          </>
        )}

        {tab === 'urgent' && (
          <div style={{ padding: 16 }}>
            {/* Urgent Card Image */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--c-border-light)' }}>
              <img src="/cards/urgent-card.png" alt="急急卡" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              <div style={{ background: 'var(--c-card)', padding: '12px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>急急卡</div>
                <div style={{ fontSize: 12, color: 'var(--c-text3)', lineHeight: 1.6 }}>使用后任务会显示"⚡急单"标识，接单者会优先看到并快速接单。</div>
              </div>
            </div>
            {urgentCards.map(card => (
              <div key={card.id} style={{
                background: 'var(--c-card)', border: '1px solid var(--c-border-light)', borderRadius: 14, padding: 16, marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{card.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 2 }}>{card.desc}</div>
                </div>
                <button onClick={() => handleBuyUrgent(card)} disabled={buying} style={{
                  background: '#EF4444', color: '#fff', border: 'none', borderRadius: 10,
                  padding: '8px 18px', fontSize: 14, fontWeight: 700, cursor: buying ? 'not-allowed' : 'pointer',
                  opacity: buying ? 0.6 : 1,
                }}>
                  ¥{card.price}
                  {card.original && <span style={{ fontSize: 10, textDecoration: 'line-through', marginLeft: 4, opacity: 0.7 }}>¥{card.original}</span>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
