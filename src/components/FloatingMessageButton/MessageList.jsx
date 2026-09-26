/**
 * 悬浮消息按钮 - 消息列表组件
 * @module MessageList
 */

import { FriendAvatar } from './FriendAvatar'
import { BOARD_COLORS } from './constants'

/**
 * 消息列表项组件
 * @param {Object} props
 * @param {Object} props.conv - 会话对象
 * @param {number} props.idx - 索引
 * @param {Function} props.onAvatarClick - 头像点击回调
 * @param {Function} props.onItemClick - 列表项点击回调
 */
function ConversationItem({ conv, idx, onAvatarClick, onItemClick }) {
  const accent = BOARD_COLORS[conv.board] || '#2563EB'

  return (
    <div style={{
      borderBottom: '1px solid var(--c-border)', padding: '12px 0', cursor: 'pointer',
      display: 'flex', alignItems: 'flex-start', gap: 0,
    }}>
      <FriendAvatar
        friend={conv}
        idx={idx}
        onClick={(e) => { e.stopPropagation(); onAvatarClick(conv) }}
      />
      <div onClick={() => onItemClick(conv)} style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{conv.user}</span>
          <span style={{ fontSize: 11, color: 'var(--c-text3)', flexShrink: 0 }}>{conv.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 5,
            background: `${accent}18`, color: accent, fontWeight: 600, flexShrink: 0,
          }}>{conv.task}</span>
          <span style={{
            fontSize: 12, color: conv.unread > 0 ? 'var(--c-text)' : 'var(--c-text3)',
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{conv.lastMsg}</span>
          {conv.unread > 0 && (
            <span style={{
              background: '#2563EB', color: '#fff', borderRadius: 10,
              minWidth: 18, height: 18, padding: '0 5px', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{conv.unread}</span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 消息列表组件
 * @param {Object} props
 * @param {Array} props.conversations - 会话列表
 * @param {Function} props.onAvatarClick - 头像点击回调
 * @param {Function} props.onItemClick - 列表项点击回调
 */
export function MessageList({ conversations, onAvatarClick, onItemClick }) {
  return (
    <div style={{ padding: '0 16px' }}>
      {conversations.map((conv, idx) => (
        <ConversationItem
          key={conv.id}
          conv={conv}
          idx={idx}
          onAvatarClick={onAvatarClick}
          onItemClick={onItemClick}
        />
      ))}
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>没有更多消息了</div>
      </div>
    </div>
  )
}
