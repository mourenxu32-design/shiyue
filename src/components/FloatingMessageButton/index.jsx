/**
 * 悬浮消息按钮 - 主组件
 * 
 * 功能：
 * - 可拖拽悬浮按钮，支持自动吸附边缘
 * - 5秒无操作后自动隐藏 2/3 到屏幕外
 * - 点击展开 2/3 屏幕大弹窗（消息 + 好友）
 * - 支持多层页面嵌套和手机返回键后退
 * 
 * @module FloatingMessageButton
 */

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../App'

// 常量和数据
import { BUTTON_SIZE, MESSAGE_CATEGORIES, SYSTEM_VIEW_CONFIG } from './constants'
import { conversations, systemMessages, taskMessages, interactMessages, defaultFriends, defaultGroups } from './mockData'

// 工具函数
import { calculateHideOffset, filterFriends, countUnread } from './utils'

// 自定义 Hooks
import { useDraggable, useAutoHide, useBackNavigation } from './hooks'

// 子组件
import { MessageList } from './MessageList'
import { FriendList } from './FriendList'
import { AddFriendModal } from './AddFriendModal'
import { SystemDetailView } from './SystemDetailView'

/**
 * 可拖拽悬浮消息按钮组件
 */
export default function FloatingMessageButton() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'

  // ===== 拖拽相关状态 =====
  const {
    position,
    isDragging,
    handlePointerDown: onPointerDown,
    handlePointerMove,
    handlePointerUp: onPointerUp,
  } = useDraggable()

  const { isHidden, resetHideTimer } = useAutoHide()

  // ===== 弹窗相关状态 =====
  const [isExpanded, setIsExpanded] = useState(false)
  const [mainTab, setMainTab] = useState('msg')
  const [systemView, setSystemView] = useState('overview')

  // ===== 好友相关状态 =====
  const [friends, setFriends] = useState(defaultFriends)
  const [activeGroup, setActiveGroup] = useState('全部')
  const [friendSearch] = useState('')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendName, setNewFriendName] = useState('')

  // ===== 未读统计 =====
  const chatUnread = conversations.reduce((sum, c) => sum + c.unread, 0)
  const systemUnread = countUnread(systemMessages)
  const taskUnread = countUnread(taskMessages)
  const interactUnread = countUnread(interactMessages)
  const totalUnread = systemUnread + taskUnread + interactUnread + chatUnread

  // ===== 消息数据集合 =====
  const allMessages = {
    notifications: systemMessages,
    tasks: taskMessages,
    interactions: interactMessages,
  }

  // ===== 过滤好友 =====
  const filteredFriends = filterFriends(friends, activeGroup, friendSearch)

  // ===== 拖拽事件处理 =====
  /** 处理按钮按下事件，启动拖拽 */
  const handlePointerDown = useCallback((e) => {
    onPointerDown(e, resetHideTimer)
  }, [onPointerDown, resetHideTimer])

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e) => handlePointerMove(e, resetHideTimer)
      const upHandler = () => {
        const result = onPointerUp(resetHideTimer)
        if (result?.clicked) {
          setIsExpanded(prev => !prev)
        }
      }
      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseup', upHandler)
      window.addEventListener('touchmove', moveHandler, { passive: false })
      window.addEventListener('touchend', upHandler)
      return () => {
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', upHandler)
        window.removeEventListener('touchmove', moveHandler)
        window.removeEventListener('touchend', upHandler)
      }
    }
  }, [isDragging, handlePointerMove, onPointerUp, resetHideTimer])

  // ===== 弹窗控制 =====
  /** 关闭主弹窗并重置隐藏计时器 */
  const closeModal = useCallback(() => {
    setIsExpanded(false)
    resetHideTimer()
  }, [resetHideTimer])

  /**
   * 多层级返回逻辑
   * - 若添加好友弹窗打开，则关闭它
   * - 若在系统消息详情视图，则返回概览
   * - 否则关闭主弹窗
   */
  const goBack = useCallback(() => {
    if (showAddFriend) {
      setShowAddFriend(false)
    } else if (systemView !== 'overview') {
      setSystemView('overview')
    } else {
      closeModal()
    }
  }, [showAddFriend, systemView, closeModal])

  // 返回键导航
  useBackNavigation(isExpanded, showAddFriend, systemView, goBack)

  // ===== 好友操作 =====
  /** 添加新好友到好友列表并关闭弹窗 */
  const handleAddFriend = useCallback(() => {
    if (!newFriendName.trim()) return
    const name = newFriendName.trim()
    setFriends(prev => [...prev, {
      id: prev.length + 1,
      name,
      avatar: name.charAt(0),
      gender: 'male',
      online: Math.random() > 0.5,
      group: '常用搭档',
    }])
    setNewFriendName('')
    setShowAddFriend(false)
  }, [newFriendName])

  // ===== 渲染辅助函数 =====
  /** 渲染弹窗头部（标题、操作按钮、Tab 切换器） */
  const renderHeader = () => {
    const showBackButton = systemView !== 'overview'
    const title = showBackButton
      ? SYSTEM_VIEW_CONFIG[systemView]?.title
      : (mainTab === 'msg' ? '消息' : '好友')

    return (
      <div style={{ flexShrink: 0, padding: '16px 16px 10px', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-text)' }}>
            {showBackButton ? (
              <span onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {title}
              </span>
            ) : title}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {mainTab === 'msg' && systemView === 'overview' && (
              <span style={{
                fontSize: 12, color: '#2563EB', cursor: 'pointer', fontWeight: 600,
                padding: '4px 10px', borderRadius: 8, background: 'rgba(37,99,235,0.08)',
              }}>全部已读</span>
            )}
            {mainTab === 'friends' && (
              <span
                onClick={() => setShowAddFriend(true)}
                style={{
                  fontSize: 12, color: '#10B981', cursor: 'pointer', fontWeight: 600,
                  padding: '4px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.08)',
                }}
              >+ 添加好友</span>
            )}
            <span
              onClick={closeModal}
              style={{
                width: 28, height: 28, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                color: 'var(--c-text2)', fontSize: 16, cursor: 'pointer',
              }}
            >✕</span>
          </div>
        </div>

        {/* Tab 切换器 */}
        {systemView === 'overview' && (
          <div style={{ display: 'flex', gap: 0, background: 'var(--c-input)', borderRadius: 12, padding: 3 }}>
            {[
              { id: 'msg', label: '消息', badge: totalUnread },
              { id: 'friends', label: '好友', badge: friends.length },
            ].map(t => {
              const isActive = mainTab === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setMainTab(t.id)}
                  style={{
                    flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                    background: isActive ? 'var(--c-card)' : 'transparent',
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all .2s', fontSize: 14, fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--c-text)' : 'var(--c-text3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  {t.label}
                  {t.badge > 0 && (
                    <span style={{
                      minWidth: 16, height: 16, borderRadius: 8, padding: '0 5px',
                      background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#fff',
                      fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{t.badge}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  /** 渲染消息分类快捷入口（系统通知/任务动态/互动消息） */
  const renderMessageCategories = () => (
    <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--c-border)' }}>
      {MESSAGE_CATEGORIES.map(entry => {
        const unread = {
          notifications: systemUnread,
          tasks: taskUnread,
          interactions: interactUnread,
        }[entry.key]
        return (
          <div
            key={entry.key}
            onClick={() => setSystemView(entry.key)}
            style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `${entry.color}15`, border: `1px solid ${entry.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 6px', position: 'relative',
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, display: 'block' }} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
                  background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{unread}</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-text2)', fontWeight: 500 }}>{entry.label}</div>
          </div>
        )
      })}
    </div>
  )

  /**
   * 渲染主弹窗内容区
   * - 系统消息详情视图（非 overview 状态）
   * - 消息 Tab：分类入口 + 聊天列表
   * - 好友 Tab：统计 + 分组筛选 + 好友列表
   */
  const renderContent = () => {
    if (systemView !== 'overview') {
      return <SystemDetailView systemView={systemView} messages={allMessages} onBack={goBack} />
    }

    if (mainTab === 'msg') {
      return (
        <>
          {renderMessageCategories()}
          <MessageList
            conversations={conversations}
            onAvatarClick={(conv) => openSubPage('user-profile', { user: conv.user })}
            onItemClick={(conv) => { closeModal(); openSubPage('chat', conv) }}
          />
        </>
      )
    }

    return (
      <FriendList
        friends={friends}
        filteredFriends={filteredFriends}
        groups={defaultGroups}
        activeGroup={activeGroup}
        onGroupChange={setActiveGroup}
        onAvatarClick={(friend) => openSubPage('user-profile', { user: friend.name })}
        onMessageClick={(friend) => { closeModal(); openSubPage('chat', { user: friend.name, avatar: friend.avatar, task: '私信' }) }}
      />
    )
  }

  // ===== 主渲染 =====
  const hideOffset = calculateHideOffset(position, isHidden, isDragging)

  return (
    <>
      {/* 悬浮按钮 */}
      <div
        style={{
          position: 'fixed',
          left: position.x + hideOffset,
          top: position.y,
          width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2,
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          boxShadow: isDragging ? '0 8px 32px rgba(124,58,237,0.5)' : '0 4px 20px rgba(124,58,237,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: isDragging ? 'grabbing' : 'pointer',
          zIndex: 150, transition: isDragging ? 'none' : 'left .3s ease, box-shadow .2s ease',
          touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12c0 4.418-4.03 8-9 8-1.4 0-2.73-.26-3.91-.73L3 21l1.73-4.09C3.64 15.54 3 13.83 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          <circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none"/>
        </svg>
        {totalUnread > 0 && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
            background: '#EF4444', border: '2px solid var(--c-bg)',
            color: '#fff', fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{totalUnread}</div>
        )}
        {!isDragging && (
          <div style={{
            position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
            fontSize: 9, color: 'var(--c-text2)', whiteSpace: 'nowrap', opacity: 0.6,
          }}>可拖动</div>
        )}
      </div>

      {/* 主弹窗 */}
      {isExpanded && (
        <>
          <div
            onClick={goBack}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              zIndex: 148, animation: 'fadeIn .2s ease',
            }}
          />
          <div style={{
            position: 'fixed', left: '50%', top: '50%',
            width: '66.7vw', height: '66.7vh',
            transform: 'translate(-50%, -50%)',
            background: 'var(--c-bg)', borderRadius: 24, zIndex: 149,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'scaleCenter .3s cubic-bezier(.16,1,.3,1)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
          }}>
            {renderHeader()}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {renderContent()}
            </div>
          </div>
        </>
      )}

      {/* 添加好友弹窗 */}
      {showAddFriend && (
        <AddFriendModal
          newFriendName={newFriendName}
          onNameChange={setNewFriendName}
          onAdd={handleAddFriend}
          onCancel={() => setShowAddFriend(false)}
        />
      )}
    </>
  )
}
