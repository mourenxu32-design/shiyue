/**
 * 悬浮消息按钮 - 自定义 Hooks
 * @module hooks
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { BUTTON_SIZE, HIDE_DELAY_MS, DRAG_THRESHOLD } from './constants'
import { loadPosition, savePosition, getPointerCoords, clampPosition, calculateSnapPosition } from './utils'

/**
 * 拖拽逻辑 Hook
 * @returns {Object}
 */
export const useDraggable = () => {
  const [position, setPosition] = useState(loadPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0, moved: false })

  const handlePointerDown = useCallback((e, resetHideTimer) => {
    e.preventDefault()
    resetHideTimer()
    const { clientX, clientY } = getPointerCoords(e)
    dragStart.current = { x: clientX, y: clientY, startX: position.x, startY: position.y, moved: false }
    setIsDragging(true)
  }, [position])

  const handlePointerMove = useCallback((e, resetHideTimer) => {
    if (!isDragging) return
    const { clientX, clientY } = getPointerCoords(e)
    const dx = clientX - dragStart.current.x
    const dy = clientY - dragStart.current.y
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragStart.current.moved = true
    }
    const { x, y } = clampPosition(dragStart.current.startX + dx, dragStart.current.startY + dy)
    setPosition(prev => ({ ...prev, x, y }))
    resetHideTimer()
  }, [isDragging])

  const handlePointerUp = useCallback((resetHideTimer) => {
    if (!isDragging) return
    setIsDragging(false)
    if (!dragStart.current.moved) {
      return { clicked: true }
    }
    const newPos = calculateSnapPosition(position)
    setPosition(newPos)
    savePosition(newPos)
    resetHideTimer()
    return { clicked: false }
  }, [isDragging, position])

  return {
    position,
    setPosition,
    isDragging,
    dragStart,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}

/**
 * 自动隐藏逻辑 Hook
 * @returns {Object}
 */
export const useAutoHide = () => {
  const [isHidden, setIsHidden] = useState(false)
  const hideTimer = useRef(null)

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setIsHidden(false)
    hideTimer.current = setTimeout(() => {
      setIsHidden(true)
    }, HIDE_DELAY_MS)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [resetHideTimer])

  return { isHidden, resetHideTimer }
}

/**
 * 手机返回键后退逻辑 Hook
 * @param {boolean} isExpanded - 弹窗是否展开
 * @param {boolean} showAddFriend - 添加好友弹窗是否显示
 * @param {string} systemView - 当前系统视图
 * @param {Function} onBack - 后退回调
 */
export const useBackNavigation = (isExpanded, showAddFriend, systemView, onBack) => {
  const wasExpandedRef = useRef(false)

  useEffect(() => {
    if (isExpanded) {
      wasExpandedRef.current = true
      window.history.pushState({ page: 'modal' }, '')
    } else if (wasExpandedRef.current && !isExpanded) {
      if (window.history.state?.page === 'modal') {
        window.history.back()
      }
      wasExpandedRef.current = false
    }

    const handlePopState = () => {
      if (!isExpanded) return
      onBack()
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isExpanded])
}
