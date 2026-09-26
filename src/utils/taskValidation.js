/**
 * 揭榜校验工具函数
 * cosplay & 兼工阁 金额限制规则
 */

// 核心规则配置
export const BOARD_LIMITS = {
  cos:   { freeMaxAmount: 60,  freeDaily: 3, monthDaily: 10, quarterDaily: 18, yearDaily: null, yearParallel: 8 },
  craft: { freeMaxAmount: 100, freeDaily: 3, monthDaily: 10, quarterDaily: 18, yearDaily: null, yearParallel: 8 },
}

// 日发布限制
export const PUBLISH_LIMITS = {
  cos:   { free: 2, month: 5, quarter: 10, year: 20 },
  craft: { free: 2, month: 5, quarter: 10, year: 20 },
}

// 错误码
export const ERROR_CODES = {
  COS_OVER_LIMIT:   { code: 20011, msg: 'cosplay任务超过60元需开通会员接取' },
  CRAFT_OVER_LIMIT: { code: 20012, msg: '兼工阁任务超过100元需开通会员接取' },
}

/**
 * 判断免费用户是否被金额限制拦截
 * @param {string} board - 'cos' | 'craft'
 * @param {number} amount - 任务金额
 * @param {string} memberType - 'free' | 'month' | 'quarter' | 'year'
 * @returns {{ blocked: boolean, code?: number, msg?: string }}
 */
export function checkAmountLimit(board, amount, memberType) {
  // 校园兼职板块不做金额限制
  if (board !== 'cos' && board !== 'craft') return { blocked: false }

  // 会员用户（月卡/季卡/年卡）不限金额
  if (memberType && memberType !== 'free') return { blocked: false }

  const limit = BOARD_LIMITS[board]
  if (!limit) return { blocked: false }

  if (amount > limit.freeMaxAmount) {
    const err = board === 'cos' ? ERROR_CODES.COS_OVER_LIMIT : ERROR_CODES.CRAFT_OVER_LIMIT
    return { blocked: true, code: err.code, msg: err.msg }
  }

  return { blocked: false }
}

/**
 * 判断任务是否对免费用户锁定（展示用）
 */
export function isTaskLockedForFree(board, amount) {
  if (board !== 'cos' && board !== 'craft') return false
  const limit = BOARD_LIMITS[board]
  if (!limit) return false
  return amount > limit.freeMaxAmount
}

/**
 * 获取板块金额限制描述
 */
export function getLimitDesc(board) {
  if (board === 'cos') return '免费用户限≤60元'
  if (board === 'craft') return '免费用户限≤100元'
  return ''
}
