/**
 * 悬浮消息按钮 - 好友头像组件
 * @module FriendAvatar
 */

import { AVATAR_GRADIENTS } from './constants'

/**
 * @typedef {Object} FriendAvatarProps
 * @property {Object} friend - 好友或会话对象
 * @property {number} idx - 索引（用于确定渐变色）
 * @property {number} [size=42] - 头像尺寸
 * @property {Function} [onClick] - 点击回调
 */

/**
 * 好友头像组件
 * @param {FriendAvatarProps} props
 */
export function FriendAvatar({ friend, idx, size = 42, onClick }) {
  const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
  const fontSize = size * 0.35
  const borderRadius = size / 3

  return (
    <div
      style={{ position: 'relative', flexShrink: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div style={{
        width: size, height: size, borderRadius,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize, fontWeight: 700,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        {friend.avatar}
      </div>
      {friend.online && (
        <span style={{
          position: 'absolute', bottom: -1, right: -1,
          width: 10, height: 10, borderRadius: '50%',
          background: '#10B981', border: '2px solid var(--c-card)',
        }} />
      )}
    </div>
  )
}
