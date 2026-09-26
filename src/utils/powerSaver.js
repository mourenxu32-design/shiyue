/**
 * 莳约 App 电量优化策略
 * 
 * 本模块提供统一的电量优化机制，包括：
 * 1. 页面可见性检测
 * 2. 请求动画帧节流
 * 3. 后台任务暂停
 * 4. 懒加载辅助工具
 */

// 页面可见性管理
export const VisibilityManager = {
  // 当前是否可见
  isVisible: !document.hidden,
  
  // 监听列表
  listeners: new Set(),
  
  // 初始化监听器
  init() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
    // 页面失去焦点时也暂停（用户切换应用）
    window.addEventListener('blur', () => {
      this.isVisible = false
      this.notifyAll('pause')
    })
    
    // 页面重新聚焦
    window.addEventListener('focus', () => {
      this.isVisible = true
      this.notifyAll('resume')
    })
  },
  
  // 处理可见性变化
  handleVisibilityChange() {
    const wasVisible = this.isVisible
    this.isVisible = !document.hidden
    
    if (!wasVisible && this.isVisible) {
      this.notifyAll('resume')
    } else if (wasVisible && !this.isVisible) {
      this.notifyAll('pause')
    }
  },
  
  // 通知所有监听器
  notifyAll(action) {
    this.listeners.forEach(callback => callback(action))
  },
  
  // 注册监听器
  subscribe(callback) {
    this.listeners.add(callback)
    // 初始状态立即通知
    setTimeout(() => callback(this.isVisible ? 'resume' : 'pause'), 0)
    return () => this.listeners.delete(callback)
  },
  
  // 停止监听
  unsubscribe() {
    this.listeners.clear()
  }
}

// 自动初始化
if (typeof document !== 'undefined') {
  VisibilityManager.init()
}

// 节流定时器 Hook（用于 React 组件）
export const useThrottledInterval = (callback, delay, dependencies = []) => {
  // 依赖变化时清除旧定时器
  React.useEffect(() => {
    const timerId = setTimeout(() => {}, 0)
    return () => clearTimeout(timerId)
  }, dependencies)
  
  // 订阅可见性变化
  React.useEffect(() => {
    let intervalId = null
    let pausedDelay = delay
    
    const handleVisibilityChange = (action) => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      
      if (action === 'resume') {
        startTime = Date.now()
        intervalId = setInterval(callback, delay)
      }
    }
    
    const unsubscribe = VisibilityManager.subscribe(handleVisibilityChange)
    
    // 初始启动
    if (VisibilityManager.isVisible) {
      intervalId = setInterval(callback, delay)
    }
    
    return () => {
      unsubscribe()
      if (intervalId) clearInterval(intervalId)
    }
  }, [delay, ...dependencies])
}

// 请求动画帧节流
export const requestIdleCallback = typeof requestIdleCallback !== 'undefined'
  ? requestIdleCallback
  : (callback, timeout) => {
      const start = Date.now()
      return setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
        })
      }, timeout || 1)
    }

// 懒加载辅助函数
export const lazyLoadImages = (observerOptions = {}) => {
  if (typeof IntersectionObserver === 'undefined') return
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.onload = () => img.classList.add('loaded')
        imageObserver.unobserve(img)
      }
    })
  }, {
    rootMargin: '50px 0px', // 预加载视口外 50px 的图片
    threshold: 0.01,
    ...observerOptions
  })
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })
  
  return imageObserver
}

// 暂停/恢复全局动画
const animationRegistry = new Set()

export const AnimationController = {
  pauseAnimations() {
    animationRegistry.forEach(controller => controller.pause())
  },
  
  resumeAnimations() {
    animationRegistry.forEach(controller => controller.resume())
  },
  
  register(controller) {
    animationRegistry.add(controller)
    return () => animationRegistry.delete(controller)
  }
}

// DOM 操作计数器（防止过度重绘）
export const DOMBatcher = {
  pendingUpdates: [],
  flushTimer: null,
  batchMs: 16, // 约 60fps
  
  scheduleUpdate(callback) {
    this.pendingUpdates.push(callback)
    
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushUpdates()
      }, this.batchMs)
    }
  },
  
  flushUpdates() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    
    const updates = [...this.pendingUpdates]
    this.pendingUpdates = []
    
    // 批处理执行
    updates.forEach(cb => cb())
  },
  
  cleanup() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
  }
}

// 性能监控（开发环境）
export const PerformanceMonitor = {
  timers: new Map(),
  
  startTimer(name) {
    if (import.meta.env.DEV) {
      this.timers.set(name, performance.now())
    }
  },
  
  endTimer(name) {
    if (import.meta.env.DEV && this.timers.has(name)) {
      const start = this.timers.get(name)
      const duration = performance.now() - start
      if (duration > 100) {
        console.warn(`[Performance] Long-running operation: ${name} took ${duration.toFixed(2)}ms`)
      }
      this.timers.delete(name)
    }
  },
  
  clear() {
    this.timers.clear()
  }
}

// React 封装 Hook
export function useBatteryStatus() {
  const [isLowPower, setIsLowPower] = React.useState(false)
  const [charging, setCharging] = React.useState(null)
  
  React.useEffect(() => {
    // 电池 API（部分浏览器支持）
    const updateBattery = (battery) => {
      setIsLowPower(battery.level <= 0.20)
      setCharging(battery.charging)
    }
    
    if ('getBattery' in navigator) {
      navigator.getBattery().then(updateBattery).then(battery => {
        battery.addEventListener('levelchange', e => updateBattery(e.target))
        battery.addEventListener('chargingchange', e => updateBattery(e.target))
      })
    }
    
    return () => {} // 清理
  }, [])
  
  return { isLowPower, charging }
}

// 导出
import React from 'react'
