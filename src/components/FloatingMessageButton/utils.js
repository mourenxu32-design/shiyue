/**
 * 悬浮消息按钮 - 工具函数
 * @module utils
 */

import { STORAGE_KEY, DEFAULT_POSITION, BUTTON_SIZE, HIDE_OFFSET_RATIO, BOTTOM_MARGIN } from './constants'

/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 * @property {'left'|'right'} side
 */

/**
 * 从 localStorage 读取保存的位置
 * @returns {Position}
 */
export const loadPosition = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // 解析失败，返回默认位置
    }
  }
  return DEFAULT_POSITION
}

/**
 * 保存位置到 localStorage
 * @param {Position} pos
 */
export const savePosition = (pos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
}

/**
 * 计算隐藏偏移量
 * @param {Position} position - 当前位置
 * @param {boolean} isHidden - 是否隐藏
 * @param {boolean} isDragging - 是否正在拖拽
 * @returns {number}
 */
export const calculateHideOffset = (position, isHidden, isDragging) => {
  if (!isHidden || isDragging) return 0
  const offset = BUTTON_SIZE * HIDE_OFFSET_RATIO
  return position.side === 'left' ? -offset : offset
}

/**
 * 计算拖拽后的新位置（自动吸附边缘）
 * @param {Position} position - 当前位置
 * @returns {Position}
 */
export const calculateSnapPosition = (position) => {
  const centerX = position.x + BUTTON_SIZE / 2
  const newSide = centerX < window.innerWidth / 2 ? 'left' : 'right'
  const newX = newSide === 'left' ? 0 : window.innerWidth - BUTTON_SIZE
  return { x: newX, y: position.y, side: newSide }
}

/**
 * 获取指针事件的坐标
 * @param {MouseEvent|TouchEvent} e
 * @returns {{clientX: number, clientY: number}}
 */
export const getPointerCoords = (e) => {
  if (e.touches) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
  }
  return { clientX: e.clientX, clientY: e.clientY }
}

/**
 * 限制坐标在屏幕范围内
 * @param {number} x
 * @param {number} y
 * @returns {{x: number, y: number}}
 */
export const clampPosition = (x, y) => {
  const maxX = window.innerWidth - BUTTON_SIZE
  const maxY = window.innerHeight - BUTTON_SIZE - BOTTOM_MARGIN
  return {
    x: Math.max(0, Math.min(maxX, x)),
    y: Math.max(BOTTOM_MARGIN, Math.min(maxY, y)),
  }
}

/**
 * 计算未读消息总数
 * @param {Array} messages - 消息数组
 * @returns {number}
 */
export const countUnread = (messages) => messages.filter(m => !m.read).length

/**
 * 过滤好友列表
 * @param {Array} friends - 好友列表
 * @param {string} activeGroup - 当前分组
 * @param {string} searchKeyword - 搜索关键词
 * @returns {Array}
 */
export const filterFriends = (friends, activeGroup, searchKeyword) => {
  return friends.filter(f => {
    const matchGroup = activeGroup === '全部' || f.group === activeGroup
    const matchSearch = !searchKeyword || f.name.includes(searchKeyword)
    return matchGroup && matchSearch
  })
}
