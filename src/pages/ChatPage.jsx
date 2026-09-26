import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

export default function ChatPage({ data, onBack }) {
  const { openSubPage } = useApp()
  const task = data || { title: '菜鸟驿站取快递', amount: 8, user: '小明同学' }
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', text: '你好，请问快递现在可以取了吗？', time: '14:20', status: 'read' },
    { id: 2, sender: 'self', text: '可以的，取件码我私信给你', time: '14:21', status: 'read' },
    { id: 3, sender: 'other', text: '好的，我大概半小时到', time: '14:22', status: 'read' },
    { id: 4, sender: 'other', text: '丰巢柜在哪个门？', time: '14:22', status: 'read' },
    { id: 5, sender: 'self', text: '西门进来左手边第一个柜子', time: '14:25', status: 'delivered' },
    { id: 6, sender: 'other', text: '收到，谢谢！', time: '14:26', status: 'read' },
    { id: 7, sender: 'self', text: '不客气，到了联系我', time: '14:27', status: 'read' },
  ])
  const [showQuick, setShowQuick] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const [showCall, setShowCall] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [callSeconds, setCallSeconds] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDND, setIsDND] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [toast, setToast] = useState('')
  const [isCallVisible, setIsCallVisible] = useState(true) // 通话状态

  useEffect(() => {
    if (!showCall) { setCallSeconds(0); return }
    
    // 监听页面可见性变化（节省电量）
    const handleVisibilityChange = () => setIsCallVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    const t = setInterval(() => {
      if (isCallVisible && !document.hidden) {
        setCallSeconds(s => s + 1)
      }
    }, showCall ? 1000 : 60000) // 通话中每秒更新，隐藏时每分钟更新
    
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [showCall, isCallVisible])

  const formatCallTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const quickPhrases = ['取件码已发送', '我正在路上', '任务已完成', '需要延迟一下', '请确认收货', '好的没问题']

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    const tempId = Date.now()
    setMessages([...messages, { id: tempId, sender: 'self', text, time, status: 'sending' }])
    setInput('')
    setShowQuick(false)
    // 通过 API 发送消息
    if (getToken() && task?.user_id) {
      try {
        await api.messages.send({ receiver_id: task.user_id, content: text })
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'delivered' } : m))
      } catch (err) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m))
        showToast('发送失败: ' + (err?.message || ''))
      }
    }
  }

  // 拍照区域：相机 + 最近照片
  const recentPhotos = [
    { type: 'camera', label: '拍照' },
    { type: 'photo', src: 'https://picsum.photos/seed/a1/80/80' },
    { type: 'photo', src: 'https://picsum.photos/seed/b2/80/80' },
    { type: 'photo', src: 'https://picsum.photos/seed/c3/80/80' },
  ]

  // 猫咪表情包精灵图配置（10×10网格，每个贴纸用 row/col 定位）
  const stickerSheet = '/stickers/cat-stickers.png'
  const stickerCols = 10, stickerRows = 10
  const stickers = [
    // Row 0: 眨眼笑、大笑、露齿笑、惊讶吐舌、眨眼闪光、眯眼笑、张嘴笑、拉伸笑、吐舌眨眼、心形眼
    {r:0,c:0},{r:0,c:1},{r:0,c:2},{r:0,c:3},{r:0,c:4},{r:0,c:5},{r:0,c:6},{r:0,c:7},{r:0,c:8},{r:0,c:9},
    // Row 1: 单眼眨、墨镜、思考、圆睁、舔嘴、抿嘴、哭泣、睡觉、猫耳、狗脸
    {r:1,c:0},{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:1,c:5},{r:1,c:6},{r:1,c:7},{r:1,c:8},{r:1,c:9},
    // Row 2: 撇嘴手捧、冷酷、绷带、吐舌爱心、黑猫、闪亮眼、红心微笑、捂嘴笑、小花、谢啦
    {r:2,c:0},{r:2,c:1},{r:2,c:2},{r:2,c:3},{r:2,c:4},{r:2,c:5},{r:2,c:6},{r:2,c:7},{r:2,c:8},{r:2,c:9},
    // Row 3: 露齿狂笑、手舞足蹈、鼓掌、夸张笑、月牙眼、亲吻、爱心、红心眼、星星、尾巴
    {r:3,c:0},{r:3,c:1},{r:3,c:2},{r:3,c:3},{r:3,c:4},{r:3,c:5},{r:3,c:6},{r:3,c:7},{r:3,c:8},{r:3,c:9},
    // Row 4: 眨眼吐舌、歪头、墨镜叉手、搓手害羞、O型嘴、生气、红头巾、小爱心、小星星、胶带封嘴
    {r:4,c:0},{r:4,c:1},{r:4,c:2},{r:4,c:3},{r:4,c:4},{r:4,c:5},{r:4,c:6},{r:4,c:7},{r:4,c:8},{r:4,c:9},
    // Row 5: 托下巴、圆眼红心、小眼镜、撇嘴、大哭、太阳、惊恐、捂嘴惊讶、捂脸惊恐、闪电惊吓
    {r:5,c:0},{r:5,c:1},{r:5,c:2},{r:5,c:3},{r:5,c:4},{r:5,c:5},{r:5,c:6},{r:5,c:7},{r:5,c:8},{r:5,c:9},
    // Row 6: 惊讶捂嘴、夸张捂脸、慵懒、困意
    {r:6,c:0},{r:6,c:1},{r:6,c:2},{r:6,c:3},
    // Row 7: 骷髅头
    {r:7,c:0},
    // Row 8: 红帽愤怒、耳机听歌、自信眨眼、弹钢琴、笑脸星、笑脸心、GET、LGTM、THANKS、眼镜眨
    {r:8,c:0},{r:8,c:1},{r:8,c:2},{r:8,c:3},{r:8,c:4},{r:8,c:5},{r:8,c:6},{r:8,c:7},{r:8,c:8},{r:8,c:9},
  ]

  const statusLabel = { sending: '发送中...', delivered: '已送达', read: '已读' }

  return (
    <div onClick={() => showMore && setShowMore(false)} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)', position: 'relative' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--c-text)' }}>{task.user}</div>
          <div style={{ fontSize: 11, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            在线
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div onClick={() => setShowCall(true)} style={{ width: 36, height: 36, borderRadius: 10, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div onClick={() => setShowMore(!showMore)} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--c-text2)">
              <circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
            </svg>
            {showMore && (
              <div onClick={e => e.stopPropagation()} style={{
                position: 'absolute', top: 44, right: 0, width: 180,
                background: 'var(--c-card)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 50, overflow: 'hidden', padding: '6px 0',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              }}>
                {[
                  { label: '查看主页', color: 'var(--c-text)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>, action: () => { setShowMore(false); openSubPage('user-profile', { name: task.user }) } },
                  { label: '搜索聊天记录', color: 'var(--c-text)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, action: () => { setShowMore(false); setShowSearch(true); setSearchQuery('') } },
                  { label: isDND ? '取消免打扰' : '消息免打扰', color: 'var(--c-text)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>{!isDND && <line x1="1" y1="1" x2="23" y2="23"/>}</svg>, action: () => { setShowMore(false); setIsDND(!isDND); showToast(isDND ? '已取消消息免打扰' : '已开启消息免打扰') } },
                  { divider: true },
                  { label: '清空聊天记录', color: 'var(--c-text)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>, action: () => { setMessages([]); setShowMore(false); showToast('聊天记录已清空') } },
                  { label: '举报', color: '#EF4444', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>, action: () => { setShowMore(false); setShowReport(true) } },
                  { label: '屏蔽此用户', color: '#EF4444', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>, action: () => { setShowMore(false); setShowBlock(true) } },
                ].map((item, i) =>
                  item.divider ? (
                    <div key={i} style={{ height: 1, background: 'var(--c-border)', margin: '4px 12px' }} />
                  ) : (
                    <div key={item.label} onClick={item.action}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                        cursor: 'pointer', transition: 'background .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: item.color === '#EF4444' ? 'rgba(239,68,68,0.1)' : 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: item.color, letterSpacing: 0.3 }}>{item.label}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Card */}
      <div style={{ margin: '8px 16px', padding: '10px 14px', borderRadius: 12, background: 'var(--c-card)', border: '1px solid var(--c-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="tag tag-green" style={{ fontSize: 10 }}>进行中</span>
          <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>悬赏 ¥{task.amount}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--c-primary)', cursor: 'pointer' }}>查看详情 ›</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{task.title}</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 16px' }}>
        {/* Time separator */}
        <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
          <span style={{ fontSize: 10, color: 'var(--c-text3)', background: 'var(--c-input)', padding: '2px 10px', borderRadius: 8 }}>今天 14:20</span>
        </div>

        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex', justifyContent: msg.sender === 'self' ? 'flex-end' : 'flex-start',
            marginBottom: 10,
          }}>
            <div style={{ maxWidth: '75%' }}>
              <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
              <div style={{ fontSize: 10, color: 'var(--c-text3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, justifyContent: msg.sender === 'self' ? 'flex-end' : 'flex-start' }}>
                <span>{msg.time}</span>
                {msg.sender === 'self' && (
                  <span style={{
                    color: msg.status === 'read' ? '#22C55E' : 'var(--c-text3)',
                    fontSize: 9
                  }}>{statusLabel[msg.status]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部整体区域 - 输入栏在上，工具栏在下，展开时输入栏上移 */}
      <div style={{ flexShrink: 0 }}>
        {/* Input Bar - 始终在最上方 */}
        <div style={{
          background: 'var(--c-nav)',
          padding: '10px 16px',
          borderTop: '1px solid var(--c-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div onClick={() => { setShowQuick(!showQuick); setShowToolbar(false) }}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: showQuick ? 'var(--c-primary)' : 'var(--c-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, transition: 'all .2s'
              }}>
              <span style={{ fontSize: 14, color: showQuick ? '#fff' : 'var(--c-text3)' }}>⚡</span>
            </div>
            <div onClick={() => { setShowToolbar(!showToolbar); setShowQuick(false) }}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: showToolbar ? 'var(--c-primary)' : 'var(--c-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, transition: 'all .2s'
              }}>
              <span style={{ fontSize: 16, color: showToolbar ? '#fff' : 'var(--c-text3)', fontWeight: 700 }}>+</span>
            </div>
            <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
              placeholder="输入消息..." style={{ borderRadius: 20, padding: '8px 16px', fontSize: 14, flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)} />
            <div onClick={() => sendMessage(input)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: input.trim() ? 'var(--c-primary)' : 'var(--c-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                flexShrink: 0, transition: 'all .2s'
              }}>
              <span style={{ fontSize: 14, color: input.trim() ? '#fff' : 'var(--c-text3)', transform: 'rotate(-45deg)', display: 'block' }}>➤</span>
            </div>
          </div>
        </div>

        {/* Quick Phrases - 在输入栏下方 */}
        <div style={{
          maxHeight: showQuick ? 120 : 0,
          opacity: showQuick ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.2s ease',
        }}>
          <div style={{ padding: '10px 16px', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--c-text3)', fontWeight: 600 }}>快捷短语</span>
              <span onClick={() => setShowQuick(false)} style={{ fontSize: 11, color: 'var(--c-text3)', cursor: 'pointer' }}>收起</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {quickPhrases.map(p => (
                <div key={p} onClick={() => sendMessage(p)}
                  style={{
                    padding: '6px 14px', borderRadius: 16,
                    background: 'var(--c-input)', border: '1px solid var(--c-border-light)',
                    fontSize: 12, color: 'var(--c-text2)', cursor: 'pointer',
                  }}>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar Panel - 在输入栏下方展开 */}
        <div style={{
          maxHeight: showToolbar ? 400 : 0,
          opacity: showToolbar ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
        }}>
          <div style={{ background: 'var(--c-nav)', padding: '12px 16px 16px', borderBottom: '1px solid var(--c-border)' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>拍照</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {recentPhotos.map((item, idx) => (
                  item.type === 'camera' ? (
                    <div key={idx} onClick={() => showToast('拍照功能需要在原生 App 中使用')}
                      style={{
                        width: 64, height: 64, borderRadius: 12, flexShrink: 0,
                        background: 'var(--c-input)',
                        border: '2px dashed var(--c-primary)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', gap: 4
                      }}>
                      <span style={{ fontSize: 20 }}>📷</span>
                      <span style={{ fontSize: 9, color: 'var(--c-primary)' }}>拍照</span>
                    </div>
                  ) : (
                    <div key={idx} onClick={() => showToast('图片发送功能需要在原生 App 中使用')}
                      style={{
                        width: 64, height: 64, borderRadius: 12, flexShrink: 0,
                        overflow: 'hidden', cursor: 'pointer',
                        border: '1px solid var(--c-border-light)'
                      }}>
                      <img src={item.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>表情包</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                {stickers.map((s, idx) => {
                  const bx = s.c * (100 / (stickerCols - 1))
                  const by = s.r * (100 / (stickerRows - 1))
                  return (
                    <div key={idx} onClick={() => sendMessage('[表情]')}
                      style={{
                        aspectRatio: '1', borderRadius: 8,
                        backgroundImage: `url(${stickerSheet})`,
                        backgroundSize: `${stickerCols * 100}% ${stickerRows * 100}%`,
                        backgroundPosition: `${bx.toFixed(2)}% ${by.toFixed(2)}%`,
                        backgroundRepeat: 'no-repeat',
                        cursor: 'pointer',
                        transition: 'transform .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 通话弹窗 */}
      {showCall && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            width: 260, borderRadius: 20, padding: '28px 24px 20px',
            background: 'var(--c-card)', border: '1px solid var(--c-border)',
            textAlign: 'center',
            animation: 'fadeIn .2s ease',
          }}>
            {/* 头像 */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#22C55E20', border: '2px solid #22C55E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px', fontSize: 22,
            }}>
              {task.user?.charAt(0) || 'U'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>{task.user}</div>
            <div style={{ fontSize: 12, color: '#22C55E', marginBottom: 16 }}>通话中</div>
            {/* 计时器 */}
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--c-text)', fontVariantNumeric: 'tabular-nums', marginBottom: 24, letterSpacing: 2 }}>
              {formatCallTime(callSeconds)}
            </div>
            {/* 操作按钮 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
              {/* 禁用麦克风 */}
              <div onClick={() => setIsMuted(!isMuted)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: isMuted ? '#EF4444' : 'var(--c-input)',
                  border: isMuted ? '2px solid #EF4444' : '1px solid var(--c-border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 6px',
                  transition: 'all .2s',
                  boxShadow: isMuted ? '0 0 12px #EF444440' : 'none',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isMuted ? '#fff' : 'var(--c-text3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                    {isMuted && <line x1="2" y1="2" x2="22" y2="22" stroke="#fff" strokeWidth="2.5"/>}
                  </svg>
                </div>
                <div style={{ fontSize: 10, color: isMuted ? '#EF4444' : 'var(--c-text3)', fontWeight: isMuted ? 600 : 400 }}>
                  {isMuted ? '已静音' : '麦克风'}
                </div>
              </div>
              {/* 挂断 */}
              <div onClick={() => { setShowCall(false); setIsMuted(false); setIsSpeaker(false) }} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#EF4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 6px',
                  boxShadow: '0 4px 16px #EF444460',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                </div>
                <div style={{ fontSize: 10, color: 'var(--c-text3)' }}>挂断</div>
              </div>
              {/* 免提 */}
              <div onClick={() => setIsSpeaker(!isSpeaker)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: isSpeaker ? '#22C55E' : 'var(--c-input)',
                  border: isSpeaker ? '2px solid #22C55E' : '1px solid var(--c-border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 6px',
                  transition: 'all .2s',
                  boxShadow: isSpeaker ? '0 0 12px #22C55E40' : 'none',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isSpeaker ? '#fff' : 'var(--c-text3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    {isSpeaker ? (
                      <>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      </>
                    ) : (
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    )}
                  </svg>
                </div>
                <div style={{ fontSize: 10, color: isSpeaker ? '#22C55E' : 'var(--c-text3)', fontWeight: isSpeaker ? 600 : 400 }}>
                  {isSpeaker ? '免提中' : '免提'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 搜索聊天记录浮层 */}
      {showSearch && (
        <div style={{
          position: 'absolute', top: 72, left: 16, right: 16, zIndex: 60,
          background: 'var(--c-card)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索聊天内容..." className="form-input"
              style={{ flex: 1, borderRadius: 10, padding: '8px 12px', fontSize: 13, background: 'var(--c-input)' }} />
            <div onClick={() => { setShowSearch(false); setSearchQuery('') }}
              style={{ cursor: 'pointer', fontSize: 12, color: 'var(--c-text3)', fontWeight: 600, whiteSpace: 'nowrap' }}>关闭</div>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {searchQuery.trim() ? (
              messages.filter(m => m.text.includes(searchQuery.trim())).length > 0 ? (
                messages.filter(m => m.text.includes(searchQuery.trim())).map(m => (
                  <div key={m.id} style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 4, background: 'var(--c-input)', fontSize: 12 }}>
                    <span style={{ color: 'var(--c-text3)', marginRight: 8 }}>{m.time}</span>
                    <span style={{ color: 'var(--c-text)' }}>{m.text.split(searchQuery.trim()).map((part, idx, arr) => (
                      <>{part}{idx < arr.length - 1 && <mark style={{ background: '#F59E0B40', color: '#F59E0B', borderRadius: 2, padding: '0 1px' }}>{searchQuery.trim()}</mark>}</>
                    ))}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--c-text3)', fontSize: 12 }}>未找到匹配的消息</div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--c-text3)', fontSize: 12 }}>输入关键词搜索聊天记录</div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 20px',
          borderRadius: 20, fontSize: 12, fontWeight: 500, zIndex: 200,
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          animation: 'fadeIn .2s ease', whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}

      {/* 举报弹窗 */}
      {showReport && (
        <div onClick={() => setShowReport(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 280, borderRadius: 20, padding: '24px 20px 16px',
            background: 'var(--c-card)', border: '1px solid var(--c-border)',
            animation: 'fadeIn .2s ease',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>举报用户</div>
            <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 16 }}>请选择举报原因：</div>
            {['发布违规信息', '骚扰/辱骂他人', '虚假交易/欺诈', '冒充他人身份', '其他违规行为'].map((reason, i) => (
              <div key={i} onClick={() => { setShowReport(false); showToast('举报已提交，我们会尽快处理') }}
                style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 6,
                  background: 'var(--c-input)', cursor: 'pointer', fontSize: 13,
                  color: 'var(--c-text)', transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--c-input)'}
              >{reason}</div>
            ))}
            <div onClick={() => setShowReport(false)}
              style={{ textAlign: 'center', padding: '10px 0 0', fontSize: 13, color: 'var(--c-text3)', cursor: 'pointer', fontWeight: 500 }}>
              取消
            </div>
          </div>
        </div>
      )}

      {/* 屏蔽确认弹窗 */}
      {showBlock && (
        <div onClick={() => setShowBlock(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 260, borderRadius: 20, padding: '28px 20px 20px',
            background: 'var(--c-card)', border: '1px solid var(--c-border)',
            textAlign: 'center', animation: 'fadeIn .2s ease',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 6 }}>屏蔽此用户</div>
            <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 20, lineHeight: 1.5 }}>
              屏蔽后将无法收到对方消息，<br/>且无法继续与该用户对话
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div onClick={() => setShowBlock(false)} style={{
                flex: 1, padding: 11, borderRadius: 10, cursor: 'pointer',
                border: '1px solid var(--c-border)', background: 'transparent',
                fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', textAlign: 'center',
              }}>取消</div>
              <div onClick={() => { setShowBlock(false); showToast('已屏蔽该用户'); onBack() }} style={{
                flex: 1, padding: 11, borderRadius: 10, cursor: 'pointer',
                border: 'none', background: '#EF4444',
                fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center',
              }}>确认屏蔽</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
