import { useState } from 'react'
import { useApp } from '../App'

const reviews = [
  { id: 1, from: '小莎', avatar: '莎', task: '帮取顺丰快递', rating: 5, content: '速度很快，态度也很好，下次还找！', time: '6月20日', tags: ['速度快', '态度好'] },
  { id: 2, from: '陈老师', avatar: '陈', task: '心理调查问卷', rating: 5, content: '认真完成了问卷，非常感谢参与。', time: '6月19日', tags: ['认真负责'] },
  { id: 3, from: '考研er', avatar: '考', task: '图书馆占座', rating: 4, content: '位置不错，就是稍微晚了一点。', time: '6月18日', tags: ['位置好'] },
  { id: 4, from: '大四学姐', avatar: '四', task: '代排队交表', rating: 5, content: '非常靠谱，准时完成，强烈推荐！', time: '6月17日', tags: ['靠谱', '准时'] },
  { id: 5, from: '方舟博士', avatar: '方', task: 'Cos妆造', rating: 5, content: '妆面还原度超高，漫展被好多人问！', time: '6月15日', tags: ['技术好', '还原度高'] },
]

export default function MyReviewsPage() {
  const { closeSubPage } = useApp()
  const [tab, setTab] = useState('全部')

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
  const filtered = tab === '全部' ? reviews : tab === '好评' ? reviews.filter(r => r.rating >= 4) : reviews.filter(r => r.rating < 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 0', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div onClick={closeSubPage} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18 }}>←</div>
          <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>我的评价</div>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, padding: '0 4px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFD700' }}>{avg}</div>
            <div style={{ fontSize: 12, color: '#FFD700' }}>{'★'.repeat(Math.round(avg))}</div>
          </div>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--c-text3)' }}>共 {reviews.length} 条评价 · 好评率 96%</div>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {['全部', '好评', '中差评'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: tab === t ? 'var(--c-text)' : '#666',
              borderBottom: tab === t ? '3px solid var(--c-accent)' : '3px solid transparent',
            }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 0' }}>
        {filtered.map(r => (
          <div key={r.id} className="task-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{r.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.from}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>{r.task} · {r.time}</div>
              </div>
              <div style={{ color: '#FFD700', fontSize: 12 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.5, marginBottom: 8 }}>{r.content}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {r.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, color: '#22C55E', background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 6 }}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
