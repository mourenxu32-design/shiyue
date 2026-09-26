import { useState, useEffect } from 'react'
import api, { getToken } from '../utils/api'

const POST_TYPES = {
  help:     { label: '求助', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  discuss:  { label: '讨论', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  intel:    { label: '情报', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  share:    { label: '分享', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  carpool:  { label: '拼车', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  exchange: { label: '交换', color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
  vote:     { label: '投票', color: '#14B8A6', bg: 'rgba(20,184,166,0.15)' },
}

/* API 评论映射 */
function mapApiComment(c) {
  return {
    id: String(c.id), author: { name: c.author_nickname || `用户${c.author_id}`, avatar: (c.author_nickname || 'U')[0], verified: !!c.author_verified },
    content: c.content || '', time: c.created_at ? timeAgo(c.created_at) : '',
    likes: c.likes_count || 0, liked: false, isUseful: false,
  }
}
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

/* 用户性别映射 */
const userGender = {
  '花花': 'female', '研一学姐': 'female', '学霸学姐': 'female', '收纳达人': 'female',
  '退坑回血': 'female', '美妆店主': 'female', '小可爱': 'female', '萌新coser': 'female',
  '学长阿杰': 'male', '图书馆管理员': 'male', '考研小王': 'male', '吃货大学生': 'male',
  '学生会小李': 'male', '回家达人': 'male', '换书小能手': 'male', '选课纠结症': 'male',
  '准司机小张': 'male', '漫展老手': 'male', '道具大师': 'male', '情报员小K': 'male',
  '社长': 'male', '老司机阿明': 'male', '3D新手小白': 'male', '自学设计师': 'male',
  '剪辑新人': 'male', '省钱小能手': 'male', '自由设计师': 'male', '设计换摄影': 'male',
  '展会爱好者': 'male', '字体收集控': 'male', '莳约小鹿': 'male',
}

/* 性别图标组件 */
function GenderIcon({ user, size = 14 }) {
  const g = userGender[user]
  if (!g) return null
  return (
    <div style={{
      width: size, height: size, borderRadius: 4,
      background: g === 'male' ? '#2563EB' : '#EC4899',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'absolute', bottom: -2, left: -2,
      border: '1.5px solid var(--c-card)',
    }}>
      {g === 'male' ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="10" cy="14" r="7"/><path d="M21 3l-6.5 6.5"/><path d="M16 3h5v5"/></svg>
      ) : (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="12" cy="9" r="7"/><path d="M12 16v6"/><path d="M9 19h6"/></svg>
      )}
    </div>
  )
}

export default function ForumPostPage({ data, onBack }) {
  const post = data || { type: 'help', title: '示例帖子', content: '示例内容', author: { name: '用户', avatar: '用' }, time: '刚刚', distance: '0m', likes: 0, comments: 0 }
  const typeConf = POST_TYPES[post.type] || POST_TYPES.help
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [votedOption, setVotedOption] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [commentsList, setCommentsList] = useState([])
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // 加载评论列表
  useEffect(() => {
    if (!post.id) return
    let cancelled = false
    async function loadComments() {
      setCommentsLoading(true)
      try {
        const resp = await api.forum.comments(post.id)
        if (cancelled) return
        setCommentsList((resp?.data?.items || resp?.data || []).map(mapApiComment))
      } catch (err) {
        if (!cancelled) console.error('[ForumPostPage] 加载评论失败:', err)
      } finally {
        if (!cancelled) setCommentsLoading(false)
      }
    }
    loadComments()
    return () => { cancelled = true }
  }, [post.id])

  const handleVote = async (optId) => {
    if (votedOption) return
    if (!getToken()) { showToast('请先登录后再投票'); return }
    try {
      await api.forum.vote(post.id, optId)
      setVotedOption(optId)
    } catch (err) { showToast(err?.message || '投票失败') }
  }

  const sendComment = async () => {
    if (!commentText.trim()) return
    if (!getToken()) { showToast('请先登录后再评论'); return }
    try {
      await api.forum.addComment(post.id, { content: commentText })
      const newComment = { id: `c${Date.now()}`, author: { name: '我', avatar: '我', verified: true }, content: commentText, time: '刚刚', likes: 0, liked: false, isUseful: false }
      setCommentsList([newComment, ...commentsList])
      setCommentText('')
      showToast('评论成功')
    } catch (err) { showToast(err?.message || '评论失败') }
  }

  const toggleLike = async () => {
    if (!getToken()) { showToast('请先登录'); return }
    try {
      await api.forum.like(post.id)
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    } catch (err) { showToast(err?.message || '操作失败') }
  }

  const toggleFavorite = async () => {
    if (!getToken()) { showToast('请先登录'); return }
    try {
      await api.forum.favorite(post.id)
      setFavorited(!favorited)
    } catch (err) { showToast(err?.message || '操作失败') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)', flexShrink: 0 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 17, color: 'var(--c-text)' }}>帖子详情</div>
        <div style={{ cursor: 'pointer', color: 'var(--c-text3)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
      </div>
      {/* 滚动内容 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
        {/* 作者信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px' }}>
          <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6B5CE7, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 600 }}>{post.author.avatar}</div>
            <GenderIcon user={post.author.name} size={14} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--c-text)' }}>{post.author.name}</span>
              {post.author.verified && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontWeight: 600 }}>学生认证</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>{post.time} · {post.distance}</div>
          </div>
        </div>
        {/* 类型标签 */}
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: typeConf.bg, color: typeConf.color, fontWeight: 600 }}>{typeConf.label}</span>
          {post.tags?.map(t => <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'var(--c-input)', color: 'var(--c-text3)' }}>#{t}</span>)}
        </div>
        {/* 标题 */}
        {post.title && <div style={{ padding: '0 16px 8px', fontSize: 18, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.4 }}>{post.title}</div>}
        {/* 正文 */}
        <div style={{ padding: '0 16px 12px', fontSize: 15, color: 'var(--c-text2)', lineHeight: 1.7 }}>{post.content}</div>
        {/* 图片 */}
        {post.images?.length > 0 && (
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {post.images.map((img, i) => <img key={i} src={img} alt="" style={{ width: post.images.length === 1 ? '100%' : 160, height: post.images.length === 1 ? 200 : 160, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />)}
          </div>
        )}
        {/* 拼车路线 */}
        {post.type === 'carpool' && (
          <div style={{ margin: '0 16px 12px', padding: 12, borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--c-text)' }}>🕐 {post.carpoolTime}</span>
              <span style={{ fontSize: 13, color: '#8B5CF6', fontWeight: 600 }}>👥 {post.carpoolHave}/{post.carpoolHave + post.carpoolNeed}人</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--c-text2)' }}>
              <span>📍 {post.carpoolFrom}</span>
              <span style={{ color: '#8B5CF6' }}>→→→</span>
              <span>{post.carpoolTo}</span>
            </div>
          </div>
        )}
        {/* 投票区 */}
        {post.type === 'vote' && post.voteOptions && (
          <div style={{ margin: '0 16px 12px', padding: 14, borderRadius: 12, background: 'var(--c-card)', border: '1px solid var(--c-border)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', marginBottom: 12 }}>投票区</div>
            {post.voteOptions.map(opt => {
              const total = post.voteTotal + (votedOption ? 1 : 0)
              const count = opt.count + (votedOption === opt.id ? 1 : 0)
              const pct = total ? Math.round(count / total * 100) : 0
              const isVoted = votedOption === opt.id
              return (
                <div key={opt.id} onClick={() => handleVote(opt.id)} style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 10, background: isVoted ? 'rgba(20,184,166,0.1)' : 'var(--c-input)', border: isVoted ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent', cursor: votedOption ? 'default' : 'pointer', transition: 'all .2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: isVoted ? '#14B8A6' : 'var(--c-text)', fontWeight: isVoted ? 600 : 400 }}>{isVoted ? '✓ ' : ''}{opt.text}</span>
                    <span style={{ color: 'var(--c-text3)', fontSize: 12 }}>{votedOption ? `${pct}% (${count}票)` : ''}</span>
                  </div>
                  {votedOption && (
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--c-card-hover)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: isVoted ? '#14B8A6' : 'var(--c-text3)', transition: 'width .5s ease' }} />
                    </div>
                  )}
                </div>
              )
            })}
            <div style={{ fontSize: 11, color: 'var(--c-text3)', textAlign: 'center', marginTop: 4 }}>
              共 {post.voteTotal + (votedOption ? 1 : 0)} 人参与{!votedOption && ' · 点击选项即可投票'}
            </div>
          </div>
        )}
        {/* 互动数据 */}
        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '0 16px 12px', padding: '14px 16px', borderRadius: 14, background: 'var(--c-card)', border: '1px solid var(--c-border)' }}>
          <div onClick={toggleLike} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: liked ? 'rgba(239,68,68,0.12)' : 'var(--c-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .25s',
              boxShadow: liked ? '0 0 10px rgba(239,68,68,0.15)' : 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#EF4444' : 'none'} stroke={liked ? '#EF4444' : 'var(--c-text3)'} strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: liked ? 700 : 500, color: liked ? '#EF4444' : 'var(--c-text2)' }}>{likeCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--c-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text2)' }}>{commentsList.length}</span>
          </div>
          <div onClick={toggleFavorite} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: favorited ? 'rgba(245,158,11,0.12)' : 'var(--c-input)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .25s',
              boxShadow: favorited ? '0 0 10px rgba(245,158,11,0.15)' : 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? '#F59E0B' : 'none'} stroke={favorited ? '#F59E0B' : 'var(--c-text3)'} strokeWidth="2" strokeLinecap="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: favorited ? 700 : 500, color: favorited ? '#F59E0B' : 'var(--c-text2)' }}>{favorited ? '已收藏' : '收藏'}</span>
          </div>
        </div>
        {/* 评论区 */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)', marginBottom: 12 }}>评论 ({commentsList.length})</div>
          {commentsList.map(c => (
            <div key={c.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--c-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--c-text3)', fontWeight: 600 }}>{c.author.avatar}</div>
                  <GenderIcon user={c.author.name} size={12} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{c.author.name}</span>
                {c.author.verified && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>认证</span>}
                <span style={{ fontSize: 11, color: 'var(--c-text3)', marginLeft: 'auto' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--c-text2)', lineHeight: 1.5, marginBottom: 6, paddingLeft: 36 }}>{c.content}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 36 }}>
                <span style={{ fontSize: 12, color: c.liked ? '#EF4444' : 'var(--c-text3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={c.liked ? '#EF4444' : 'none'} stroke={c.liked ? '#EF4444' : 'currentColor'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {c.likes}
                </span>
                <span style={{ fontSize: 12, color: 'var(--c-text3)', cursor: 'pointer' }}>回复</span>
                {c.isUseful && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.12)', color: '#22C55E', fontWeight: 600 }}>💡 有用</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 底部评论输入栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--c-nav)', borderTop: '1px solid var(--c-border)', flexShrink: 0 }}>
        <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="写下你的评论..." style={{ flex: 1, padding: '9px 16px', borderRadius: 20, border: '1px solid var(--c-border-light)', background: 'var(--c-input)', color: 'var(--c-text)', fontSize: 14, outline: 'none' }} />
        <div onClick={sendComment} style={{ padding: '8px 16px', borderRadius: 18, background: commentText.trim() ? 'var(--c-accent)' : 'var(--c-input)', color: commentText.trim() ? '#fff' : 'var(--c-text3)', fontSize: 13, fontWeight: 600, cursor: commentText.trim() ? 'pointer' : 'default', transition: 'all .2s' }}>发送</div>
      </div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 22px', borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 999 }}>{toast}</div>
      )}
    </div>
  )
}
