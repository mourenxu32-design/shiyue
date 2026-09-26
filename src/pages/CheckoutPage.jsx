import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

/**
 * @module CheckoutPage
 * @description 探遇板块购物车结算页面
 *
 * 核心职责：
 * - 展示结算商品明细（数量、价格、小计）
 * - 收货地址选择 / 配送方式
 * - 支付方式选择（支付宝 / 微信支付 / 货到付款）
 * - 订单备注
 * - 费用明细（商品小计 + 配送费 + 满减优惠 = 实付）
 * - 提交订单（调用 orders.create + orders.pay）
 */

const DELIVERY_FEE = 3
const FREE_DELIVERY_THRESHOLD = 30

const paymentMethods = [
  { id: 'alipay', label: '支付宝', icon: '💳', desc: '推荐使用', color: '#1677FF' },
  { id: 'wechat', label: '微信支付', icon: '💬', desc: '', color: '#07C160' },
  { id: 'cod', label: '货到付款', icon: '💵', desc: '现金/扫码', color: '#F59E0B' },
]

const addressList = [
  { id: 1, name: '我', phone: '138****8888', address: '大学城·南门 3 号宿舍楼 508 室', tag: '学校', default: true },
  { id: 2, name: '我', phone: '138****8888', address: '大学城·北苑 2 栋 1203 室', tag: '家', default: false },
]

/* ====== SVG 图标 ====== */
const I = {
  back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  location: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
}

export default function CheckoutPage({ data }) {
  const { theme, closeSubPage, openSubPage } = useApp()
  const isDark = theme === 'dark'

  // 优先使用父层（ExplorePage）传入的购物车数据，否则使用 mock 兜底
  const initialItems = data?.items || [
    { id: 'p1', name: '招牌奶茶', price: 12, qty: 2, img: '🧋' },
    { id: 'p3', name: '芒果班戟', price: 18, qty: 1, img: '🥭' },
    { id: 'p9', name: '关东煮', price: 8, qty: 3, img: '🍢' },
  ]

  const [items, setItems] = useState(initialItems)
  const [addressId, setAddressId] = useState(addressList.find(a => a.default)?.id || addressList[0].id)
  const [payment, setPayment] = useState('alipay')
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const address = addressList.find(a => a.id === addressId)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const discount = subtotal >= 30 ? 5 : 0  // 满 30 减 5
  const total = Math.max(0, subtotal + deliveryFee - discount)
  const itemCount = items.reduce((s, i) => s + i.qty, 0)

  /* 修改商品数量 */
  const updateQty = (id, delta) => {
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      return next.filter(i => i.qty > 0)
    })
  }

  /* 提交订单 */
  const handleSubmit = async () => {
    if (items.length === 0) return
    if (!getToken()) { showToast('请先登录后再下单'); return }
    setSubmitting(true)
    try {
      // 构建后端所需的 items 格式
      const orderItems = items.map(i => ({
        product_id: i.product_id || null,
        product_name: i.name,
        unit_price: i.price,
        quantity: i.qty,
      }))
      const orderData = {
        merchant_id: data?.merchant_id || data?.shopId || 1,
        items: orderItems,
        delivery_fee: deliveryFee,
        discount: discount,
        pay_method: payment,
        address_id: addressId,
        address_snapshot: address.address,
        remark: remark || undefined,
      }
      // 创建订单
      const resp = await api.orders.create(orderData)
      const orderId = resp?.data?.id
      // 自动支付（非货到付款）
      if (orderId && payment !== 'cod') {
        await api.orders.pay(orderId, payment)
      }
      // 通知父层清空购物车
      if (data?.onClearCart) {
        try { data.onClearCart() } catch { /* 静默 */ }
      }
      showToast(`下单成功！共 ${itemCount} 件，实付 ¥${total.toFixed(2)}`)
      setTimeout(() => closeSubPage(), 1200)
    } catch (err) {
      showToast(err?.message || err?.detail || '下单失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  /* 主题色 */
  const T = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    sub2: isDark ? '#64748B' : '#94A3B8',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    input: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, position: 'relative' }}>
      {/* ===== 顶部导航 ===== */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '14px 16px',
        background: T.card, borderBottom: `1px solid ${T.border}`,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div onClick={closeSubPage} style={{ cursor: 'pointer', color: T.text, marginRight: 8, display: 'flex' }}>{I.back}</div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, flex: 1, margin: 0 }}>确认订单</h2>
      </div>

      {/* ===== 可滚动内容 ===== */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 100 }}>

        {/* 收货地址 */}
        <div style={{ background: T.card, margin: 12, borderRadius: 14, padding: '14px 16px', border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ color: '#2563EB', marginTop: 2 }}>{I.location}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{address.name}</span>
                <span style={{ fontSize: 13, color: T.sub }}>{address.phone}</span>
                <span style={{
                  fontSize: 10, padding: '1px 5px', borderRadius: 3,
                  background: 'rgba(37,99,235,0.1)', color: '#2563EB', fontWeight: 700,
                }}>{address.tag}</span>
              </div>
              <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>{address.address}</div>
            </div>
            <div style={{ color: T.sub2, display: 'flex', marginTop: 6 }}>{I.arrow}</div>
          </div>
        </div>

        {/* 商品清单 */}
        <div style={{ background: T.card, margin: '0 12px 12px', borderRadius: 14, padding: '6px 16px', border: `1px solid ${T.border}` }}>
          <div style={{ padding: '10px 0', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>商品清单</span>
            <span style={{ fontSize: 12, color: T.sub }}>共 {itemCount} 件</span>
          </div>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', gap: 12, borderBottom: `1px solid ${T.border}` }}>
              <div style={{
                width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                background: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>{item.img}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.name}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#EF4444', marginTop: 4 }}>¥{item.price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div onClick={() => updateQty(item.id, -1)} style={{
                  width: 26, height: 26, borderRadius: 13,
                  border: '1.5px solid #2563EB', color: '#2563EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>{I.minus}</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                <div onClick={() => updateQty(item.id, 1)} style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: '#2563EB', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                }}>{I.plus}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 订单备注 */}
        <div style={{ background: T.card, margin: '0 12px 12px', borderRadius: 14, padding: '14px 16px', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>订单备注（选填）</div>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="如：少放辣、放门口、打电话..."
            maxLength={100}
            style={{
              width: '100%', minHeight: 60, padding: 10, borderRadius: 10,
              background: T.input, border: `1px solid ${T.border}`, outline: 'none',
              color: T.text, fontSize: 13, resize: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: T.sub2, marginTop: 4 }}>{remark.length}/100</div>
        </div>

        {/* 支付方式 */}
        <div style={{ background: T.card, margin: '0 12px 12px', borderRadius: 14, padding: '14px 16px', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 10 }}>支付方式</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paymentMethods.map(m => {
              const active = payment === m.id
              return (
                <div key={m.id} onClick={() => setPayment(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 10, cursor: 'pointer',
                  background: active ? (isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.04)') : T.input,
                  border: active ? '1.5px solid #2563EB' : `1px solid ${T.border}`,
                  transition: 'all .2s',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${m.color}15`, color: m.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{m.label}</div>
                    {m.desc && <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{m.desc}</div>}
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: 10,
                    border: active ? 'none' : `1.5px solid ${T.sub2}`,
                    background: active ? '#2563EB' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}>{active && I.check}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 费用明细 */}
        <div style={{ background: T.card, margin: '0 12px 12px', borderRadius: 14, padding: '14px 16px', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 10 }}>费用明细</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: T.sub }}>商品小计</span>
              <span style={{ color: T.text, fontWeight: 600 }}>¥{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: T.sub }}>
                配送费
                {subtotal >= FREE_DELIVERY_THRESHOLD && <span style={{ color: '#10B981', fontSize: 11, marginLeft: 4 }}>已满{FREE_DELIVERY_THRESHOLD}免配送费</span>}
              </span>
              <span style={{ color: T.text, fontWeight: 600 }}>¥{deliveryFee.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#EF4444' }}>满减优惠</span>
                <span style={{ color: '#EF4444', fontWeight: 600 }}>-¥{discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>实付</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#EF4444' }}>¥{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ===== 底部提交栏 ===== */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: T.card, borderTop: `1px solid ${T.border}`,
        padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: isDark ? '0 -8px 24px rgba(0,0,0,0.3)' : '0 -8px 24px rgba(0,0,0,0.04)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.sub }}>共 {itemCount} 件 · 合计</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#EF4444', marginTop: 1 }}>
            ¥{total.toFixed(2)}
          </div>
        </div>
        <button
          disabled={submitting || items.length === 0}
          onClick={handleSubmit}
          style={{
            padding: '12px 28px', borderRadius: 22, border: 'none',
            background: items.length === 0 ? '#94A3B8' : '#2563EB',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: items.length === 0 ? 'none' : '0 6px 18px rgba(37,99,235,0.4)',
            opacity: submitting ? 0.7 : 1,
            transition: 'all .2s',
          }}
        >
          {submitting ? '提交中...' : items.length === 0 ? '购物车为空' : '提交订单'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 22px', borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: 'nowrap' }}>{toast}</div>
      )}
    </div>
  )
}
