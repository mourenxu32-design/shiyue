import { useState } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

const POST_TYPES = {
  help:     { label: '求助', icon: '❓', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  discuss:  { label: '讨论', icon: '💬', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  intel:    { label: '情报', icon: '📡', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  share:    { label: '分享', icon: '📝', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  carpool:  { label: '拼车', icon: '🚗', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  exchange: { label: '交换', icon: '🔄', color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
  vote:     { label: '投票', icon: '📊', color: '#14B8A6', bg: 'rgba(20,184,166,0.15)' },
}

const BOARDS = [
  { id: 'campus', label: '校园局', icon: '🏫' },
  { id: 'acg', label: 'Cosplay', icon: '🎭' },
  { id: 'craft', label: '兼工阁', icon: '💼' },
]

export default function ForumCreatePage({ data, onBack }) {
  const { closeSubPage } = useApp()
  const [postType, setPostType] = useState(data?.type || 'help')
  const [board, setBoard] = useState(data?.board || 'campus')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState([])
  const [voteOptions, setVoteOptions] = useState(['', ''])

  const [publishing, setPublishing] = useState(false)
  const [localToast, setLocalToast] = useState(null)
  const showToast = (msg) => { setLocalToast(msg); setTimeout(() => setLocalToast(null), 2500) }

  const currentType = POST_TYPES[postType]

  const addTag = () => {
    if (tagInput.trim() && tags.length < 3) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (idx) => setTags(tags.filter((_, i) => i !== idx))

  const addVoteOption = () => {
    if (voteOptions.length < 8) setVoteOptions([...voteOptions, ''])
  }

  const removeVoteOption = (idx) => {
    if (voteOptions.length > 2) setVoteOptions(voteOptions.filter((_, i) => i !== idx))
  }

  const updateVoteOption = (idx, val) => {
    const opts = [...voteOptions]
    opts[idx] = val
    setVoteOptions(opts)
  }

  const addImage = () => {
    if (images.length < 9) setImages([...images, { id: Date.now() }])
  }

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx))

  const handlePublish = async () => {
    if (publishing) return
    if (!title.trim()) return showToast('请输入标题')
    if (!content.trim()) return showToast('请输入正文')
    if (postType === 'vote' && voteOptions.some(o => !o.trim())) return showToast('请填写所有投票选项')
    if (!getToken()) return showToast('请先登录后再发帖')

    setPublishing(true)
    try {
      const payload = {
        board,
        post_type: postType,
        title: title.trim(),
        content: content.trim(),
        tags: tags.join(','),
        image_urls: [],
        vote_options: postType === 'vote' ? voteOptions.filter(o => o.trim()) : [],
      }
      const resp = await api.forum.createPost(payload)
      if (resp) {
        showToast('发布成功！')
        setTimeout(() => { onBack ? onBack() : closeSubPage() }, 1000)
      }
    } catch (err) {
      console.error('[ForumCreate] 发帖失败:', err)
      showToast(err?.message || err?.detail || '发布失败，请稍后重试')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      {/* Top Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#1E2A3A', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span onClick={() => { onBack ? onBack() : closeSubPage() }} style={{ fontSize: 20, cursor: 'pointer', color: 'white' }}>←</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>发布帖子</span>
        </div>
        <button onClick={handlePublish} disabled={publishing} style={{ padding: '6px 20px', borderRadius: 20, border: 'none', background: publishing ? '#999' : '#D4A853', color: '#1E2A3A', fontSize: 14, fontWeight: 700, cursor: publishing ? 'not-allowed' : 'pointer', opacity: publishing ? 0.6 : 1 }}>
          {publishing ? '发布中...' : '发布'}
        </button>
      </div>

      {/* Scrollable Form */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Post Type Selector */}
        <div style={{ padding: '16px 16px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginBottom: 10 }}>帖子类型</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {Object.entries(POST_TYPES).map(([key, t]) => (
              <div key={key} onClick={() => setPostType(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 16px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  fontSize: 13, fontWeight: 600, transition: 'all .2s',
                  background: postType === key ? t.bg : 'var(--c-input)',
                  color: postType === key ? t.color : 'var(--c-text3)',
                  border: postType === key ? `1.5px solid ${t.color}` : '1.5px solid transparent',
                }}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Board Selector */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginBottom: 10 }}>发布板块</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {BOARDS.map(b => (
              <div key={b.id} onClick={() => setBoard(b.id)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  background: board === b.id ? 'rgba(212,168,83,0.15)' : 'var(--c-input)',
                  border: board === b.id ? '1.5px solid #D4A853' : '1.5px solid transparent',
                  color: board === b.id ? '#D4A853' : 'var(--c-text3)',
                  transition: 'all .2s',
                }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{b.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginBottom: 8 }}>标题</div>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              placeholder="请输入帖子标题（最多50字）"
              maxLength={50}
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ paddingRight: 50 }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--c-text3)' }}>
              {title.length}/50
            </span>
          </div>
        </div>

        {/* Content Textarea */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginBottom: 8 }}>正文</div>
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-input form-textarea"
              placeholder="说说你的想法..."
              maxLength={2000}
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ minHeight: 160, paddingBottom: 30 }}
            />
            <span style={{ position: 'absolute', right: 12, bottom: 10, fontSize: 11, color: 'var(--c-text3)' }}>
              {content.length}/2000
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginBottom: 8 }}>图片（最多9张）</div>
          <div className="upload-grid">
            {images.map((img, idx) => (
              <div key={img.id} className="upload-item filled" style={{ position: 'relative' }}>
                <span style={{ fontSize: 28 }}>🖼️</span>
                <span style={{ fontSize: 10, color: 'var(--c-text3)' }}>图片{idx + 1}</span>
                <span onClick={() => removeImage(idx)}
                  style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  ✕
                </span>
              </div>
            ))}
            {images.length < 9 && (
              <div className="upload-item" onClick={addImage}>
                <span className="plus">+</span>
                <span>添加图片</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginBottom: 8 }}>话题标签（可选，最多3个）</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {tags.map((tag, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px', borderRadius: 16, background: 'rgba(212,168,83,0.15)', color: '#D4A853', fontSize: 12, fontWeight: 500,
              }}>
                <span>#{tag}</span>
                <span onClick={() => removeTag(idx)} style={{ cursor: 'pointer', marginLeft: 2 }}>✕</span>
              </div>
            ))}
            {tags.length < 3 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  placeholder="输入标签"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  style={{
                    width: 80, padding: '6px 10px', borderRadius: 16, border: '1px solid var(--c-border-light)',
                    background: 'var(--c-input)', color: 'var(--c-text)', fontSize: 12, outline: 'none',
                  }}
                />
                <span onClick={addTag} style={{ color: '#D4A853', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>添加</span>
              </div>
            )}
          </div>
        </div>

        {/* Vote Options (only for vote type) */}
        {postType === 'vote' && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginBottom: 8 }}>
              投票选项（{voteOptions.length}/8）
            </div>
            {voteOptions.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(20,184,166,0.15)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  className="form-input"
                  placeholder={`选项 ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={e => updateVoteOption(idx, e.target.value)}
                  style={{ flex: 1 }}
                />
                {voteOptions.length > 2 && (
                  <span onClick={() => removeVoteOption(idx)} style={{ color: '#EF4444', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</span>
                )}
              </div>
            ))}
            {voteOptions.length < 8 && (
              <div onClick={addVoteOption} style={{
                padding: '10px', borderRadius: 10, border: '1.5px dashed var(--c-border-light)',
                textAlign: 'center', color: 'var(--c-text3)', fontSize: 13, cursor: 'pointer',
              }}>
                + 添加选项
              </div>
            )}
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>

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
