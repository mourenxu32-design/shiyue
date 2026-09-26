/**
 * 悬浮消息按钮 - 系统消息详情视图
 * @module SystemDetailView
 */

import { SYSTEM_VIEW_CONFIG } from './constants'

/**
 * 消息项组件
 */
function MessageItem({ msg }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--c-border)', padding: '14px 0', cursor: 'pointer',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: `${msg.color}15`, border: `1px solid ${msg.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {msg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{msg.title}</span>
          <span style={{ fontSize: 11, color: 'var(--c-text3)', flexShrink: 0 }}>{msg.time}</span>
        </div>
        <div style={{ fontSize: 12, color: msg.read ? 'var(--c-text3)' : 'var(--c-text)' }}>
          {msg.msg}
        </div>
      </div>
    </div>
  )
}

/**
 * 系统消息详情视图
 * @param {Object} props
 * @param {string} props.systemView - 当前视图类型
 * @param {Object} props.messages - 各类型消息数据
 * @param {Function} props.onBack - 返回回调
 */
export function SystemDetailView({ systemView, messages, onBack }) {
  const config = SYSTEM_VIEW_CONFIG[systemView]
  if (!config) return null

  const messageList = messages[systemView] || []
  const { title, icon, color } = config

  return (
    <>
      {/* 返回按钮 */}
      <div
        style={{
          padding: '12px 16px', borderBottom: '1px solid var(--c-border)',
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        }}
        onClick={onBack}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-text2)" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span style={{ fontSize: 14, color: 'var(--c-text2)' }}>返回</span>
      </div>

      {/* 标题 */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${color}15`, border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)' }}>{title}</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>共 {messageList.length} 条消息</div>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{ padding: '0 16px' }}>
        {messageList.map(msg => (
          <MessageItem key={msg.id} msg={msg} />
        ))}
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>没有更多消息了</div>
        </div>
      </div>
    </>
  )
}
