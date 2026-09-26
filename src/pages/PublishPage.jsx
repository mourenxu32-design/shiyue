import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

/* 类目配置：payType=true 表示接单者赚钱（豆沙色），false 表示发布者收钱（青蓝色） */
const campusCats = [
  { icon: '📦', name: '代取快递', payType: true },
  { icon: '🛒', name: '代买代送', payType: true },
  { icon: '🏃', name: '校内跑腿', payType: true },
  { icon: '💺', name: '占座排队', payType: true },
  { icon: '🛠️', name: '技能定制', payType: true },
  { icon: '📚', name: '学业辅导', payType: true },
  { icon: '🧹', name: '代值日', payType: true },
  { icon: '🏷️', name: '闲置出售', payType: false },
  { icon: '🎓', name: '技能服务', payType: false },
  { icon: '📸', name: '约拍接单', payType: false },
  { icon: '🏃‍♂️', name: '代跑接单', payType: false },
  { icon: '📋', name: '其他', payType: true },
]
const cosCats = [
  { icon: '💄', name: 'Cos妆造' }, { icon: '🔨', name: '道具定制' },
  { icon: '📷', name: '摄影约拍' }, { icon: '💇', name: '假发造型' },
  { icon: '👗', name: '服装定制' }, { icon: '🖼️', name: '后期修图' },
  { icon: '🎨', name: '手绘定制' }, { icon: '📋', name: '其他' },
]
const craftCats = [
  { icon: '🧊', name: '建模接单' }, { icon: '🎨', name: '平面设计' },
  { icon: '📱', name: 'UI设计' }, { icon: '🎬', name: '视频剪辑' },
  { icon: '🖌️', name: '原画插画' }, { icon: '💻', name: '程序开发' },
  { icon: '✍️', name: '文案写作' }, { icon: '📊', name: 'PPT定制' },
  { icon: '🌐', name: '翻译服务' }, { icon: '🎙️', name: '音频制作' },
  { icon: '📈', name: '数据处理' }, { icon: '📋', name: '其他' },
]
const cityCats = [
  { icon: '🏃', name: '同城跑腿', payType: true },
  { icon: '🛒', name: '代买代送', payType: true },
  { icon: '🐾', name: '宠物服务', payType: true },
  { icon: '🔧', name: '上门维修', payType: false },
  { icon: '🚗', name: '代驾服务', payType: true },
  { icon: '📦', name: '搬家帮手', payType: true },
  { icon: '👶', name: '同城溜娃', payType: true },
  { icon: '🏠', name: '生活管家', payType: false },
  { icon: '📋', name: '其他', payType: true },
]

/* 配色 */
const PRICE_EARN = '#C2786A'   // 豆沙色 — 悬赏支付
const PRICE_SERVICE = '#22B8CF' // 青蓝色 — 服务收入

/* 好友列表（用于@通知） */
const friendGroups = {
  '常用搭档': [
    { id: 1, name: '小莎', avatar: '莎', online: true },
    { id: 2, name: '马哥', avatar: '马', online: false },
    { id: 10, name: '快递侠', avatar: '快', online: false },
  ],
  'Cos圈': [
    { id: 3, name: '方舟博士', avatar: '方', online: true },
    { id: 4, name: '万事屋', avatar: '万', online: false },
    { id: 8, name: '雷电将军', avatar: '雷', online: false },
  ],
  '学业互助': [
    { id: 5, name: '陈老师', avatar: '陈', online: true },
    { id: 6, name: '大四学姐', avatar: '四', online: false },
  ],
  '技能合作': [
    { id: 7, name: '研究生小王', avatar: '研', online: true },
    { id: 9, name: '设计小姐姐', avatar: '设', online: true },
  ],
}

const avatarGradients = [
  'linear-gradient(135deg, #2563EB, #7C3AED)',
  'linear-gradient(135deg, #10B981, #06B6D4)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #A855F7, #EC4899)',
  'linear-gradient(135deg, #3B82F6, #10B981)',
  'linear-gradient(135deg, #F97316, #F59E0B)',
  'linear-gradient(135deg, #6366F1, #8B5CF6)',
  'linear-gradient(135deg, #14B8A6, #2563EB)',
]

export default function PublishPage({ data }) {
  const { closeSubPage } = useApp()
  const [localToast, setLocalToast] = useState(null)
  const showToast = (msg) => {
    setLocalToast(msg)
    setTimeout(() => setLocalToast(null), 2500)
  }
  const [step, setStep] = useState(1)
  const [board, setBoard] = useState(null)
  const [cat, setCat] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [location, setLocation] = useState('')
  const [contactNote, setContactNote] = useState('')
  const [delivery, setDelivery] = useState(null)
  const [useUrgent, setUseUrgent] = useState(false)
  const [mentionedFriends, setMentionedFriends] = useState([])
  const [showFriendPicker, setShowFriendPicker] = useState(false)
  const [pickerGroup, setPickerGroup] = useState('全部')
  const [showSOS, setShowSOS] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  /* ===== 发布悬赏提交逻辑 ===== */
  const handleSubmit = async () => {
    // 防止重复提交
    if (submitting) return

    // 表单校验
    if (!cat) return showToast('请选择一个类目')
    if (!title.trim()) return showToast('请填写任务标题')
    if (title.trim().length > 200) return showToast('标题不能超过200字')
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) return showToast('请输入有效的悬赏金额')

    // 检查登录态
    const token = getToken()
    if (!token) return showToast('请先登录后再发布')

    setSubmitting(true)
    try {
      // 构造 payload，字段名映射到后端 TaskCreateReq
      const payload = {
        board,
        category: cat,
        title: title.trim(),
        description: desc.trim(),
        amount: amountNum.toFixed(2),
        is_service: isServiceCat(),
        is_urgent: useUrgent,
        location: location.trim(),
        delivery_method: delivery || '',
      }

      const resp = await api.tasks.create(payload)
      if (resp) {
        showToast('发布成功！悬赏已上线')
        // 延迟关闭页面，让用户看到成功提示
        setTimeout(() => closeSubPage(), 1200)
      }
    } catch (err) {
      console.error('[PublishPage] 发布失败:', err)
      showToast(err?.message || err?.detail || '发布失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  /* 接收预填充数据（如商家一键生成任务） */
  useEffect(() => {
    if (data?.prefill) {
      const p = data.prefill
      if (p.board) { setBoard(p.board); setStep(2) }
      if (p.cat) setCat(p.cat)
      if (p.title) setTitle(p.title)
      if (p.desc) setDesc(p.desc)
      if (p.amount) setAmount(String(p.amount))
      if (p.location) setLocation(p.location)
      if (p.contact) setContactNote(p.contact)
    }
  }, [data])

  /* 判断当前类目是否为服务类（发布者赚钱） */
  const isServiceCat = () => {
    const catList = board === 'campus' ? campusCats : board === 'city' ? cityCats : null
    if (!catList) return false
    const c = catList.find(x => x.name === cat)
    return c ? c.payType === false : false
  }

  const priceColor = isServiceCat() ? PRICE_SERVICE : PRICE_EARN
  const priceLabel = isServiceCat() ? '服务定价' : '悬赏金额'

  /* ===== Step 1: 选择板块 ===== */
  if (step === 1) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--c-bg)', padding: 0 }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12 }}>
          <div onClick={() => closeSubPage()} style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)'
          }}>←</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-text)' }}>发布任务</div>
            <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>选择你要发布悬赏的板块</div>
          </div>
        </div>

        {/* Board Selection */}
        <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { id: 'campus', icon: '🎓', label: '校园任务', desc: '代取快递、跑腿、技能服务等校园生活服务', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
            { id: 'cos', icon: '🎭', label: 'Cosplay', desc: 'Cos妆造、道具定制、摄影约拍等二次元委托', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
            { id: 'city', icon: '📍', label: '同城解忧', desc: '同城跑腿、代买代送、上门维修、宠物服务等本地生活服务', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
            { id: 'craft', icon: '🏗️', label: '兼工阁', desc: '建模、设计、开发、写作、剪辑等技能接单服务', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
          ].map(b => (
            <div key={b.id} onClick={() => { setBoard(b.id); setStep(2); setCat(null) }}
              style={{ padding: 20, borderRadius: 16, background: 'var(--c-card)', border: '1px solid var(--c-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all .2s' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: b.color }}>{b.label}</div>
                <div style={{ fontSize: 12, color: 'var(--c-text2)', marginTop: 4 }}>{b.desc}</div>
              </div>
              <span style={{ color: '#555', fontSize: 20 }}>›</span>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div style={{ margin: '24px 16px', padding: 16, borderRadius: 14, background: 'var(--c-nav)', border: '1px solid var(--c-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>💡 发布小贴士</div>
          <div style={{ fontSize: 12, color: 'var(--c-text3)', lineHeight: 1.8 }}>
            · 清晰的标题和描述能更快被揭榜{'\n'}
            · 合理设置悬赏金额和截止时间{'\n'}
            · 添加参考图片可提高接单率
          </div>
        </div>

        {/* SOS 紧急求救按钮 */}
        <div style={{ padding: '0 16px 32px' }}>
          <div onClick={() => setShowSOS(true)} style={{
            padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 6px 24px rgba(220,38,38,0.35)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 80, height: 80,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent)',
              borderRadius: '0 16px 0 0',
            }} />
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.4)',
              flexShrink: 0,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>SOS 紧急求救</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>紧急情况下快速发布求助，系统将优先推送</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22 }}>›</span>
          </div>
        </div>

        {/* SOS 确认弹窗 */}
        {showSOS && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, backdropFilter: 'blur(4px)',
          }} onClick={() => setShowSOS(false)}>
            <div style={{
              width: 300, borderRadius: 20, padding: '28px 24px 20px',
              background: 'var(--c-card)', border: '1px solid var(--c-border)',
              textAlign: 'center', animation: 'fadeIn .2s ease',
            }} onClick={e => e.stopPropagation()}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(220,38,38,0.12)', border: '2px solid #DC2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>紧急求救</div>
              <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 24 }}>
                确认后立即发布紧急求救，系统将优先推送给附近用户，并同步通知管理后台
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowSOS(false)} style={{
                  flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--c-border)',
                  background: 'var(--c-input)', color: 'var(--c-text)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>取消</button>
                <button onClick={() => {
                  setShowSOS(false)
                  // 写入 SOS 请求到 localStorage，供管理后台读取
                  const sosList = JSON.parse(localStorage.getItem('shiyue_sos_requests') || '[]')
                  const newSOS = {
                    id: `sos_${Date.now()}`,
                    userId: 'user_current',
                    userName: '当前用户',
                    time: new Date().toISOString(),
                    status: 'pending',
                    description: '紧急求救',
                    location: '当前位置附近',
                    handled: false,
                  }
                  sosList.unshift(newSOS)
                  localStorage.setItem('shiyue_sos_requests', JSON.stringify(sosList))
                  window.dispatchEvent(new CustomEvent('sos-new-request', { detail: newSOS }))
                  showToast('紧急求救已发布，请保持手机畅通')
                }} style={{
                  flex: 1, padding: 12, borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                }}>立即求救</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ===== Step 2: 填写任务详情 ===== */
  const cats = board === 'campus' ? campusCats : board === 'cos' ? cosCats : board === 'city' ? cityCats : craftCats
  const accentColor = board === 'campus' ? '#2563EB' : board === 'cos' ? '#A855F7' : board === 'city' ? '#06B6D4' : '#10B981'
  const boardLabel = board === 'campus' ? '校园任务' : board === 'cos' ? 'Cosplay' : board === 'city' ? '同城解忧' : '兼工阁'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)', flexShrink: 0 }}>
        <div onClick={() => setStep(1)} style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)'
        }}>←</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-text)' }}>发布悬赏</div>
          <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>{boardLabel}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 16, paddingBottom: 32 }}>

        {/* ══════ 公开信息区：所有人可见 ══════ */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor }} />
            公开信息 · 所有人可见
          </div>

          {/* 类目选择 */}
          <div className="card" style={{ margin: '0 0 12px' }}>
            <div className="form-label" style={{ marginBottom: 12, fontWeight: 600, color: 'var(--c-text)', fontSize: 15 }}>选择类目</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cats.map(c => {
                const isPayTypeFalse = (board === 'campus' || board === 'city') && c.payType === false
                const pillActive = cat === c.name
                return (
                  <div key={c.name} onClick={() => setCat(c.name)}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 500,
                      background: pillActive ? accentColor : 'var(--c-input)',
                      color: pillActive ? '#000' : 'var(--c-text2)',
                      border: pillActive ? `1.5px solid ${accentColor}` : isPayTypeFalse ? '1.5px solid rgba(34,184,207,0.3)' : '1.5px solid transparent',
                      transition: 'all .15s', position: 'relative',
                    }}>
                    {isPayTypeFalse && !pillActive && <span style={{ color: PRICE_SERVICE, fontSize: 10, marginRight: 3 }}>¥</span>}
                    {c.name}
                  </div>
                )
              })}
            </div>
            {isServiceCat() && (
              <div style={{ marginTop: 10, fontSize: 11, color: PRICE_SERVICE, background: 'rgba(34,184,207,0.08)', padding: '6px 12px', borderRadius: 8, fontWeight: 500 }}>
                💡 服务类目：你提供服务收取报酬，定价由你决定
              </div>
            )}
          </div>

          {/* 标题 */}
          <div className="card" style={{ margin: '0 0 12px' }}>
            <input className="form-input" placeholder="简要描述你需要什么帮助" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {/* 详细描述 */}
          <div className="card" style={{ margin: '0 0 12px' }}>
            <textarea className="form-input form-textarea" placeholder="详细说明任务要求、时间、地点等" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          {/* 图片上传 */}
          <div className="card" style={{ margin: '0 0 12px' }}>
            <div className="form-label" style={{ marginBottom: 8 }}>添加图片</div>
            <div className="upload-grid">
              <div className="upload-item"><span className="plus">+</span><span>添加图片</span></div>
              <div className="upload-item filled"><span>📷</span></div>
              <div className="upload-item"><span className="plus">+</span></div>
            </div>
          </div>

          {/* 金额 — 豆沙色/青蓝色区分 */}
          <div className="card" style={{ margin: '0 0 12px' }}>
            <div className="form-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {priceLabel}
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: isServiceCat() ? 'rgba(34,184,207,0.1)' : 'rgba(194,120,106,0.1)', color: priceColor, fontWeight: 600 }}>
                {isServiceCat() ? '你收取报酬' : '你支付赏金'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: priceColor }}>¥</span>
              <input className="form-input" type="number" placeholder="输入金额" value={amount} onChange={e => setAmount(e.target.value)}
                style={{ fontSize: 24, fontWeight: 700, color: priceColor, border: 'none', borderBottom: `2px solid ${priceColor}33`, borderRadius: 0, padding: '8px 0', background: 'transparent' }} />
            </div>
            {amount && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: priceColor, opacity: 0.6 }} />
                {isServiceCat() ? '接单者完成服务后，你将支付此金额' : '揭榜者完成任务后，你将支付此金额作为报酬'}
              </div>
            )}
          </div>

          {/* 截止时间 */}
          <div className="card" style={{ margin: '0 0 12px' }}>
            <div className="form-label" style={{ marginBottom: 8 }}>截止时间（可选）</div>
            <input className="form-input" type="datetime-local" />
          </div>
        </div>

        {/* ══════ 揭榜后可见区：虚线框 ══════ */}
        <div style={{
          border: '2px dashed var(--c-border-light)', borderRadius: 16, padding: '16px 0 4px',
          marginBottom: 16, position: 'relative',
        }}>
          {/* 标签 */}
          <div style={{
            position: 'absolute', top: -12, left: 16,
            background: 'var(--c-bg)', padding: '2px 12px', borderRadius: 10,
            fontSize: 12, fontWeight: 600, color: 'var(--c-text3)',
            display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid var(--c-border-light)',
          }}>
            <span style={{ fontSize: 13 }}>🔒</span>
            揭榜后可见 · 仅接单者能查看
          </div>

          {/* 交付方式 (Cos only) */}
          {board === 'cos' && (
            <div className="card" style={{ margin: '8px 0 12px' }}>
              <div className="form-label" style={{ marginBottom: 8 }}>交付方式</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['线下面交', '远程快递', '线上交付'].map(d => (
                  <div key={d} onClick={() => setDelivery(d)}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center', fontSize: 13, cursor: 'pointer',
                      background: delivery === d ? 'rgba(139,92,246,0.12)' : 'var(--c-input)',
                      border: delivery === d ? '1.5px solid var(--c-purple)' : '1.5px solid var(--c-border-light)',
                      color: delivery === d ? 'var(--c-purple)' : 'var(--c-text2)', fontWeight: delivery === d ? 600 : 400
                    }}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 开始时间 */}
          <div className="card" style={{ margin: '8px 0 12px' }}>
            <div className="form-label" style={{ marginBottom: 8 }}>开始时间（可选）</div>
            <input className="form-input" type="datetime-local" />
          </div>

          {/* 期望地点 */}
          <div className="card" style={{ margin: '8px 0 12px' }}>
            <div className="form-label" style={{ marginBottom: 8 }}>期望地点（可选）</div>
            <input className="form-input" placeholder="如：梅园3舍楼下、图书馆二楼" value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          {/* 联系方式备注 */}
          <div className="card" style={{ margin: '8px 0 12px' }}>
            <div className="form-label" style={{ marginBottom: 8 }}>备注信息（可选）</div>
            <textarea className="form-input form-textarea" placeholder="对接单者的额外说明，如联系方式偏好等" value={contactNote} onChange={e => setContactNote(e.target.value)} style={{ minHeight: 60 }} />
          </div>

          {/* 发布选项 */}
          <div className="card" style={{ margin: '8px 0 12px' }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--c-text)' }}>发布选项</div>
            <div className="toggle">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text)' }}>加急推送</div>
                <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>使用急急卡，任务置顶显示</div>
              </div>
              <div className={`toggle-track ${useUrgent ? 'on' : ''}`} onClick={() => setUseUrgent(!useUrgent)}>
                <div className="toggle-thumb" />
              </div>
            </div>
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--c-input)', borderRadius: 8, fontSize: 12, color: 'var(--c-text2)' }}>
              消耗明细：发布券 ×1 {useUrgent && '+ 急急卡 ×1'}
            </div>
          </div>
        </div>

        {/* @好友通知 */}
        <div className="card" style={{ margin: '8px 0 12px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/></svg>
            @好友通知
            {mentionedFriends.length > 0 && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 6,
                background: 'rgba(37,99,235,0.1)', color: '#2563EB', fontWeight: 600,
              }}>已选 {mentionedFriends.length} 人</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 10 }}>选择好友，发布后将通知他们查看此任务</div>
          {/* 已选好友标签 */}
          {mentionedFriends.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {mentionedFriends.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px 4px 6px', borderRadius: 20,
                  background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: avatarGradients[f.id % avatarGradients.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 9, fontWeight: 700,
                  }}>{f.avatar}</div>
                  <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 500 }}>{f.name}</span>
                  <span onClick={() => setMentionedFriends(mentionedFriends.filter(x => x.id !== f.id))} style={{
                    cursor: 'pointer', color: '#94A3B8', fontSize: 14, lineHeight: 1, marginLeft: 2,
                  }}>×</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowFriendPicker(true)} style={{
            width: '100%', padding: 10, borderRadius: 10,
            border: '1.5px dashed rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.03)',
            color: '#2563EB', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            {mentionedFriends.length > 0 ? '继续选择好友' : '选择要通知的好友'}
          </button>
        </div>

        {/* Publish Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: submitting
              ? `linear-gradient(135deg, ${accentColor}88, ${accentColor}66)`
              : `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : `0 4px 16px ${accentColor}44`,
            marginBottom: 24, opacity: submitting ? 0.7 : 1,
            transition: 'all .2s',
          }}>
          {submitting ? '发布中...' : `发布悬赏${mentionedFriends.length > 0 ? ` · 通知${mentionedFriends.length}位好友` : ''}`}
        </button>
      </div>

      {/* ===== 好友选择器弹窗 ===== */}
      {showFriendPicker && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowFriendPicker(false)}>
          <div style={{
            width: '100%', maxWidth: 430, background: 'var(--c-card)', borderRadius: '20px 20px 0 0',
            padding: '20px 0 0', border: '1px solid var(--c-border)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', maxHeight: '70%',
            display: 'flex', flexDirection: 'column',
          }} onClick={e => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-text)' }}>选择通知好友</div>
                <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 2 }}>已选 {mentionedFriends.length} 人，发布后将推送通知</div>
              </div>
              <div onClick={() => setShowFriendPicker(false)} style={{
                width: 32, height: 32, borderRadius: 10, background: 'var(--c-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                fontSize: 16, color: 'var(--c-text3)',
              }}>×</div>
            </div>

            {/* 分组标签 */}
            <div style={{ display: 'flex', padding: '0 20px 10px', gap: 6, overflowX: 'auto' }}>
              {['全部', ...Object.keys(friendGroups)].map(g => {
                const isActive = pickerGroup === g
                return (
                  <div key={g} onClick={() => setPickerGroup(g)} style={{
                    padding: '5px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: isActive ? '#2563EB' : 'rgba(37,99,235,0.06)',
                    color: isActive ? '#fff' : 'var(--c-text3)',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>{g}</div>
                )
              })}
            </div>

            {/* 好友列表 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 12px' }}>
              {Object.entries(friendGroups)
                .filter(([g]) => pickerGroup === '全部' || g === pickerGroup)
                .map(([groupName, members]) => (
                  <div key={groupName}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text3)', padding: '10px 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{groupName}</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                    </div>
                    {members.map(friend => {
                      const isSelected = mentionedFriends.some(f => f.id === friend.id)
                      return (
                        <div key={friend.id} onClick={() => {
                          if (isSelected) {
                            setMentionedFriends(mentionedFriends.filter(f => f.id !== friend.id))
                          } else {
                            setMentionedFriends([...mentionedFriends, friend])
                          }
                        }} style={{
                          display: 'flex', alignItems: 'center', padding: '10px 0',
                          borderBottom: '1px solid var(--c-border)', cursor: 'pointer',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: avatarGradients[friend.id % avatarGradients.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
                          }}>{friend.avatar}</div>
                          <div style={{ flex: 1, marginLeft: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{friend.name}</div>
                            <div style={{ fontSize: 11, color: friend.online ? '#10B981' : 'var(--c-text3)' }}>{friend.online ? '在线' : '离线'}</div>
                          </div>
                          <div style={{
                            width: 24, height: 24, borderRadius: 7,
                            border: isSelected ? 'none' : '2px solid var(--c-border)',
                            background: isSelected ? '#2563EB' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .15s', flexShrink: 0,
                          }}>
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
            </div>

            {/* 底部确认按钮 */}
            <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--c-border)' }}>
              <button onClick={() => setShowFriendPicker(false)} style={{
                width: '100%', padding: 13, borderRadius: 12, border: 'none',
                background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              }}>
                确认选择{mentionedFriends.length > 0 ? ` (${mentionedFriends.length}人)` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 本地 Toast */}
      {localToast && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 10, background: 'rgba(34,197,94,0.95)',
          color: '#fff', fontSize: 13, fontWeight: 600, zIndex: 999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', animation: 'fadeIn .2s ease',
        }}>{localToast}</div>
      )}
    </div>
  )
}
