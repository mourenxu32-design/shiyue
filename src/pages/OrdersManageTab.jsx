import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

const I = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  filter: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  map: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  bike: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>,
}

const orderStatuses = {
  '待确认': { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  '待配送': { color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  '配送中': { color: '#A855F7', bg: 'rgba(168,85,247,0.08)' },
  '已完成': { color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  '已取消': { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
  '退款中': { color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
}

const initialOrders = [
  { id: '20250620001', user: '小莎', phone: '13812345678', maskedPhone: '138****5678', items: [{ name: '招牌奶茶', qty: 2, price: 12 }, { name: '鸡肉卷饼', qty: 1, price: 15 }], total: 39, status: '待确认', time: '14:32', addr: '桂园3舍 207室', remark: '少冰，谢谢', deliveryFee: 0 },
  { id: '20250620002', user: '马哥', phone: '13912345678', maskedPhone: '139****1234', items: [{ name: '冰美式', qty: 3, price: 10 }], total: 30, status: '待确认', time: '14:15', addr: '梅园1舍 305室', remark: '', deliveryFee: 0 },
  { id: '20250620003', user: '花花', phone: '13712345678', maskedPhone: '137****8888', items: [{ name: '招牌奶茶', qty: 1, price: 12 }, { name: '芒果班戟', qty: 2, price: 18 }], total: 48, status: '待配送', time: '13:50', addr: '竹园5舍 102室', remark: '送到楼下', deliveryFee: 0 },
  { id: '20250620004', user: '豆子酱', phone: '13512345678', maskedPhone: '135****6666', items: [{ name: '鸡肉卷饼', qty: 2, price: 15 }], total: 30, status: '配送中', time: '13:20', addr: '桂园2舍 410室', remark: '', deliveryFee: 0 },
  { id: '20250620005', user: '研二学长', phone: '13312345678', maskedPhone: '133****2222', items: [{ name: '冰美式', qty: 2, price: 10 }, { name: '招牌奶茶', qty: 1, price: 12 }], total: 32, status: '已完成', time: '12:20', addr: '梅园3舍 208室', remark: '', deliveryFee: 0 },
  { id: '20250620006', user: '小明', phone: '13112345678', maskedPhone: '131****9999', items: [{ name: '芒果班戟', qty: 1, price: 18 }], total: 18, status: '退款中', time: '11:45', addr: '竹园1舍 101室', remark: '下错单了', deliveryFee: 0 },
]

export default function OrdersManageTab() {
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [filter, setFilter] = useState('全部')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [showDelivery, setShowDelivery] = useState(false)
  const [deliveryReward, setDeliveryReward] = useState(5)
  const [toast, setToast] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  // 加载订单列表
  useEffect(() => {
    let cancelled = false
    async function load() {
      setOrdersLoading(true)
      try {
        const resp = await api.merchants.myOrders()
        if (cancelled) return
        const items = resp?.data?.items || []
        setOrders(items.map(o => ({
          id: String(o.id || o.order_no),
          orderNo: o.order_no,
          user: o.user_nickname || '用户',
          phone: o.user_phone || '',
          maskedPhone: o.user_phone_masked || '',
          items: (o.items || []).map(i => ({ name: i.product_name, qty: i.quantity, price: Number(i.unit_price) })),
          total: Number(o.pay_amount || o.total_amount || 0),
          status: o.status_label || o.status || '待确认',
          time: o.created_at ? new Date(o.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
          addr: o.address_snapshot || '',
          remark: o.remark || '',
          deliveryFee: Number(o.delivery_fee || 0),
          _raw: o,
        })))
      } catch (err) {
        if (!cancelled) console.error('[OrdersManageTab] 加载订单失败:', err)
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const headerText = isDark ? '#F1F5F9' : '#0F172A'
  const headerSub = isDark ? '#94A3B8' : '#64748B'
  const cardBg = 'var(--c-card)'
  const border = 'var(--c-border)'

  const filters = ['全部', '待确认', '待配送', '配送中', '已完成', '退款中']
  const filtered = filter === '全部' ? orders : orders.filter(o => o.status === filter)

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const openDetail = (o) => { setSelectedOrder(o); setShowDetail(true) }

  const handleConfirm = async (o) => {
    setActionLoading(o.id)
    try {
      await api.orders.updateStatus(o._raw?.id || o.id, 'confirmed')
      updateStatus(o.id, '待配送')
      showToast('已确认接单')
      if (showDetail) setSelectedOrder(prev => ({ ...prev, status: '待配送' }))
    } catch (err) { showToast(err?.message || '确认失败') }
    finally { setActionLoading('') }
  }

  const handleDispatch = async (o) => {
    setActionLoading(o.id)
    try {
      await api.orders.updateStatus(o._raw?.id || o.id, 'delivering')
      updateStatus(o.id, '配送中')
      showToast('已发起配送')
      if (showDetail) setSelectedOrder(prev => ({ ...prev, status: '配送中' }))
    } catch (err) { showToast(err?.message || '配送失败') }
    finally { setActionLoading('') }
  }

  const handleComplete = async (o) => {
    setActionLoading(o.id)
    try {
      await api.orders.complete(o._raw?.id || o.id)
      updateStatus(o.id, '已完成')
      showToast('订单已完成')
      if (showDetail) setSelectedOrder(prev => ({ ...prev, status: '已完成' }))
    } catch (err) { showToast(err?.message || '完成失败') }
    finally { setActionLoading('') }
  }

  const handleCancel = async (o) => {
    setActionLoading(o.id)
    try {
      await api.orders.cancel(o._raw?.id || o.id, '商家取消')
      updateStatus(o.id, '已取消')
      showToast('订单已取消')
      if (showDetail) setSelectedOrder(prev => ({ ...prev, status: '已取消' }))
    } catch (err) { showToast(err?.message || '取消失败') }
    finally { setActionLoading('') }
  }

  const handleAgreeRefund = async () => {
    if (!selectedOrder) return
    setActionLoading(selectedOrder.id)
    try {
      await api.orders.updateStatus(selectedOrder._raw?.id || selectedOrder.id, 'refunded')
      updateStatus(selectedOrder.id, '已完成')
      setShowRefund(false)
      setSelectedOrder(prev => ({ ...prev, status: '已完成' }))
      showToast('退款已处理完成')
    } catch (err) { showToast(err?.message || '处理失败') }
    finally { setActionLoading('') }
  }

  const handleRejectRefund = async () => {
    if (!selectedOrder) return
    setActionLoading(selectedOrder.id)
    try {
      await api.orders.updateStatus(selectedOrder._raw?.id || selectedOrder.id, 'confirmed')
      setShowRefund(false)
      showToast('已拒绝退款申请')
    } catch (err) { showToast(err?.message || '操作失败') }
    finally { setActionLoading('') }
  }

  const handleCreateDeliveryTask = async () => {
    setShowDelivery(false)
    setActionLoading(selectedOrder?.id)
    try {
      await api.tasks.create({
        title: `配送任务 - 订单${selectedOrder?.id?.slice(-6)}`,
        description: `配送地址：${selectedOrder?.addr}`,
        category: 'delivery',
        amount: deliveryReward,
        board: 'campus',
      })
      showToast(`已发布配送任务，赏金 ¥${deliveryReward}`)
    } catch (err) { showToast(err?.message || '发布失败') }
    finally { setActionLoading('') }
  }

  const statusBadge = (status) => (
    <span style={{
      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
      background: orderStatuses[status].bg, color: orderStatuses[status].color,
    }}>{status}</span>
  )

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: cardBg, padding: '16px 16px 12px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: headerText }}>订单管理</span>
          <div style={{ display: 'flex', gap: 10, color: headerSub }}>
            <span style={{ cursor: 'pointer' }}>{I.search}</span>
            <span style={{ cursor: 'pointer' }}>{I.filter}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
              background: filter === f ? '#2563EB' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: filter === f ? '#fff' : headerSub,
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {ordersLoading && (
          <div style={{ textAlign: 'center', padding: 40, color: headerSub }}>加载中...</div>
        )}
        {!ordersLoading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: headerSub }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>暂无订单</div>
          </div>
        )}
        {filtered.map(o => (
          <div key={o.id} onClick={() => openDetail(o)} style={{
            background: cardBg, borderRadius: 16, padding: 14, marginBottom: 10,
            border: `1px solid var(--c-border-light)`, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: headerText }}>订单 {o.id.slice(-6)}</div>
                <div style={{ fontSize: 11, color: headerSub, marginTop: 2 }}>{o.time}</div>
              </div>
              {statusBadge(o.status)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ color: headerText, fontWeight: 700, fontSize: 14 }}>{o.user}</span>
              <span style={{ color: headerSub, fontSize: 12 }}>{o.maskedPhone}</span>
            </div>
            <div style={{ fontSize: 13, color: headerSub, marginBottom: 8 }}>
              {o.items.map(i => `${i.name}×${i.qty}`).join('，')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: headerSub, fontSize: 12 }}>{o.addr}</span>
              <span style={{ color: headerText, fontSize: 16, fontWeight: 800 }}>¥{o.total}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {o.status === '待确认' && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); handleConfirm(o) }} style={{ flex: 1, padding: 9, borderRadius: 10, border: 'none', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>确认接单</button>
                  <button onClick={(e) => { e.stopPropagation(); handleCancel(o) }} style={{ flex: 1, padding: 9, borderRadius: 10, border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`, background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>取消</button>
                </>
              )}
              {o.status === '待配送' && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); handleDispatch(o) }} style={{ flex: 1, padding: 9, borderRadius: 10, border: 'none', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>开始配送</button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setShowDelivery(true) }} style={{ flex: 1, padding: 9, borderRadius: 10, border: 'none', background: '#A855F7', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>发配送任务</button>
                </>
              )}
              {o.status === '配送中' && (
                <button onClick={(e) => { e.stopPropagation(); handleComplete(o) }} style={{ flex: 1, padding: 9, borderRadius: 10, border: 'none', background: '#22C55E', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>确认送达</button>
              )}
              {o.status === '退款中' && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setShowRefund(true) }} style={{ flex: 1, padding: 9, borderRadius: 10, border: 'none', background: '#22C55E', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>处理退款</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 订单详情弹窗 */}
      {showDetail && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowDetail(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '90%', maxWidth: 400, border: `1px solid ${border}`, maxHeight: '85%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>订单详情</span>
              <button onClick={() => setShowDetail(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: headerText }}>{selectedOrder.user} <span style={{ fontSize: 12, color: headerSub, fontWeight: 400 }}>{selectedOrder.maskedPhone}</span></div>
                <div style={{ fontSize: 12, color: headerSub, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>{I.map} {selectedOrder.addr}</div>
              </div>
              {statusBadge(selectedOrder.status)}
            </div>

            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              {selectedOrder.items.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: headerText }}>
                  <span>{i.name} × {i.qty}</span>
                  <span>¥{i.price * i.qty}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: headerText }}>
                <span>合计</span>
                <span>¥{selectedOrder.total}</span>
              </div>
            </div>

            {selectedOrder.remark && (
              <div style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', borderRadius: 10, padding: 10, marginBottom: 16, fontSize: 13, color: headerSub }}>
                备注：{selectedOrder.remark}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <a href={`tel:${selectedOrder.phone}`} style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', color: headerText, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{I.phone} 联系顾客</a>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectedOrder.status === '待确认' && (
                <>
                  <button onClick={() => handleConfirm(selectedOrder)} style={{ flex: 1, minWidth: '45%', padding: 10, borderRadius: 10, border: 'none', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>确认接单</button>
                  <button onClick={() => handleCancel(selectedOrder)} style={{ flex: 1, minWidth: '45%', padding: 10, borderRadius: 10, border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`, background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>取消订单</button>
                </>
              )}
              {selectedOrder.status === '待配送' && (
                <>
                  <button onClick={() => handleDispatch(selectedOrder)} style={{ flex: 1, minWidth: '45%', padding: 10, borderRadius: 10, border: 'none', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>开始配送</button>
                  <button onClick={() => setShowDelivery(true)} style={{ flex: 1, minWidth: '45%', padding: 10, borderRadius: 10, border: 'none', background: '#A855F7', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>发配送任务</button>
                </>
              )}
              {selectedOrder.status === '配送中' && (
                <button onClick={() => handleComplete(selectedOrder)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#22C55E', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>确认送达</button>
              )}
              {selectedOrder.status === '退款中' && (
                <button onClick={() => setShowRefund(true)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>处理退款</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 退款处理弹窗 */}
      {showRefund && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 210, backdropFilter: 'blur(6px)' }} onClick={() => setShowRefund(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '86%', maxWidth: 340, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 700, color: headerText, marginBottom: 8 }}>处理退款</div>
            <div style={{ fontSize: 13, color: headerSub, marginBottom: 14, lineHeight: 1.6 }}>
              订单金额 ¥{selectedOrder.total}，顾客原因：{selectedOrder.remark || '未说明'}
            </div>
            <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="处理备注（可选）" rows={3} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleRejectRefund} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: 'transparent', color: headerText, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>拒绝</button>
              <button onClick={handleAgreeRefund} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#22C55E', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>同意退款</button>
            </div>
          </div>
        </div>
      )}

      {/* 发配送任务弹窗 */}
      {showDelivery && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 210, backdropFilter: 'blur(6px)' }} onClick={() => setShowDelivery(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '86%', maxWidth: 340, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: '#A855F7' }}>{I.bike}</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>发布配送任务</span>
            </div>
            <div style={{ fontSize: 13, color: headerSub, marginBottom: 14, lineHeight: 1.6 }}>
              配送地址：{selectedOrder.addr}<br />
              配送赏金由平台骑手接单后完成配送。
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>配送赏金（元）</label>
              <input type="number" value={deliveryReward} onChange={e => setDeliveryReward(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleCreateDeliveryTask} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: '#A855F7', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>发布任务</button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 220 }}>{toast}</div>
      )}
    </div>
  )
}
