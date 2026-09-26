import { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

/* ========== SOS 紧急求救 专属详情页 ==========

/* 计算距发布时间（省电策略：仅在可见时高频更新） */
function useElapsed(publishTime, isVisible = true) {
  const [elapsed, setElapsed] = useState('刚刚')
  useEffect(() => {
    if (!isVisible) return // 页面不可见时不清除定时器但停止更新
    
    const update = () => {
      if (!publishTime) { setElapsed('刚刚'); return }
      const diff = Math.floor((Date.now() - new Date(publishTime).getTime()) / 1000)
      if (diff < 60) setElapsed(`${diff}秒前`)
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}分钟前`)
      else setElapsed(`${Math.floor(diff / 3600)}小时前`)
    }
    
    update()
    const id = setInterval(update, isVisible ? 1000 : 60000) // 可见时每秒更新，隐藏时每分钟更新
    return () => clearInterval(id)
  }, [publishTime, isVisible])
  return elapsed
}

/* 脉冲圆点 */
function PulseDot({ color = '#DC2626', size = 10 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color,
        animation: 'sosPulseDot 1.5s ease-in-out infinite',
      }} />
      <span style={{
        position: 'absolute', inset: -4, borderRadius: '50%', background: color, opacity: 0.3,
        animation: 'sosPulseRing 1.5s ease-in-out infinite',
      }} />
    </span>
  )
}

export default function SOSDetailPage({ data, onBack }) {
  const { openSubPage } = useApp()
  const task = data || {
    title: '夜间独行遇到可疑人员跟踪 求附近人帮助',
    desc: '已报警但需要平台协助通知附近用户，目前在便利店门口等待，穿白色外套黑色裤子，身高175左右，一直跟着我走了两条街。',
    user: '小林同学', rating: 4.9, auth: 'student', credit: 95,
    published: 32, completed: 28, board: 'sos',
    location: '学校西门外200m 全家便利店门口',
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    contactPhone: '138****5678',
    isSOS: true,
  }

  /* 当前用户注册手机号（null 表示未绑定） */
  const myRegisteredPhone = '159****3210' // 设为 null 可测试未绑定状态

  const elapsed = useElapsed(task.time)
  const [responded, setResponded] = useState(false)
  const [responding, setResponding] = useState(false)
  const [showCallConfirm, setShowCallConfirm] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const canCall = !!myRegisteredPhone
  const scrollRef = useRef(null)

  /* 响应者数量 */
  const [responderCount, setResponderCount] = useState(task.responder_count ?? 0)

  const handleRespond = async () => {
    if (responding || responded) return
    if (!getToken()) { showToast('请先登录后再响应求救'); return }
    setResponding(true)
    try {
      await api.sos.handle(task.id)
      setResponded(true)
      setResponderCount(prev => prev + 1)
      showToast('你已成功响应求救！')
    } catch (err) {
      showToast(err?.message || err?.detail || '响应失败，请重试')
    } finally {
      setResponding(false)
    }
  }

  /* SOS 安全须知 */
  const safetyTips = [
    { icon: '📞', text: '已报警请拨打 110 确认' },
    { icon: '📍', text: '尽量待在人多灯亮的地方' },
    { icon: '📸', text: '注意保存现场证据' },
    { icon: '👥', text: '保持与响应者的实时联系' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0C0C0C' }}>

      {/* ===== CSS 动画 ===== */}
      <style>{`
        @keyframes sosPulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes sosPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes sosBannerFlash {
          0%, 100% { background: linear-gradient(135deg, #DC2626, #991B1B); }
          50% { background: linear-gradient(135deg, #EF4444, #DC2626); }
        }
        @keyframes sosSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sosGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(220,38,38,0.3); }
          50% { box-shadow: 0 0 40px rgba(220,38,38,0.6); }
        }
        @keyframes sosGradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes sosHeartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          56% { transform: scale(1); }
        }
      `}</style>

      {/* ===== 顶部紧急导航栏 ===== */}
      <div style={{
        background: 'linear-gradient(180deg, #1A0000, #0C0C0C)',
        padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(220,38,38,0.2)',
      }}>
        <div onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, color: '#F87171',
        }}>←</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PulseDot />
          <span style={{ fontWeight: 800, fontSize: 17, color: '#F87171', letterSpacing: 1 }}>SOS 紧急求救</span>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
          fontSize: 12, fontWeight: 700, color: '#F87171',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 10 }}>⏱</span> {elapsed}
        </div>
      </div>

      {/* ===== 滚动内容区 ===== */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

        {/* 紧急横幅 */}
        <div style={{
          background: 'linear-gradient(135deg, #DC2626, #991B1B)',
          animation: 'sosBannerFlash 3s ease-in-out infinite',
          padding: '20px 20px 24px', position: 'relative', overflow: 'hidden',
        }}>
          {/* 背景装饰 */}
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 120, height: 120,
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, left: -20, width: 80, height: 80,
            borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, animation: 'sosHeartbeat 2s ease-in-out infinite',
            }}>🚨</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>紧急求救</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                {responderCount} 人已响应 · 正在等待帮助
              </div>
            </div>
          </div>

          {/* 标题 */}
          <div style={{
            fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.5,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)', position: 'relative',
          }}>
            {task.title}
          </div>
        </div>

        {/* 内容区域 */}
        <div style={{ padding: '16px 16px 24px' }}>

          {/* ===== 求救描述 ===== */}
          <div style={{
            background: 'rgba(220,38,38,0.08)', borderRadius: 16,
            border: '1.5px solid rgba(220,38,38,0.25)', padding: 16, marginBottom: 16,
            animation: 'sosSlideUp .4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>📝</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F87171' }}>求救详情</span>
            </div>
            <div style={{ fontSize: 15, color: '#E5E7EB', lineHeight: 1.8 }}>
              {task.desc || '需要紧急帮助，请立即联系我！'}
            </div>
          </div>

          {/* ===== 位置信息 ===== */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: 16, marginBottom: 16,
            animation: 'sosSlideUp .4s ease .1s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>📍</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F87171' }}>事发地点</span>
            </div>
            {/* 地图占位 */}
            <div style={{
              height: 120, borderRadius: 12, marginBottom: 12,
              background: 'linear-gradient(135deg, rgba(220,38,38,0.1), rgba(220,38,38,0.05))',
              border: '1px solid rgba(220,38,38,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* 地图网格装饰 */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 20}%`, height: 1, background: '#DC2626' }} />
                ))}
                {[...Array(5)].map((_, i) => (
                  <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 20}%`, width: 1, background: '#DC2626' }} />
                ))}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(220,38,38,0.3)', border: '2px solid #DC2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'sosGlow 2s ease-in-out infinite',
              }}>
                <span style={{ fontSize: 18 }}>📍</span>
              </div>
              <span style={{ fontSize: 11, color: '#F87171', fontWeight: 600 }}>点击查看详情</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', lineHeight: 1.5 }}>
              {task.location || '位置信息加载中...'}
            </div>
          </div>

          {/* ===== 联系方式 ===== */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: 16, marginBottom: 16,
            animation: 'sosSlideUp .4s ease .2s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>📞</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F87171' }}>联系方式</span>
            </div>

            {/* 电话 —— 仅限注册手机号拨打 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>📱</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>紧急电话</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F87171', letterSpacing: 1, fontFamily: "'DIN Alternate', monospace" }}>
                  {task.contactPhone || '138****5678'}
                </div>
              </div>
              {canCall ? (
                <button onClick={() => setShowCallConfirm(true)} style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(220,38,38,0.4)',
                }}>拨打</button>
              ) : (
                <div style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>未绑定手机</div>
                </div>
              )}
            </div>
            {/* 提示：仅限注册手机号拨打 */}
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 8,
              background: canCall ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.08)',
              border: canCall ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 13 }}>{canCall ? '✓' : '⚠'}</span>
              <span style={{ fontSize: 12, color: canCall ? '#86EFAC' : '#FBBF24', fontWeight: 500 }}>
                {canCall
                  ? `将通过你的注册手机号 ${myRegisteredPhone} 拨打`
                  : '需先在「设置 → 账号安全」中绑定手机号才能拨打'}
              </span>
            </div>
          </div>

          {/* ===== 求救者信息 ===== */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: 16, marginBottom: 16,
            animation: 'sosSlideUp .4s ease .3s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>👤</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F87171' }}>求救者信息</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, color: '#fff', fontWeight: 800,
                border: '2px solid rgba(220,38,38,0.5)',
              }}>{task.user?.[0] || 'S'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#F3F4F6' }}>{task.user || '求救者'}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6,
                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    fontSize: 11, fontWeight: 600, color: '#22C55E',
                  }}>{task.auth === 'student' ? '🎓 学生认证' : '✓ 实名认证'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  ⭐ 信用分 {task.credit || 95} · ★ {task.rating || 4.9}
                </div>
              </div>
            </div>

            {/* 统计 */}
            <div style={{
              display: 'flex', gap: 1, borderRadius: 12, overflow: 'hidden',
              background: 'rgba(255,255,255,0.06)',
            }}>
              {[
                { label: '发布任务', value: task.published || 32 },
                { label: '已完成', value: task.completed || 28 },
                { label: '好评率', value: '96%' },
              ].map((item, i) => (
                <div key={i} style={{
                  flex: 1, padding: '12px 8px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: i === 2 ? '#F87171' : '#F3F4F6' }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== 安全须知 ===== */}
          <div style={{
            background: 'rgba(245,158,11,0.06)', borderRadius: 16,
            border: '1px solid rgba(245,158,11,0.15)', padding: 16, marginBottom: 16,
            animation: 'sosSlideUp .4s ease .4s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>🛡️</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#FBBF24' }}>安全须知</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {safetyTips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  <span style={{ fontSize: 18 }}>{tip.icon}</span>
                  <span style={{ fontSize: 13, color: '#D1D5DB', fontWeight: 500 }}>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== 响应状态（响应后显示） ===== */}
          {responded && (
            <div style={{
              background: 'rgba(34,197,94,0.08)', borderRadius: 16,
              border: '1.5px solid rgba(34,197,94,0.25)', padding: 16, marginBottom: 16,
              animation: 'sosSlideUp .3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>✓</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#22C55E' }}>你已成功响应</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>请通过上方联系方式与求救者取得联系</div>
                </div>
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.15)',
                fontSize: 13, color: '#86EFAC', lineHeight: 1.6,
              }}>
                💡 提示：请先确认对方安全状况，必要时协助报警。到达现场后请点击「确认安全」通知平台。
              </div>
            </div>
          )}

          {/* 底部安全间距 */}
          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* ===== 底部操作栏 ===== */}
      <div style={{
        background: '#0C0C0C', padding: '12px 16px',
        borderTop: '1px solid rgba(220,38,38,0.2)',
      }}>
        {responded ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => openSubPage('chat', task)} style={{
              flex: 1, padding: 15, borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #DC2626, #991B1B)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              联系求救者
            </button>
            <button onClick={() => openSubPage('settle', task)} style={{
              flex: 1, padding: 15, borderRadius: 14,
              border: '2px solid #22C55E', background: 'transparent',
              color: '#22C55E', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              确认安全
            </button>
          </div>
        ) : (
          <button
            onClick={handleRespond}
            disabled={responding}
            style={{
              width: '100%', padding: 16, borderRadius: 14, border: 'none',
              background: responding ? '#991B1B' : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)',
              backgroundSize: '200% 200%',
              animation: responding ? 'none' : 'sosGradientFlow 3s ease infinite',
              color: '#fff', fontSize: 17, fontWeight: 800, letterSpacing: 1,
              cursor: responding ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 24px rgba(220,38,38,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .3s',
            }}>
            {responding ? (
              <>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                  animation: 'spin 1s linear infinite',
                }} />
                响应中...
              </>
            ) : (
              <>🚨 立即响应求救</>
            )}
          </button>
        )}
      </div>

      {/* ===== 拨打确认弹窗 ===== */}
      {showCallConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: 24,
        }} onClick={() => setShowCallConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1A1A1A', borderRadius: 20, padding: '28px 24px',
            maxWidth: 320, width: '100%',
            border: '1px solid rgba(220,38,38,0.3)', animation: 'sosSlideUp .25s ease',
          }}>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 16, animation: 'sosHeartbeat 2s ease-in-out infinite' }}>📞</div>
            <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#F3F4F6', marginBottom: 6 }}>拨打紧急电话</div>
            <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#F87171', marginBottom: 8, fontFamily: "'DIN Alternate', monospace", letterSpacing: 2 }}>
              {task.contactPhone || '138****5678'}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
              将通过你的注册手机号<br />
              <span style={{ color: '#86EFAC', fontWeight: 600 }}>{myRegisteredPhone}</span> 拨打该号码
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCallConfirm(false)} style={{
                flex: 1, padding: 14, borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: '#9CA3AF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>取消</button>
              <button onClick={() => { setShowCallConfirm(false); window.location.href = `tel:${task.contactPhone || '13812345678'}` }} style={{
                flex: 1, padding: 14, borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
              }}>确认拨打</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 22px', borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: 'nowrap' }}>{toast}</div>
      )}
    </div>
  )
}
