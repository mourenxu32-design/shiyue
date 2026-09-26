/**
 * 悬浮消息按钮 - 好友列表组件
 * @module FriendList
 */

import { FriendAvatar } from './FriendAvatar'

/**
 * 好友统计卡片
 */
function FriendStats({ total, online }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--c-border)' }}>
      <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: 'var(--c-card)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2563EB' }}>{total}</div>
        <div style={{ fontSize: 10, color: 'var(--c-text3)', marginTop: 2 }}>好友总数</div>
      </div>
      <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: 'var(--c-card)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981' }}>{online}</div>
        <div style={{ fontSize: 10, color: 'var(--c-text3)', marginTop: 2 }}>在线好友</div>
      </div>
    </div>
  )
}

/**
 * 分组筛选器
 */
function GroupFilter({ groups, activeGroup, onGroupChange, friendCounts }) {
  return (
    <div style={{ display: 'flex', padding: '10px 16px', gap: 6, borderBottom: '1px solid var(--c-border)', overflowX: 'auto' }}>
      {groups.map(g => {
        const isActive = activeGroup === g
        const count = friendCounts[g] || 0
        return (
          <div key={g} onClick={() => onGroupChange(g)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: isActive ? '#2563EB' : 'rgba(37,99,235,0.06)',
            color: isActive ? '#fff' : 'var(--c-text3)',
            display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {g}
            <span style={{
              minWidth: 14, height: 14, borderRadius: 7,
              background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(37,99,235,0.15)',
              color: isActive ? '#fff' : 'var(--c-text3)',
              fontSize: 9, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
            }}>{count}</span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * 好友列表项
 */
function FriendItem({ friend, idx, onAvatarClick, onMessageClick }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '12px 0',
      borderBottom: '1px solid var(--c-border)',
    }}>
      <FriendAvatar friend={friend} idx={idx} onClick={() => onAvatarClick(friend)} />
      <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{friend.name}</span>
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 5,
            background: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 500,
          }}>{friend.group}</span>
        </div>
        <div style={{ fontSize: 11, color: friend.online ? '#10B981' : 'var(--c-text3)', marginTop: 2 }}>
          {friend.online ? '在线' : '离线'}
        </div>
      </div>
      <div onClick={() => onMessageClick(friend)} style={{
        width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
    </div>
  )
}

/**
 * 好友列表组件
 * @param {Object} props
 * @param {Array} props.friends - 好友列表
 * @param {Array} props.filteredFriends - 过滤后的好友列表
 * @param {Array} props.groups - 分组列表
 * @param {string} props.activeGroup - 当前分组
 * @param {Function} props.onGroupChange - 分组切换回调
 * @param {Function} props.onAvatarClick - 头像点击回调
 * @param {Function} props.onMessageClick - 消息按钮点击回调
 */
export function FriendList({
  friends,
  filteredFriends,
  groups,
  activeGroup,
  onGroupChange,
  onAvatarClick,
  onMessageClick,
}) {
  // 计算各分组的好友数量
  const friendCounts = groups.reduce((acc, g) => {
    acc[g] = g === '全部' ? friends.length : friends.filter(f => f.group === g).length
    return acc
  }, {})

  const onlineCount = friends.filter(f => f.online).length

  return (
    <>
      <FriendStats total={friends.length} online={onlineCount} />
      <GroupFilter
        groups={groups}
        activeGroup={activeGroup}
        onGroupChange={onGroupChange}
        friendCounts={friendCounts}
      />
      <div style={{ padding: '0 16px' }}>
        {filteredFriends.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text3)', fontSize: 13 }}>
            该分组暂无好友
          </div>
        )}
        {filteredFriends.map((friend, idx) => (
          <FriendItem
            key={friend.id}
            friend={friend}
            idx={idx}
            onAvatarClick={onAvatarClick}
            onMessageClick={onMessageClick}
          />
        ))}
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--c-text3)', fontWeight: 500 }}>共 {friends.length} 位好友</div>
        </div>
      </div>
    </>
  )
}
