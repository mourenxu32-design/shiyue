import { useState } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard } from './SettingShared'
import api from '../../utils/api'

export default function FeedbackPage() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const inputBg = isDark ? '#252E42' : '#F5F5F7'
  const cardBg = isDark ? '#1E2536' : '#FFFFFF'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'

  const [type, setType] = useState('功能建议')
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showTypeSelect, setShowTypeSelect] = useState(false)

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
        <SettingNav title="意见反馈" onBack={() => openSubPage('settings')} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(34,197,94,0.15)' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#22C55E' }}>{I.check}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 8 }}>感谢反馈</div>
          <div style={{ fontSize: 14, color: subColor, textAlign: 'center', marginBottom: 24 }}>我们会尽快处理您的反馈</div>
          <button onClick={() => openSubPage('settings')}
            style={{ padding: '12px 32px', borderRadius: 12, background: (isDark ? '#4A90D9' : '#1E2A3A'), color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            返回设置
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="意见反馈" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: subColor, letterSpacing: 0.5 }}>反馈类型</div>
        <SettingCard>
          <div style={{ padding: 16 }}>
            <div onClick={() => setShowTypeSelect(!showTypeSelect)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 12, background: inputBg, cursor: 'pointer',
              }}>
              <span style={{ fontSize: 14, color: textColor }}>{type}</span>
              <span style={{ color: subColor, transform: showTypeSelect ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>{I.chev}</span>
            </div>
            {showTypeSelect && (
              <div style={{ marginTop: 8 }}>
                {['功能建议', '问题反馈', '其他'].map(t => (
                  <div key={t} onClick={() => { setType(t); setShowTypeSelect(false) }}
                    style={{
                      padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, marginTop: 4,
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: type === t ? (isDark ? 'rgba(212,168,83,0.1)' : 'rgba(30,42,58,0.06)') : 'transparent',
                      color: type === t ? (isDark ? '#D4A853' : '#1E2A3A') : subColor,
                      fontWeight: type === t ? 600 : 400,
                    }}>
                    {type === t && <span style={{ color: isDark ? '#D4A853' : '#1E2A3A' }}>{I.check}</span>}
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SettingCard>

        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: subColor, letterSpacing: 0.5 }}>反馈内容</div>
        <SettingCard>
          <div style={{ padding: 16 }}>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="请详细描述你的问题或建议..."
              style={{
                width: '100%', minHeight: 120, padding: '12px 16px', borderRadius: 12,
                border: `1px solid ${borderColor}`, fontSize: 14, outline: 'none', resize: 'none',
                lineHeight: 1.6, background: inputBg, fontFamily: 'inherit', color: textColor,
              }} />
          </div>
        </SettingCard>

        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: subColor, letterSpacing: 0.5 }}>添加图片（可选，最多4张）</div>
        <SettingCard>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <div style={{
                aspectRatio: 1, borderRadius: 12, border: `2px dashed ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: subColor, cursor: 'pointer',
              }}>{I.plus}</div>
            </div>
          </div>
        </SettingCard>

        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: subColor, letterSpacing: 0.5 }}>联系方式（选填）</div>
        <SettingCard>
          <div style={{ padding: 16 }}>
            <input value={contact} onChange={e => setContact(e.target.value)}
              placeholder="请留下手机号或微信，便于我们联系你"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: `1px solid ${borderColor}`, fontSize: 14, outline: 'none',
                background: inputBg, color: textColor,
              }} />
          </div>
        </SettingCard>

        <div style={{ padding: '16px 20px' }}>
          <button onClick={async () => {
            try {
              await api.feedback.submit({ type, content, contact })
              setSubmitted(true)
            } catch (e) {
              alert(e.message || '提交失败')
            }
          }}
            style={{
              width: '100%', padding: 14, borderRadius: 12,
              background: isDark ? 'linear-gradient(135deg, #D4A853, #E8C878)' : 'linear-gradient(135deg, #1E2A3A, #2D3E55)',
              border: 'none', color: isDark ? '#1A1A1A' : '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: isDark ? '0 4px 12px rgba(212,168,83,0.3)' : '0 4px 12px rgba(30,42,58,0.3)',
            }}>
            提交反馈
          </button>
        </div>
      </div>
    </div>
  )
}
