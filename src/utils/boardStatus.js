/**
 * @module boardStatus
 * @description 板块状态管理 - 控制 App 端各板块的显示/隐藏
 *
 * 板块状态由管理后台设置，App 端读取并监听变更。
 * 通过 BroadcastChannel 和 storage 事件双重接收管理端的变更通知。
 */

/** @type {string} localStorage 中存储板块状态的键名 */
const STORAGE_KEY = 'shiyue_board_status'

/** @type {string} localStorage 中存储用户自定义板块显示偏好的键名（仅用户本人控制，独立于管理端） */
const USER_PREF_KEY = 'shiyue_user_board_pref'

/** 用户可自定义显示/隐藏的板块列表（其他板块不允许用户控制） */
export const USER_CUSTOMIZABLE_BOARDS = ['campus', 'cos', 'city', 'craft']

/** @type {string} localStorage 中存储同步时间戳的键名 */
const SYNC_TIMESTAMP_KEY = 'shiyue_ops_timestamp'

/** @type {string} BroadcastChannel 通道名（同 origin tab 间通信） */
const OPS_CHANNEL = 'shiyue_ops_channel'

/**
 * @typedef {Object} BoardConfig
 * @property {string} id - 板块唯一标识
 * @property {string} label - 板块显示名称
 * @property {string} icon - 板块图标
 * @property {string} color - 板块主题色
 * @property {string} desc - 板块描述
 */

/** @type {BoardConfig[]} 所有板块配置 */
export const BOARD_CONFIG = [
  { id: 'campus', label: '校园兼职', icon: '🎓', color: '#2563EB', desc: '代取快递、跑腿、技能服务等校园生活服务' },
  { id: 'cos', label: 'Cosplay', icon: '🎭', color: '#A855F7', desc: 'Cos妆造、道具定制、摄影约拍等二次元委托' },
  { id: 'city', label: '同城解忧', icon: '📍', color: '#06B6D4', desc: '同城跑腿、代买代送、上门维修、宠物服务等本地生活服务' },
  { id: 'craft', label: '兼工阁', icon: '🏗️', color: '#10B981', desc: '建模、设计、开发、写作、剪辑等技能接单服务' },
  { id: 'forum', label: '四方馆', icon: '🏛️', color: '#F59E0B', desc: '校园论坛社区，发帖互动交流' },
  { id: 'official', label: '官方任务', icon: '🎁', color: '#EC4899', desc: '官方活动任务，邀请好友奖励等' },
]

/**
 * @typedef {Object.<string, boolean>} BoardStatusMap
 * @description 板块 id 到是否启用的映射
 */

/**
 * 获取所有板块的启用状态
 * @returns {BoardStatusMap} 板块状态对象，键为板块 id，值为是否启用
 */
export function getBoardStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* 解析失败时回退到默认状态 */
  }
  const status = {}
  BOARD_CONFIG.forEach((b) => {
    status[b.id] = true
  })
  return status
}

/**
 * 设置单个板块的启用/禁用状态并持久化
 * @param {string} boardId - 板块 id
 * @param {boolean} enabled - 是否启用
 * @returns {BoardStatusMap} 更新后的完整状态
 */
export function setBoardEnabled(boardId, enabled) {
  const status = getBoardStatus()
  status[boardId] = enabled
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status))
  window.dispatchEvent(new CustomEvent('board-status-change', { detail: status }))
  return status
}

/**
 * 检查板块是否启用（仅考虑管理端状态）
 * @param {string} boardId - 板块 id
 * @returns {boolean}
 */
export function isBoardEnabled(boardId) {
  const status = getBoardStatus()
  return status[boardId] !== false
}

/**
 * 读取用户自定义的板块显示偏好（仅用户本人控制，本地存储）
 * @returns {Object.<string, boolean>} 板块 id 到是否显示的映射
 */
export function getUserBoardPref() {
  try {
    const raw = localStorage.getItem(USER_PREF_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* 解析失败时回退默认全部显示 */
  }
  const pref = {}
  USER_CUSTOMIZABLE_BOARDS.forEach((id) => { pref[id] = true })
  return pref
}

/**
 * 设置单个板块的用户显示偏好并持久化
 * @param {string} boardId - 板块 id（必须在 USER_CUSTOMIZABLE_BOARDS 中）
 * @param {boolean} visible - 是否显示
 */
export function setUserBoardPref(boardId, visible) {
  if (!USER_CUSTOMIZABLE_BOARDS.includes(boardId)) return
  const pref = getUserBoardPref()
  pref[boardId] = visible
  localStorage.setItem(USER_PREF_KEY, JSON.stringify(pref))
  window.dispatchEvent(new CustomEvent('user-board-pref-change', { detail: pref }))
}

/**
 * 注册管理端操作变更监听器（App 端使用）
 *
 * 三通道并行接收：
 *   1. BroadcastChannel（同 origin tab 即时通知）
 *   2. storage 事件（同 origin 跨 tab 通知）
 *   3. 后端 /api/ops/poll 轮询（跨 origin 跨设备同步）
 *
 * @param {(event: { type: string, payload: Object, ts: number }) => void} callback - 变更回调
 * @param {Object} [options={}] - 配置项
 * @param {number} [options.pollIntervalMs=3000] - 后端轮询间隔（ms），设为 0 禁用
 * @returns {() => void} 取消监听的清理函数
 */
export function onOpsChange(callback, options = {}) {
  const pollIntervalMs = options.pollIntervalMs ?? 3000

  // 通道 1：BroadcastChannel 监听（同 origin 即时通知）
  let channel = null
  try {
    channel = new BroadcastChannel(OPS_CHANNEL)
    channel.onmessage = (ev) => {
      if (ev.data?.type) callback(ev.data)
    }
  } catch {
    /* 部分环境不支持 BroadcastChannel 时静默回退 */
  }

  // 通道 2：storage 事件监听（跨 tab 通知）
  const onStorage = (ev) => {
    if (ev.key === SYNC_TIMESTAMP_KEY && ev.newValue) {
      try {
        const data = JSON.parse(ev.newValue)
        if (data?.type) callback(data)
      } catch {
        /* 忽略解析错误 */
      }
    }
  }
  window.addEventListener('storage', onStorage)

  // 通道 3：后端轮询（跨 origin 跨设备同步）
  // 初始 ts = 0，首次 poll 拉取后端所有事件，后续用后端响应的 ts 递增拉取
  let lastPollTs = 0
  let pollTimer = null
  const dedupeMap = new Map() // 去重：相同 type+payload+ts 的事件只触发一次

  const poll = async () => {
    try {
      const { default: api } = await import('./api')
      const res = await api.ops.poll(lastPollTs)
      const events = res?.data?.events || []
      events.forEach((ev) => {
        const key = `${ev.type}::${JSON.stringify(ev.payload)}::${ev.ts}`
        if (dedupeMap.has(key)) return
        dedupeMap.set(key, true)
        callback(ev)
      })
      if (res?.data?.ts) lastPollTs = res.data.ts
      // 去重表超过 200 条时清空，防止内存增长
      if (dedupeMap.size > 200) dedupeMap.clear()
    } catch {
      /* 后端未启动时静默降级 */
    }
  }

  if (pollIntervalMs > 0) {
    pollTimer = setInterval(poll, pollIntervalMs)
    // 首次立即轮询一次，尽快拉取管理端启动以来的历史变更
    setTimeout(poll, 500)
  }

  // 返回清理函数
  return () => {
    if (channel) channel.close()
    if (pollTimer) clearInterval(pollTimer)
    window.removeEventListener('storage', onStorage)
  }
}
