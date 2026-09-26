import React from 'react'

/**
 * 全局错误边界组件
 * 捕获子组件渲染异常，展示友好回退界面，防止白屏崩溃
 */

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
    if (typeof window.__SENTRY__ !== 'undefined') {
      window.__SENTRY__.captureException(error, { extra: errorInfo })
    }
  }

  handleReload = () => window.location.reload()

  handleReset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: 32, textAlign: 'center',
          background: 'var(--bg, #f8fafc)', color: 'var(--text, #1e293b)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
            页面出现了意外错误
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-sub, #64748b)', marginBottom: 20, maxWidth: 300 }}>
            {this.state.error?.message || '未知错误，请稍后重试'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={this.handleReset} style={{
              padding: '10px 28px', borderRadius: 10, border: '1px solid #e2e8f0',
              background: '#fff', color: '#475569', fontSize: 14, cursor: 'pointer', fontWeight: 500,
            }}>
              重试
            </button>
            <button onClick={this.handleReload} style={{
              padding: '10px 28px', borderRadius: 10, border: 'none',
              background: '#2563eb', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 500,
            }}>
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
