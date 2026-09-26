import { useState, useEffect } from 'react'

/**
 * 页面可见性检测 Hook（省电策略）
 * @returns {boolean} true = 页面可见/活跃，false = 页面隐藏/非活跃
 */
export function usePageVisibility() {
  const [visible, setVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => setVisible(!document.hidden)
    
    document.addEventListener('visibilitychange', handleVisibilityChange, false)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return visible
}

/**
 * 节流定时器 Hook（仅在页面可见时运行）
 * @param {Function} callback 回调函数
 * @param {number} delay 延迟（毫秒）
 * @param {boolean} enabled 是否启用
 * @returns {void}
 */
export function useInterval(callback, delay, enabled = true) {
  const savedCallback = useState(() => callback)[0]
  
  // 替换新的回调
  savedCallback.current = callback

  useEffect(() => {
    if (!enabled || document.hidden) return
    
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay, enabled])
}

/**
 * 当页面隐藏时暂停定时器的 Hook
 * @param {Function} callback 回调函数
 * @param {number} delay 延迟（毫秒）
 * @returns {void}
 */
export function usePausedWhileHidden(callback, delay) {
  const isVisible = usePageVisibility()
  
  useEffect(() => {
    if (!isVisible) return
    
    const timerId = setInterval(callback, delay)
    return () => clearInterval(timerId)
  }, [callback, delay, isVisible])
}
