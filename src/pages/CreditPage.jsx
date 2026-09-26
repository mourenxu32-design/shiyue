import { useState, useEffect } from 'react'
import api, { getToken } from '../utils/api'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return `${Math.floor(days / 30)}个月前`
}

const localReviews = [
  { id: 1, user: '小莎', rating: 5, text: '非常靠谱，准时送到，服务态度很好！', time: '2天前', task: '帮取快递' },
  { id: 2, user: '陈老师', rating: 5, text: '认真完成了调查问卷，感谢参与', time: '5天前', task: '心理调查' },
  { id: 3, user: '大四学姐', rating: 4, text: '帮忙交了表格，速度很快', time: '1周前', task: '交表格' },
  { id: 4, user: '考研er', rating: 5, text: '帮占了好位置，非常感谢！', time: '2周前', task: '图书馆占座' },
]

export default function CreditPage({ onBack }) {
  const [score, setScore] = useState(92)
  const [reviews, setReviews] = useState(localReviews)
  const [stats, setStats] = useState({ total: 48, good: 46, mid: 2, bad: 0 })

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    // 加载用户信用分
    api.users.profile().then(resp => {
      if (cancelled) return
      const u = resp?.data
      if (u?.credit_score != null) setScore(u.credit_score)
      if (u?.good_rate != null) {
        const total = (u.published_count || 0) + (u.completed_count || 0)
        const good = Math.round(total * (u.good_rate / 100))
        setStats({ total, good, mid: total - good, bad: 0 })
      }
    }).catch(() => {})
    // 加载收到的评价
    api.reviews.mine({ page_size: 20 }).then(resp => {
      if (cancelled) return
      const items = resp?.data?.items
      if (Array.isArray(items) && items.length > 0) {
        setReviews(items.map(r => ({
          id: r.id, user: r.reviewer_nickname || '用户', rating: r.rating || 5,
          text: r.content || '', time: timeAgo(r.created_at),
          task: r.task_title || '任务',
        })))
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div style={{ minHeight: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, color: 'var(--c-text)' }}>信用与评价</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Score Ring */}
        <div style={{ textAlign: 'center', padding: '32px 20px 20px' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="45" fill="none" stroke="var(--c-input)" strokeWidth="8" />
            <circle cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div style={{ position: 'relative', marginTop: -84, marginBottom: 20 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color }}>{score}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <span className="tag tag-green">优秀</span>
            <span style={{ fontSize: 13, color: 'var(--c-text2)', fontWeight: 500 }}>超过了 89% 的用户</span>
          </div>
        </div>

        {/* Stats */}
        <div className="card" style={{ margin: '0 16px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: '总评价', value: String(stats.total), color: 'var(--c-text)' },
              { label: '好评', value: String(stats.good), color: 'var(--c-accent)' },
              { label: '中评', value: String(stats.mid), color: 'var(--c-warn)' },
              { label: '差评', value: String(stats.bad), color: 'var(--c-danger)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--c-text)' }}>收到的评价</div>
          {reviews.map(r => (
            <div key={r.id} className="card" style={{ margin: '0 0 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div className="avatar avatar-sm" style={{ background: 'var(--c-card-hover)' }}>{r.user[0]}</div>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: 'var(--c-text)' }}>{r.user}</span>
                <span style={{ fontSize: 11, color: 'var(--c-text3)' }}>{r.time}</span>
              </div>
              <div className="stars" style={{ marginBottom: 6 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`star ${s <= r.rating ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.5, marginBottom: 6 }}>{r.text}</div>
              <span className="tag tag-gray" style={{ fontSize: 10 }}>关联任务：{r.task}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
