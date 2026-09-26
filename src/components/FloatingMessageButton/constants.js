/**
 * 悬浮消息按钮 - 常量配置
 * @module constants
 */

/** 按钮尺寸 */
export const BUTTON_SIZE = 56

/** 自动隐藏延迟时间（毫秒） */
export const HIDE_DELAY_MS = 5000

/** 拖拽判定阈值（像素） */
export const DRAG_THRESHOLD = 3

/** 按钮距离底部的最小边距（像素） */
export const BOTTOM_MARGIN = 60

/** 按钮初始隐藏偏移量比例 */
export const HIDE_OFFSET_RATIO = 2 / 3

/** localStorage 存储键名 */
export const STORAGE_KEY = 'floating-msg-btn'

/** 默认按钮位置 */
export const DEFAULT_POSITION = {
  x: typeof window !== 'undefined' ? window.innerWidth - BUTTON_SIZE : 0,
  y: typeof window !== 'undefined' ? window.innerHeight - 200 : 0,
  side: 'right',
}

/** 板块颜色映射 */
export const BOARD_COLORS = {
  campus: '#2563EB',
  cos: '#A855F7',
  craft: '#10B981',
}

/** 头像渐变色数组 */
export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #2563EB, #7C3AED)',
  'linear-gradient(135deg, #10B981, #06B6D4)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #A855F7, #EC4899)',
  'linear-gradient(135deg, #3B82F6, #10B981)',
  'linear-gradient(135deg, #F97316, #F59E0B)',
]

/** 系统视图类型配置 */
export const SYSTEM_VIEW_CONFIG = {
  notifications: {
    title: '系统通知',
    icon: '🔧',
    color: '#10B981',
  },
  tasks: {
    title: '任务动态',
    icon: '✅',
    color: '#A855F7',
  },
  interactions: {
    title: '互动消息',
    icon: '❤️',
    color: '#2563EB',
  },
}

/** 消息分类入口配置 */
export const MESSAGE_CATEGORIES = [
  { key: 'notifications', label: '系统通知', color: '#10B981' },
  { key: 'tasks', label: '任务动态', color: '#A855F7' },
  { key: 'interactions', label: '互动消息', color: '#2563EB' },
]
