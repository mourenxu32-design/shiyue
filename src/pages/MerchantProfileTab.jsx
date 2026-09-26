import { useState } from 'react'
import { useApp } from '../App'

const I = {
  me: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  store: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  box: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  rocket: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  wallet: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  help: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  message: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  swap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0-12l4 4m-4-4l-4 4"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

const menuGroups = [
  {
    title: '店铺管理',
    items: [
      { label: '店铺信息设置', desc: '名称、简介、营业时间', icon: I.store, color: '#2563EB', key: 'storeInfo' },
      { label: '商品管理', desc: '上架/下架/编辑商品', icon: I.box, color: '#22C55E', key: 'productManage' },
      { label: '评价管理', desc: '查看和回复顾客评价', icon: I.star, color: '#F59E0B', key: 'reviews' },
    ],
  },
  {
    title: '经营工具',
    items: [
      { label: '经营数据分析', desc: '查看详细数据报表', icon: I.chart, color: '#F59E0B', key: 'analytics' },
      { label: '配送任务管理', desc: '查看和管理配送任务', icon: I.rocket, color: '#06B6D4', key: 'delivery' },
      { label: '收入与提现', desc: '查看账单和提现', icon: I.wallet, color: '#EC4899', key: 'revenue' },
    ],
  },
  {
    title: '营销中心',
    items: [
      { label: '营销活动', desc: '满减、优惠券、免配送', icon: I.star, color: '#F59E0B', key: 'marketing' },
      { label: '消息通知', desc: '订单提醒、系统消息', icon: I.message, color: '#2563EB', key: 'messages' },
    ],
  },
  {
    title: '设置与帮助',
    items: [
      { label: '营业设置', desc: '营业状态、假日模式', icon: I.settings, color: '#64748B', key: 'businessSettings' },
      { label: '帮助与客服', desc: '常见问题、联系客服', icon: I.help, color: '#94A3B8', key: 'help' },
    ],
  },
]

const initialReviews = [
  { id: 1, user: '小莎', rating: 5, date: '06-20', content: '奶茶很好喝，送餐也很快，下次还会点！', reply: '' },
  { id: 2, user: '马哥', rating: 4, date: '06-19', content: '冰美式不错，就是今天稍微有点慢。', reply: '抱歉让您久等，我们会加快出餐速度。' },
  { id: 3, user: '花花', rating: 5, date: '06-18', content: '鸡肉卷饼超好吃，推荐！', reply: '' },
]

const initialMessages = [
  { id: 1, title: '新订单提醒', content: '您有一个新订单 20250620001 待确认', time: '14:32', read: false },
  { id: 2, title: '退款申请', content: '订单 20250620006 顾客申请退款', time: '11:45', read: false },
  { id: 3, title: '系统通知', content: '本周经营数据已生成，请查看经营报表', time: '09:00', read: true },
]

export default function MerchantProfileTab() {
  const { openSubPage, setActiveTab, theme, setUserRole } = useApp()
  const isDark = theme === 'dark'
  const [holidayMode, setHolidayMode] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showMarketing, setShowMarketing] = useState(false)
  const [reviews, setReviews] = useState(initialReviews)
  const [messages, setMessages] = useState(initialMessages)
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', timer: null })

  const showToast = (msg) => { 
      if (toast.show) {
        clearTimeout(toast.timer)
      }
      setToast({ show: true, message: msg, timer: setTimeout(() => setToast({ show: false, message: '' }), 2000) })
    }

  const headerText = isDark ? '#F1F5F9' : '#0F172A'
  const headerSub = isDark ? '#94A3B8' : '#64748B'
  const cardBg = 'var(--c-card)'
  const border = 'var(--c-border)'

  const handleMenuClick = (key) => {
    switch (key) {
      case 'productManage':
      case 'storeInfo':
        setActiveTab('m-store');
        break
      case 'revenue':
      case 'analytics':
        setActiveTab('m-revenue')
        break
      case 'reviews':
        setShowReviews(true)
        break
      case 'messages':
        setShowMessages(true)
        break
      case 'marketing':
        setShowMarketing(true)
        break
      case 'delivery':
        showToast('配送任务管理功能开发中')
        break
      case 'businessSettings':
        showToast('营业设置功能开发中')
        break
      case 'help':
        showToast('客服电话：400-888-8888')
        break
      default:
        showToast('功能开发中')
    }
  }

  const handleReply = (id) => {
    if (!replyText.trim()) return
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyText } : r))
    setReplyText('')
    setReplyingTo(null)
    showToast('回复已提交')
  }

  const markRead = (id) => { setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m)) }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: cardBg, padding: 16, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: headerText }}>我的</span>
            <button onClick={() => setUserRole('user')} style={{
              padding: '6px 14px', borderRadius: 8,
              border: `1px solid ${isDark ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.2)'}`,
              background: isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.06)',
              color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>{I.swap} 切换用户模式</button>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: isDark ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB',
            }}>{I.me}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: headerText }}>莳约奶茶铺</div>
              <div style={{ fontSize: 12, color: headerSub, marginTop: 3 }}>商家账号 · 已认证</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: headerSub }}>评分 4.8</span>
                <span style={{ fontSize: 11, color: headerSub }}>月售 524</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', borderRadius: 16, padding: 18,
            margin: '12px 0', display: 'flex', justifyContent: 'space-between', color: '#fff',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>4.8</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>店铺评分</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>96%</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>好评率</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>12</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>待处理</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>¥1,391</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>本周收入</div>
            </div>
          </div>

          <div style={{ background: cardBg, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>{I.message}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: headerText }}>消息通知</div>
                  <div style={{ fontSize: 12, color: headerSub, marginTop: 2 }}>{unreadCount > 0 ? `您有 ${unreadCount} 条未读消息` : '暂无新消息'}</div>
                </div>
              </div>
              <button onClick={() => setShowMessages(true)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>查看</button>
            </div>
          </div>

          {menuGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: headerSub, marginBottom: 8, letterSpacing: 0.5 }}>{group.title}</div>
              <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
                {group.items.map((item, idx) => (
                  <div key={item.label} onClick={() => handleMenuClick(item.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                    borderBottom: idx < group.items.length - 1 ? `1px solid var(--c-border-light)` : 'none', cursor: 'pointer',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: headerText }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: headerSub, marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <span style={{ color: headerSub, fontSize: 18 }}>›</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ background: cardBg, borderRadius: 16, padding: 14, marginBottom: 16, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>{I.settings}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: headerText }}>假日模式</div>
                  <div style={{ fontSize: 12, color: headerSub, marginTop: 2 }}>{holidayMode ? '已开启，暂停接收新订单' : '已关闭，正常营业'}</div>
                </div>
              </div>
              <button onClick={() => setHolidayMode(!holidayMode)} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: holidayMode ? '#EF4444' : '#94A3B8', position: 'relative',
              }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: holidayMode ? 22 : 2, transition: 'left .2s' }} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--c-text3)', textAlign: 'center', marginBottom: 24 }}>莳约商家版 v1.0.0</div>
        </div>
      </div>

      {/* 评价管理弹窗 */}
      {showReviews && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowReviews(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '90%', maxWidth: 400, border: `1px solid ${border}`, maxHeight: '80%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>评价管理</span>
              <button onClick={() => setShowReviews(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: headerText }}>4.8</div>
                <div style={{ fontSize: 11, color: headerSub }}>综合评分</div>
              </div>
              <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: headerText }}>96%</div>
                <div style={{ fontSize: 11, color: headerSub }}>好评率</div>
              </div>
            </div>
            {reviews.map(r => (
              <div key={r.id} style={{ borderBottom: `1px solid ${border}`, padding: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: headerText }}>{r.user}</span>
                  <span style={{ fontSize: 11, color: headerSub }}>{r.date}</span>
                </div>
                <div style={{ color: '#F59E0B', marginBottom: 6 }}>{Array(r.rating).fill(I.star)}</div>
                <div style={{ fontSize: 13, color: headerSub, lineHeight: 1.5 }}>{r.content}</div>
                {r.reply && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.06)', fontSize: 12, color: headerSub }}>商家回复：{r.reply}</div>}
                {!r.reply && (
                  <div style={{ marginTop: 10 }}>
                    {replyingTo === r.id ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="回复评价..." style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText }} />
                        <button onClick={() => handleReply(r.id)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontSize: 12, cursor: 'pointer' }}>回复</button>
                      </div>
                    ) : (
                      <button onClick={() => setReplyingTo(r.id)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', color: headerSub, fontSize: 12, cursor: 'pointer' }}>回复评价</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 消息通知弹窗 */}
      {showMessages && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowMessages(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '90%', maxWidth: 380, border: `1px solid ${border}`, maxHeight: '80%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>消息通知</span>
              <button onClick={() => setShowMessages(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            {messages.map(m => (
              <div key={m.id} onClick={() => markRead(m.id)} style={{
                borderBottom: `1px solid ${border}`, padding: '14px 0', cursor: 'pointer', opacity: m.read ? 0.8 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {!m.read && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#EF4444' }} />}
                    <span style={{ fontSize: 14, fontWeight: 700, color: headerText }}>{m.title}</span>
                  </div>
                  <span style={{ fontSize: 11, color: headerSub }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 13, color: headerSub }}>{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 营销活动弹窗 */}
      {showMarketing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowMarketing(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '90%', maxWidth: 380, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>营销中心</span>
              <button onClick={() => setShowMarketing(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ t: '满减活动', d: '满20减2，满30减5', c: '#F59E0B' }, { t: '新客立减', d: '首单立减3元', c: '#2563EB' }, { t: '满额免配送', d: '满30免配送费', c: '#22C55E' }, { t: '店铺优惠券', d: '5元无门槛券', c: '#EC4899' }].map(item => (
                <div key={item.t} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: headerText, marginBottom: 4 }}>{item.t}</div>
                  <div style={{ fontSize: 11, color: headerSub, marginBottom: 8 }}>{item.d}</div>
                  <button onClick={() => showToast(`${item.t}设置已打开`)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: item.c, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>去设置</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300 }}>{toast.message}</div>
      )}
    </div>
  )
}
