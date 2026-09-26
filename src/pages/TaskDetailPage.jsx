import { useState } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'
import { checkAmountLimit, getLimitDesc } from '../utils/taskValidation'

/* 用户性别映射 */
const userGender = {
  '小莎': 'female', '陈老师': 'female', '大四学姐': 'female', '花花': 'female',
  '豆子酱': 'female', '美妆店主': 'female', '小可爱': 'female',
  '马哥': 'male', '考研er': 'male', '毕业清仓王': 'male', '研二学长': 'male',
  '方舟博士': 'male', '雷电将军': 'male', '万事屋': 'male',
  '李同学': 'male', '王老板': 'male', '陈同学': 'female', '张总': 'male',
  '研究生小王': 'male', '大四老学长': 'male', '林同学': 'male', '学姐小王': 'female',
  '研一学长': 'male', '毕业季同学': 'female', '宅宅同学': 'male', '隔壁老王': 'male',
}

/* 性别图标组件 */
function GenderIcon({ user, size = 16 }) {
  const g = userGender[user]
  if (!g) return null
  return (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: g === 'male' ? '#2563EB' : '#EC4899',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'absolute', bottom: -2, left: -2,
      border: '2px solid var(--c-card)',
    }}>
      {g === 'male' ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="10" cy="14" r="7"/><path d="M21 3l-6.5 6.5"/><path d="M16 3h5v5"/></svg>
      ) : (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="12" cy="9" r="7"/><path d="M12 16v6"/><path d="M9 19h6"/></svg>
      )}
    </div>
  )
}

export default function TaskDetailPage({ data, onBack }) {
  const { openSubPage, closeSubPage, setActiveTab, memberType } = useApp()
  const task = data || { title: '帮取菜鸟驿站快递送到3舍', cat: '代取快递', catTag: '配送', amount: 15, user: '小莎', rating: 4.9, auth: 'student', credit: 92, published: 32, completed: 28, board: 'campus', location: '菜鸟驿站' }
  const isCos = task.board === 'cos'
  const isCraft = task.board === 'craft'
  const isSOS = task.board === 'sos' || task.isSOS

  /* 板块主题色 */
  const boardAccent = isSOS ? '#DC2626' : isCos ? '#A855F7' : isCraft ? '#10B981' : '#2563EB'

  /* 价格配色：悬赏类豆沙色，服务类青蓝色 */
  const serviceCats = ['闲置出售', '技能服务', '约拍接单', '代跑接单']
  const priceColor = serviceCats.includes(task.cat) ? '#22B8CF' : '#C2786A'

  // 揭榜校验
  const amountCheck = checkAmountLimit(task.board, task.amount, memberType)
  const isBlocked = amountCheck.blocked

  const [accepted, setAccepted] = useState(data?.isAccepted || data?.isCompleted || false)
  const isCompleted = data?.isCompleted || false
  const isRevealed = accepted || isSOS // SOS任务无需接取即可查看全部信息
  const [accepting, setAccepting] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [liked, setLiked] = useState(false)
  const [collected, setCollected] = useState(false)

  // 额外支出
  const [extraExpense, setExtraExpense] = useState('')
  const [extraStatus, setExtraStatus] = useState('idle') // idle | pending | approved | rejected
  const [localToast, setLocalToast] = useState(null)
  const showToast = (msg) => { setLocalToast(msg); setTimeout(() => setLocalToast(null), 2500) }

  const handleAccept = async () => {
    if (isBlocked) { setShowBlockModal(true); return }
    if (accepting) return
    if (!getToken()) { showToast('请先登录后再接取任务'); return }
    setAccepting(true)
    try {
      if (isSOS) {
        await api.sos.handle(task.id)
      } else {
        await api.tasks.accept(task.id)
      }
      setAccepted(true)
      showToast('揭榜成功！任务已接取')
    } catch (err) {
      showToast(err?.message || err?.detail || '接取失败，请稍后重试')
    } finally {
      setAccepting(false)
    }
  }

  // 模拟接取后的详细信息
  const acceptedDetails = {
    pickupCode: '丰巢取件码 8-6-2913',
    deliveryAddr: '桂园3舍 2楼 207室',
    contactPhone: '138****5678',
    contactWechat: 'sarah_wx2025',
    deadline: '今天 17:00 前',
    note: '快递比较重，是个猫粮箱子，辛苦啦~ 送到后放门口鞋柜上面就行，我会给你开门的。',
  }

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, color: 'var(--c-text)' }}>
          {isCompleted ? '已完成任务' : accepted ? '已接取任务' : '任务详情'}
        </span>
        <span style={{ color: 'var(--c-text3)', cursor: 'pointer', fontSize: 18 }}>⋮</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
        {/* Status badge */}
        {accepted && (
          <div style={{ background: isCompleted ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)', border: isCompleted ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: isCompleted ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{isCompleted ? '✓' : '✓'}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isCompleted ? '#3B82F6' : '#22C55E' }}>{isCompleted ? '任务已完成' : '任务已接取'}</div>
              <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>{isCompleted ? '任务已顺利完结，感谢你的付出！' : '请在截止时间前完成，可在"我的任务"中查看'}</div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {isSOS ? (
            <>
              <span className="tag" style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626', fontWeight: 700 }}>🚨 SOS 紧急求救</span>
              <span className="tag tag-gray">⏰ {task.time || '刚刚'}</span>
            </>
          ) : (
            <>
              <span className={`tag ${isCos ? 'tag-purple' : 'tag-green'}`}>{isCos ? '🎭' : '📦'} {task.cat}</span>
              <span className="tag" style={{ background: `${boardAccent}18`, color: boardAccent }}>{isCos ? 'Cosplay' : isCraft ? '兼工阁' : '校园任务'}</span>
              {task.delivery && <span className="tag tag-gray">{task.delivery}</span>}
            </>
          )}
        </div>

        {/* Amount — 大标题（SOS不显示金额） */}
        {!isSOS && (
        <div style={{ fontSize: 40, fontWeight: 800, color: priceColor, marginBottom: 12, fontFamily: "'DIN Alternate', 'SF Mono', monospace", letterSpacing: -1 }}>
          ¥{task.amount}<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--c-text2)' }}>.00</span>
          {serviceCats.includes(task.cat) && <span style={{ fontSize: 11, fontWeight: 600, color: priceColor, marginLeft: 8, padding: '3px 10px', borderRadius: 8, background: 'rgba(34,184,207,0.1)' }}>服务收费</span>}
        </div>
        )}

        {/* 额外支出输入（仅接取后且未完成且非SOS时显示） */}
        {accepted && !isCompleted && !isSOS && (
          <div style={{ marginBottom: 16, background: 'var(--c-card)', borderRadius: 14, border: '1px solid var(--c-border-light)', padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={boardAccent} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              额外支出
            </div>
            {extraStatus === 'approved' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                <span style={{ fontSize: 13, color: '#22C55E', fontWeight: 600 }}>¥{extraExpense} 已确认，将加入最终结算</span>
              </div>
            ) : extraStatus === 'rejected' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 600 }}>发布者拒绝了 ¥{extraExpense} 的额外支出</span>
              </div>
            ) : extraStatus === 'pending' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #F59E0B', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>¥{extraExpense} 等待发布者确认中...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', borderRadius: 10, background: 'var(--c-input)', border: '1px solid var(--c-border-light)' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: priceColor }}>¥</span>
                  <input
                    type="number" value={extraExpense}
                    min="0" step="0.01"
                    onChange={e => {
                      const v = e.target.value
                      if (v === '' || Number(v) >= 0) setExtraExpense(v)
                    }}
                    onKeyDown={e => {
                      if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault()
                    }}
                    onPaste={e => {
                      const text = e.clipboardData?.getData('text') || ''
                      if (!/^\d+(\.\d+)?$/.test(text)) e.preventDefault()
                    }}
                    placeholder="输入额外支出金额"
                    style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--c-text)', fontSize: 15, fontWeight: 600, flex: 1, minWidth: 0 }}
                  />
                </div>
                <button
                  onClick={() => { if (extraExpense && Number(extraExpense) > 0) setExtraStatus('pending') }}
                  disabled={!extraExpense || Number(extraExpense) <= 0}
                  style={{
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: (extraExpense && Number(extraExpense) > 0) ? boardAccent : 'var(--c-input)',
                    color: (extraExpense && Number(extraExpense) > 0) ? '#fff' : 'var(--c-text3)',
                    fontSize: 13, fontWeight: 700, cursor: (extraExpense && Number(extraExpense) > 0) ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap', transition: 'all .2s',
                  }}>提交确认</button>
              </div>
            )}
            {extraStatus === 'idle' && extraExpense && (
              <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 6 }}>
                提交后需等待发布者确认，确认后才会加入最终结算金额
              </div>
            )}
            {extraStatus === 'pending' && (
              <button onClick={() => { setExtraStatus('idle'); setExtraExpense('') }}
                style={{ marginTop: 8, fontSize: 12, color: 'var(--c-text3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>撤销申请</button>
            )}
          </div>
        )}

        {/* Title */}
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, marginBottom: 12, color: 'var(--c-text)' }}>{task.title}</div>

        {/* Description */}
        {!isRevealed && (
          <div style={{ fontSize: 14, color: 'var(--c-text2)', lineHeight: 1.8, marginBottom: 16 }}>
            需要帮忙完成 "{task.title}" 这个任务，时间灵活可商量。具体要求接取后可查看详情或私聊沟通~
          </div>
        )}
        {isSOS && task.desc && (
          <div style={{ fontSize: 14, color: '#991B1B', lineHeight: 1.8, marginBottom: 16, padding: '12px 16px', background: 'rgba(220,38,38,0.05)', borderRadius: 12, border: '1px solid rgba(220,38,38,0.1)' }}>
            {task.desc}
          </div>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span className="tag tag-gray">📍 {accepted ? acceptedDetails.deliveryAddr : task.location || '校园内'}</span>
          <span className="tag tag-gray">⏰ 截止 {accepted ? acceptedDetails.deadline : '今天 17:00'}</span>
        </div>

        {/* Images — 接取后可见 */}
        {!accepted && !isSOS && (
          <div style={{
            marginBottom: 16, borderRadius: 14, overflow: 'hidden',
            border: '1px solid var(--c-border-light)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '20px 16px', background: 'var(--c-input)',
              fontSize: 13, color: 'var(--c-text3)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              接取任务后可查看图片
            </div>
          </div>
        )}
        {(accepted || isSOS) && (
          <div className="img-scroll" style={{ marginBottom: 16 }}>
            <div className="img-placeholder">图片 1</div>
            <div className="img-placeholder">图片 2</div>
          </div>
        )}

        {/* ===== 接取后显示详细信息（SOS自动显示） ===== */}
        {isRevealed && (
          <div style={{ background: isSOS ? 'rgba(220,38,38,0.04)' : 'var(--c-card)', borderRadius: 16, border: isSOS ? '2px solid rgba(220,38,38,0.2)' : '1px solid var(--c-border-light)', padding: 16, marginBottom: 16, animation: 'slideUp .3s ease' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📋</span> 任务详细信息
            </div>
            <div style={{ background: 'var(--c-input)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--c-text3)', marginBottom: 4 }}>取件码 / 凭据</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#FBBF24', letterSpacing: 1 }}>{acceptedDetails.pickupCode}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <span style={{ fontSize: 16, marginTop: 2 }}>📍</span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 2 }}>送达地址</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{acceptedDetails.deliveryAddr}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <span style={{ fontSize: 16 }}>📞</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 2 }}>联系电话</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{acceptedDetails.contactPhone}</div>
              </div>
              <button style={{ background: boardAccent, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>拨打</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 2 }}>微信号</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{acceptedDetails.contactWechat}</div>
              </div>
              <button style={{ background: 'var(--c-input)', color: 'var(--c-text2)', border: '1px solid var(--c-border-light)', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>复制</button>
            </div>
            <div style={{ padding: '10px 0' }}>
              <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 4 }}>发布者备注</div>
              <div style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.7, background: 'var(--c-input)', borderRadius: 8, padding: 12 }}>{acceptedDetails.note}</div>
            </div>
          </div>
        )}

        {/* ===== 未接取：信息模糊提示（SOS不显示） ===== */}
        {!isRevealed && (
          <div style={{ background: 'var(--c-card)', borderRadius: 14, border: '1px dashed var(--c-border-light)', padding: 16, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 13, color: 'var(--c-text3)', lineHeight: 1.6 }}>
              接取任务后可查看<br />
              <span style={{ color: 'var(--c-text2)' }}>取件码 · 详细地址 · 联系方式 · 发布者备注</span>
            </div>
          </div>
        )}

        {/* Publisher Card */}
        <div className="card" style={{ margin: '0 0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }} onClick={() => openSubPage('user-profile', { user: task.user })}>
            <div className="avatar avatar-lg" style={{ position: 'relative' }}>{task.user?.[0] || 'S'}
              <GenderIcon user={task.user} size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--c-text)' }}>{task.user}</span>
                <span className={`tag ${task.auth === 'student' ? 'tag-green' : 'tag-blue'}`}>{task.auth === 'student' ? '学生' : '实名'}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-text2)', marginTop: 2 }}>⭐ 信用分 {task.credit || 92} · ★ {task.rating || 4.9}</div>
            </div>
            <div style={{ color: 'var(--c-text3)', opacity: 0.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderTop: '1px solid var(--c-border)' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>{task.published || 32}</div>
              <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>发布</div>
            </div>
            <div style={{ width: 1, background: 'var(--c-border)' }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>{task.completed || 28}</div>
              <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>完成</div>
            </div>
            <div style={{ width: 1, background: 'var(--c-border)' }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: boardAccent }}>96%</div>
              <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>好评</div>
            </div>
          </div>
          {isRevealed && (
            <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--c-border)' }}>💰 支付宝：138****5678</div>
          )}
        </div>

        {/* Warnings */}
        {task.auth === 'guest' && (
          <div className="warning-bar yellow" style={{ borderRadius: 12, marginBottom: 12 }}>⚠️ 该用户未绑定学籍，请谨慎接单</div>
        )}
        {isCos && task.delivery === '线下面交' && (
          <div className="warning-bar yellow" style={{ borderRadius: 12, marginBottom: 12 }}>
            🛡️ 建议在公共场所见面
            <button className="btn btn-sm btn-dark" style={{ marginLeft: 'auto', fontSize: 11, padding: '4px 10px' }}>分享行程</button>
          </div>
        )}

        {/* 金额限制提示 */}
        {isBlocked && !accepted && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>金额超限，无法接取</div>
              <div style={{ fontSize: 12, color: 'var(--c-text3)', lineHeight: 1.5 }}>{amountCheck.msg}</div>
              <div onClick={() => openSubPage('member')} style={{ fontSize: 12, color: boardAccent, fontWeight: 700, marginTop: 8, cursor: 'pointer' }}>👉 立即开通会员</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Fixed Bar */}
      <div style={{ background: 'var(--c-nav)', padding: '12px 16px', borderTop: '1px solid var(--c-border)' }}>
        {!accepted && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 12 }}>
            <div onClick={() => setLiked(!liked)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: liked ? 'rgba(239,68,68,0.12)' : 'var(--c-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .25s',
                boxShadow: liked ? '0 0 12px rgba(239,68,68,0.2)' : 'none',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? '#EF4444' : 'none'} stroke={liked ? '#EF4444' : 'var(--c-text3)'} strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: liked ? '#EF4444' : 'var(--c-text3)' }}>喜欢</span>
            </div>
            <div onClick={() => setCollected(!collected)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: collected ? 'rgba(245,158,11,0.12)' : 'var(--c-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .25s',
                boxShadow: collected ? '0 0 12px rgba(245,158,11,0.2)' : 'none',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={collected ? '#F59E0B' : 'none'} stroke={collected ? '#F59E0B' : 'var(--c-text3)'} strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: collected ? '#F59E0B' : 'var(--c-text3)' }}>收藏</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'var(--c-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text3)' }}>分享</span>
            </div>
          </div>
        )}
        {accepted ? (
          isCompleted ? (
            <button onClick={() => openSubPage('chat', task)} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: boardAccent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${boardAccent}44` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -2, marginRight: 4 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              联系发布者
            </button>
          ) : isSOS ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => openSubPage('chat', task)} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: '#DC2626', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -2, marginRight: 4 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                联系求救者
              </button>
              <button onClick={() => openSubPage('settle', task)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1.5px solid #DC2626`, background: 'transparent', color: '#DC2626', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: -2, marginRight: 4 }}><polyline points="20 6 9 17 4 12"/></svg>
                确认安全
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => openSubPage('chat', task)} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: boardAccent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -2, marginRight: 4 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                联系发布者
              </button>
              <button onClick={() => openSubPage('settle', task)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1.5px solid ${boardAccent}`, background: 'transparent', color: boardAccent, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: -2, marginRight: 4 }}><polyline points="20 6 9 17 4 12"/></svg>
                确认完成
              </button>
            </div>
          )
        ) : isSOS ? (
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none',
              background: accepting ? '#991B1B' : 'linear-gradient(135deg, #DC2626, #991B1B)',
              color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: accepting ? 'not-allowed' : 'pointer',
              transition: 'all .3s',
              boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
            }}>
            {accepting ? '响应中...' : '🚨 立即响应'}
          </button>
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting || isBlocked}
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none',
              background: isBlocked ? '#334155' : accepting ? '#EF4444' : boardAccent,
              color: isBlocked ? '#64748B' : '#fff', fontSize: 16, fontWeight: 700,
              cursor: accepting || isBlocked ? 'not-allowed' : 'pointer',
              transition: 'all .3s',
              boxShadow: isBlocked ? 'none' : `0 4px 16px ${boardAccent}44`,
            }}>
            {isBlocked ? '需开通会员' : accepting ? '接取中...' : '揭榜接取'}
          </button>
        )}
      </div>

      {/* 金额超限弹窗 */}
      {showBlockModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24
        }} onClick={() => setShowBlockModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--c-card)', borderRadius: 20, padding: '28px 24px', maxWidth: 320, width: '100%',
            border: '1px solid var(--c-border-light)', animation: 'slideUp .25s ease'
          }}>
            <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>无法接取该任务</div>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--c-text3)', lineHeight: 1.7, marginBottom: 20 }}>
              {amountCheck.msg}
              <br />
              <span style={{ fontSize: 11, color: 'var(--c-text3)' }}>错误码：{amountCheck.code}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowBlockModal(false)} style={{
                flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--c-border-light)',
                background: 'transparent', color: 'var(--c-text2)', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>取消</button>
              <button onClick={() => { setShowBlockModal(false); openSubPage('member') }} style={{
                flex: 1, padding: 12, borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${boardAccent}, ${boardAccent}CC)`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer'
              }}>开通会员</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
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
