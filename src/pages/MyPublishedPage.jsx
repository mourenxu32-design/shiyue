import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api from '../utils/api'

const statusColors = { '进行中': '#22C55E', '已完成': '#6B7280', '已取消': '#EF4444' }
const apiStatusMap = { 'open': '进行中', 'accepted': '进行中', 'completed': '已完成', 'cancelled': '已取消' }

export default function MyPublishedPage() {
  const { closeSubPage, openSubPage } = useApp()
  const [tab, setTab] = useState('全部')
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const resp = await api.tasks.list({ my: 'published', page_size: 100 })
        if (cancelled) return
        setAllTasks((resp?.data?.items || []).map(t => ({
          id: t.id, title: t.title, amount: Number(t.amount || 0),
          status: apiStatusMap[t.status] || t.status || '进行中',
          applicants: t.accept_count || 0,
          createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          icon: t.category === '摄影约拍' ? '🎭' : t.category === '代取快递' ? '📦' : '💰',
        })))
      } catch (err) {
        if (!cancelled) console.error('[MyPublishedPage] 加载失败:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const publishedTasks = allTasks

  const filtered = tab === '全部' ? publishedTasks : publishedTasks.filter(t => t.status === tab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 0', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div onClick={closeSubPage} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18 }}>←</div>
          <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>我的悬赏</div>
          <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>共{publishedTasks.length}条</span>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {['全部', '进行中', '已完成', '已取消'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: tab === t ? 'var(--c-text)' : '#666',
              borderBottom: tab === t ? '3px solid var(--c-accent)' : '3px solid transparent',
            }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 0' }}>
        {filtered.map(task => (
          <div key={task.id} className="task-card" onClick={() => openSubPage('detail', task)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{task.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 2 }}>{task.createdAt}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#22C55E' }}>¥{task.amount}</div>
                <span style={{ fontSize: 11, color: statusColors[task.status], background: `${statusColors[task.status]}22`, padding: '2px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>{task.status}</span>
              </div>
            </div>
            {task.status === '进行中' && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--c-text3)', background: 'var(--c-input)', padding: '3px 8px', borderRadius: 6 }}>👥 {task.applicants}人申请</span>
                <button onClick={(e) => { e.stopPropagation(); openSubPage('task-detail', task) }} style={{ background: 'var(--c-accent)', color: '#000', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>查看申请</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 22px', borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 999 }}>{toast}</div>
      )}
    </div>
  )
}
