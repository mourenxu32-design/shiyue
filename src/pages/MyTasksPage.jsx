import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api from '../utils/api'
import { BOARD_CONFIG } from '../utils/boardStatus'

const taskTabs = ['进行中', '已完成', '已取消']

/* 从 BOARD_CONFIG 构建板块查找表 */
const boardAccent = Object.fromEntries(BOARD_CONFIG.map(b => [b.id, b.color]))
const boardLabel = Object.fromEntries(BOARD_CONFIG.map(b => [b.id, b.label]))
const catBorderColor = {} // 分类边框色，暂无分类配置，使用板块色兜底

/* 状态映射 */
const apiStatusMap = { 'accepted': '进行中', 'in_progress': '进行中', 'pending': '待确认', 'completed': '已完成', 'cancelled': '已取消', 'rejected': '已取消' }

export default function MyTasksPage() {
  const { openSubPage } = useApp()
  const [tab, setTab] = useState('进行中')
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const resp = await api.tasks.list({ my: 'accepted', page_size: 100 })
        if (cancelled) return
        setAllTasks((resp?.data?.items || []).map(t => ({
          id: t.id, title: t.title, client: t.publisher_nickname || `用户${t.publisher_id}`,
          amount: Number(t.amount || 0),
          deadline: t.deadline ? new Date(t.deadline).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          status: apiStatusMap[t.status] || t.status || '进行中',
          progress: t.status === 'accepted' ? '已接单' : t.status === 'pending' ? '待确认' : t.status,
          board: t.board || 'campus', cat: t.category || '',
          completedAt: t.completed_at ? new Date(t.completed_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) : '',
          rating: t.rating || 5,
          cancelledAt: t.cancelled_at ? new Date(t.cancelled_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) : '',
          reason: t.cancel_reason || '',
        })))
      } catch (err) {
        if (!cancelled) console.error('[MyTasksPage] 加载失败:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const ongoingTasks = allTasks.filter(t => ['进行中', '待确认'].includes(t.status))
  const completedTasks = allTasks.filter(t => t.status === '已完成')
  const cancelledTasks = allTasks.filter(t => t.status === '已取消')

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text3)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
        <div style={{ fontSize: 14 }}>加载任务中...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 0', background: 'var(--c-nav)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: 'var(--c-text)' }}>我的任务</div>
        </div>
        {/* Segmented Tabs */}
        <div style={{ padding: '0 16px 12px', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
          <div style={{
            display: 'flex', gap: 0, background: 'var(--c-card)', borderRadius: 12, padding: 3,
            border: '1px solid var(--c-border)',
          }}>
            {taskTabs.map(t => (
              <div key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, textAlign: 'center', padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  borderRadius: 10, transition: 'all .25s',
                  color: tab === t ? '#fff' : 'var(--c-text3)',
                  background: tab === t ? '#2563EB' : 'transparent',
                  boxShadow: tab === t ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                }}>
                {t}
                {t === '进行中' && ongoingTasks.length > 0 && (
                  <span style={{
                    marginLeft: 4,
                    background: tab === t ? 'rgba(255,255,255,0.25)' : '#2563EB',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 8,
                  }}>{ongoingTasks.length}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 0' }}>

        {/* ===== 进行中 ===== */}
        {tab === '进行中' && (
          <>
            {ongoingTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text3)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>暂无进行中的任务</div>
                <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>去首页揭榜接单吧</div>
              </div>
            ) : ongoingTasks.map(task => {
              const accent = boardAccent[task.board] || '#2563EB'
              const borderC = catBorderColor[task.cat] || accent
              return (
                <div key={task.id} className="task-card" style={{ borderLeft: `3px solid ${borderC}` }} onClick={() => openSubPage('detail', { ...task, user: task.client, isAccepted: true })}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: `linear-gradient(135deg, ${accent}20, ${accent}40)`,
                      border: `1px solid ${accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: accent, flexShrink: 0,
                    }}>{boardLabel[task.board] || '任务'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--c-text)' }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 3 }}>发布者: {task.client}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981', flexShrink: 0, fontFamily: "'DIN Alternate', 'SF Mono', monospace" }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>¥</span>{task.amount}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        background: `${accent}18`, color: accent,
                        fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600,
                      }}>{task.progress}</span>
                      <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>截止: {task.deadline}</span>
                    </div>
                    <button onClick={async () => {
                      try { await api.tasks.complete(task.id); showToast('任务已完成') }
                      catch { showToast('操作失败') }
                    }} style={{
                      background: accent, color: '#fff', border: 'none',
                      borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all .2s',
                      boxShadow: `0 2px 8px ${accent}40`,
                    }}>
                      完成
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ===== 已完成 ===== */}
        {tab === '已完成' && (
          <>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 0, padding: '4px 16px 16px',
              marginBottom: 4,
            }}>
              {[
                { value: completedTasks.length, label: '完成总数', color: '#10B981' },
                { value: `¥${completedTasks.reduce((s, t) => s + t.amount, 0)}`, label: '累计收入', color: '#F59E0B' },
                { value: '4.9', label: '平均评分', color: '#2563EB' },
              ].map((stat, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center', padding: '12px 0',
                  borderRight: i < 2 ? '1px solid var(--c-border)' : 'none',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: "'DIN Alternate', 'SF Mono', monospace" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            {completedTasks.map(task => {
              const accent = boardAccent[task.board] || '#2563EB'
              const borderC = catBorderColor[task.cat] || accent
              return (
                <div key={task.id} className="task-card" style={{ borderLeft: `3px solid ${borderC}` }} onClick={() => openSubPage('detail', { ...task, user: task.client, isAccepted: true, isCompleted: true })}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: `linear-gradient(135deg, ${accent}20, ${accent}40)`,
                      border: `1px solid ${accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: accent, flexShrink: 0,
                    }}>{boardLabel[task.board] || '任务'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--c-text)' }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 3 }}>{task.client} · {task.completedAt}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981', flexShrink: 0, fontFamily: "'DIN Alternate', 'SF Mono', monospace" }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>+¥</span>{task.amount}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: -1, marginRight: 3 }}><path d="M20 6L9 17l-5-5"/></svg>
                      已完成
                    </span>
                    <div style={{ fontSize: 12, color: '#F59E0B', letterSpacing: 1 }}>{'★'.repeat(task.rating)}{'☆'.repeat(5 - task.rating)}</div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ===== 已取消 ===== */}
        {tab === '已取消' && (
          <>
            {cancelledTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text3)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>没有取消的任务</div>
              </div>
            ) : cancelledTasks.map(task => {
              const accent = boardAccent[task.board] || '#2563EB'
              return (
                <div key={task.id} className="task-card" style={{ opacity: 0.65, borderLeft: `3px solid #475569` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'var(--c-card-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'var(--c-text3)', flexShrink: 0,
                    }}>{boardLabel[task.board] || '任务'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, textDecoration: 'line-through', color: 'var(--c-text3)' }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 3 }}>{task.client} · {task.cancelledAt}</div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--c-text3)', flexShrink: 0 }}>¥{task.amount}</div>
                  </div>
                  <span style={{
                    background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                    fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600,
                  }}>{task.reason}</span>
                </div>
              )
            })}
          </>
        )}
      </div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 22px', borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 999 }}>{toast}</div>
      )}
    </div>
  )
}