import { useState, createContext, useContext, useEffect } from 'react'
import { getBoardStatus, onOpsChange } from './utils/boardStatus'
import SplashPage from './pages/SplashPage'
import HomePage from './pages/HomePage'
import PublishPage from './pages/PublishPage'
import MyTasksPage from './pages/MyTasksPage'
import ExplorePage from './pages/ExplorePage'
import FloatingMessageButton from './components/FloatingMessageButton'
import ProfilePage from './pages/ProfilePage'
import ShopPage from './pages/ShopPage'
import MyPublishedPage from './pages/MyPublishedPage'
import MyReviewsPage from './pages/MyReviewsPage'
import CouponsPage from './pages/CouponsPage'
import AlipayManagePage from './pages/AlipayManagePage'
import UserAgreementPage from './pages/UserAgreementPage'
import TaskDetailPage from './pages/TaskDetailPage'
import SettlementPage from './pages/SettlementPage'
import ChatPage from './pages/ChatPage'
import MemberPage from './pages/MemberPage'
import InvitePage from './pages/InvitePage'
import AuthCenterPage from './pages/AuthCenterPage'
import CreditPage from './pages/CreditPage'
import ForumPage from './pages/ForumPage'
import ForumPostPage from './pages/ForumPostPage'
import ForumCreatePage from './pages/ForumCreatePage'
import UserProfilePage from './pages/UserProfilePage'
import OfficialTaskDetailPage from './pages/OfficialTaskDetailPage'
import SOSDetailPage from './pages/SOSDetailPage'
import StoreHomeTab from './pages/StoreHomeTab'
import OrdersManageTab from './pages/OrdersManageTab'
import RevenueTab from './pages/RevenueTab'
import MerchantProfileTab from './pages/MerchantProfileTab'
// Settings pages
import SettingsPage from './pages/settings/SettingsPage'
import AccountSecurityPage from './pages/settings/AccountSecurityPage'
import PrivacySettingsPage from './pages/settings/PrivacySettingsPage'
import NotificationSettingsPage from './pages/settings/NotificationSettingsPage'
import BlacklistPage from './pages/settings/BlacklistPage'
import GeneralSettingsPage from './pages/settings/GeneralSettingsPage'
import AboutPage from './pages/settings/AboutPage'
import FeedbackPage from './pages/settings/FeedbackPage'
import PurchaseHistoryPage from './pages/settings/PurchaseHistoryPage'
import RealNameAuthPage from './pages/settings/RealNameAuthPage'
import StudentAuthPage from './pages/settings/StudentAuthPage'
import SettingsAlipayPage from './pages/settings/SettingsAlipayPage'
import PrivacyPolicyPage from './pages/settings/PrivacyPolicyPage'
import CommunityRulesPage from './pages/settings/CommunityRulesPage'
import LoginPage from './pages/LoginPage'
import CheckoutPage from './pages/CheckoutPage'
import api, { getToken, clearToken } from './utils/api'

export const AppContext = createContext()
export const useApp = () => useContext(AppContext)

/** 板块 id 到中文名称的映射（用于管理端同步提示） */
const BOARD_CONFIG_LABEL = {
  campus: '校园兼职', cos: 'Cosplay', city: '同城解忧',
  craft: '兼工阁', forum: '四方馆', official: '官方任务',
}

/* Tab Bar SVG Icons */
const TI = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12L12 4l8 8"/><path d="M6 10.5v7a1.5 1.5 0 001.5 1.5h2V15a1 1 0 011-1h3a1 1 0 011 1v4h2a1.5 1.5 0 001.5-1.5v-7"/></svg>,
  tasks: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V2z"/><path d="M9 10l2 2 4-4"/><path d="M9 16h6"/></svg>,
  forum: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-5a1 1 0 011-1h4a1 1 0 011 1v5"/><path d="M9 10h.01M15 10h.01"/></svg>,
  msg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 4.418-4.03 8-9 8-1.4 0-2.73-.26-3.91-.73L3 21l1.73-4.09C3.64 15.54 3 13.83 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/><circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>,
  me: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0116 0v1"/></svg>,
  // 商家模式 Tab 图标
  mStore: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-5h16l1 5"/><path d="M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9"/><path d="M9 21v-6h6v6"/><path d="M3 9h18"/></svg>,
  orders: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>,
  revenue: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>,
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [activeTab, setActiveTab] = useState(() => {
    const storedRole = localStorage.getItem('shiyue-role')
    return storedRole === 'merchant' ? 'm-store' : 'home'
  })
  const [subPageStack, setSubPageStack] = useState([])
  const [navDir, setNavDir] = useState('forward') // 'forward' | 'back'
  const subPage = subPageStack.length > 0 ? subPageStack[subPageStack.length - 1] : null
  const [theme, setTheme] = useState(() => localStorage.getItem('shiyue-theme') || 'dark')
  // 模拟会员状态：free | month | quarter | year
  const [memberType, setMemberType] = useState('free')
  // 用户身份模式：user | merchant
  const [userRole, setUserRoleState] = useState(() => localStorage.getItem('shiyue-role') || 'user')
  const setUserRole = (role) => {
    if (userRole === role) return // 避免重复设置
    setUserRoleState(role)
    localStorage.setItem('shiyue-role', role)
    setActiveTab(role === 'merchant' ? 'm-store' : 'home')
  }
  const [boardStatus, setBoardStatusState] = useState(getBoardStatus)
  const [tabDisabledToast, setTabDisabledToast] = useState('')
  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken())

  // 监听板块状态变化（仅在不活动状态下）
  const [isAppActive, setIsAppActive] = useState(true)
  const [opsToast, setOpsToast] = useState('')
  const [backendOnline, setBackendOnline] = useState(false)
  useEffect(() => {
    const handler = () => {
      setBoardStatusState(getBoardStatus())
      if (!isAppActive) setIsAppActive(true)
    }
    const activeHandler = () => setIsAppActive(true)
    const inactiveHandler = () => setIsAppActive(false)
    window.addEventListener('board-status-change', handler)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) setIsAppActive(false)
    })
    window.addEventListener('focus', activeHandler)
    window.addEventListener('blur', inactiveHandler)
    return () => {
      window.removeEventListener('board-status-change', handler)
      window.removeEventListener('focus', activeHandler)
      window.removeEventListener('blur', inactiveHandler)
      document.removeEventListener('visibilitychange', inactiveHandler)
    }
  }, [isAppActive])

  // 监听管理端操作同步通知（BroadcastChannel + storage + 后端轮询三通道）
  useEffect(() => {
    const cleanup = onOpsChange((event) => {
      // 更新后端连接状态
      const online = !event.fallback && !event._fallback
      setBackendOnline(online)
      if (event.type === 'board-status') {
        // 跨 origin 场景下 App 的 localStorage 不会自动同步，
        // 必须根据事件 payload 主动应用变更到本地
        if (event.payload?.status) {
          localStorage.setItem('shiyue_board_status', JSON.stringify(event.payload.status))
        } else if (event.payload?.boardId !== undefined) {
          const current = getBoardStatus()
          current[event.payload.boardId] = event.payload.enabled
          localStorage.setItem('shiyue_board_status', JSON.stringify(current))
        }
        // 刷新板块状态并派发自定义事件给子组件（HomePage 等）
        const next = getBoardStatus()
        setBoardStatusState(next)
        window.dispatchEvent(new CustomEvent('board-status-change', { detail: next }))
        // 只弹近期事件的浮层（10 秒内），避免启动时回放历史事件刷出一堆旧通知
        const isRecent = event.ts && (Date.now() - event.ts) < 10000
        if (isRecent) {
          const action = event.payload?.enabled ? '开启' : '关闭'
          const label = BOARD_CONFIG_LABEL[event.payload?.boardId] || event.payload?.boardId || '板块'
          setOpsToast(`管理后台已${action}「${label}」`)
          setTimeout(() => setOpsToast(''), 3000)
        }
      }
    })
    return cleanup
  }, [])

  // 四方馆被关闭时，如果当前在四方馆页面，自动切回首页
  useEffect(() => {
    if (activeTab === 'forum' && boardStatus.forum === false) {
      setActiveTab(userRole === 'merchant' ? 'm-store' : 'home')
    }
  }, [boardStatus, activeTab, userRole])

  // 监听板块状态变化（仅在页面活跃时）
  useEffect(() => {
    let mounted = true
    const timer = setInterval(() => {
      if (mounted && isAppActive) {
        setBoardStatusState(getBoardStatus())
      }
    }, 5000) // 改为 5 秒间隔而非频繁检查
    
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [isAppActive])

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
  }

  const toggleTheme = (t) => {
    setTheme(t)
    localStorage.setItem('shiyue-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  useEffect(() => {
    // 3s动画 + 2s停留 = 5s后开始渐隐
    const t1 = setTimeout(() => setSplashFading(true), 5000)
    // 5s + 0.5s渐隐 = 5.5s后移除启动页
    const t2 = setTimeout(() => {
      setShowSplash(false)
      // 启动页结束后检查登录状态
      if (!getToken()) {
        setSubPageStack([{ type: 'login' }])
      }
    }, 5500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const openSubPage = (type, data) => {
    if (type === null) { setSubPageStack([]); setNavDir('back'); return }
    setNavDir('forward')
    setSubPageStack(prev => [...prev, { type, data }])
    window.history.pushState({ page: type }, '')
  }
  const closeSubPage = () => {
    setNavDir('back')
    setSubPageStack(prev => prev.slice(0, -1))
  }

  // 监听浏览器/手机返回键
  useEffect(() => {
    const handlePopState = () => {
      if (subPageStack.length > 0) {
        setNavDir('back')
        setSubPageStack(prev => prev.slice(0, -1))
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [subPageStack.length])

  const renderSubPage = () => {
    if (!subPage) return null
    const style = { height: '100%', animation: `${navDir === 'forward' ? 'slideInRight' : 'slideInLeft'} .25s ease` }
    switch (subPage.type) {
      case 'detail': return <div style={style}><TaskDetailPage data={subPage.data} onBack={closeSubPage} /></div>
      case 'settle': return <div style={style}><SettlementPage data={subPage.data} onBack={closeSubPage} /></div>
      case 'chat': return <div style={style}><ChatPage data={subPage.data} onBack={closeSubPage} /></div>
      case 'member': return <div style={style}><MemberPage onBack={closeSubPage} /></div>
      case 'invite': return <div style={style}><InvitePage onBack={closeSubPage} /></div>
      case 'auth': return <div style={style}><AuthCenterPage onBack={closeSubPage} /></div>
      case 'credit': return <div style={style}><CreditPage onBack={closeSubPage} /></div>
      case 'forum-post': return <div style={style}><ForumPostPage data={subPage.data} onBack={closeSubPage} /></div>
      case 'forum-create': return <div style={style}><ForumCreatePage data={subPage.data} onBack={closeSubPage} /></div>
      case 'user-profile': return <div style={style}><UserProfilePage data={subPage.data} onBack={closeSubPage} /></div>
      case 'official-task-detail': return <div style={style}><OfficialTaskDetailPage onBack={closeSubPage} /></div>
      case 'sos-detail': return <div style={style}><SOSDetailPage data={subPage.data} onBack={closeSubPage} /></div>
      case 'publish': return <div style={style}><PublishPage data={subPage.data} /></div>
      case 'shop': return <div style={style}><ShopPage /></div>
      case 'published': return <div style={style}><MyPublishedPage /></div>
      case 'reviews': return <div style={style}><MyReviewsPage /></div>
      case 'coupons': return <div style={style}><CouponsPage /></div>
      case 'alipay': return <div style={style}><AlipayManagePage /></div>
      case 'agreement': return <div style={style}><UserAgreementPage /></div>
      // Settings pages
      case 'settings': return <div style={style}><SettingsPage /></div>
      case 'settings-account': return <div style={style}><AccountSecurityPage /></div>
      case 'settings-privacy': return <div style={style}><PrivacySettingsPage /></div>
      case 'settings-notify': return <div style={style}><NotificationSettingsPage /></div>
      case 'settings-blacklist': return <div style={style}><BlacklistPage /></div>
      case 'settings-general': return <div style={style}><GeneralSettingsPage /></div>
      case 'settings-about': return <div style={style}><AboutPage /></div>
      case 'settings-feedback': return <div style={style}><FeedbackPage /></div>
      case 'settings-purchase': return <div style={style}><PurchaseHistoryPage /></div>
      case 'settings-auth': return <div style={style}><RealNameAuthPage /></div>
      case 'settings-student': return <div style={style}><StudentAuthPage /></div>
      case 'settings-alipay': return <div style={style}><SettingsAlipayPage /></div>
      case 'privacy-policy': return <div style={style}><PrivacyPolicyPage /></div>
      case 'community-rules': return <div style={style}><CommunityRulesPage /></div>
      case 'login': return <div style={style}><LoginPage /></div>
      case 'checkout': return <div style={style}><CheckoutPage data={subPage.data} /></div>
      default: return null
    }
  }

  if (showSplash) return <SplashPage fading={splashFading} />

  if (subPage) {
    return (
      <AppContext.Provider value={{ openSubPage, closeSubPage, activeTab, setActiveTab, theme, toggleTheme, memberType, setMemberType, userRole, setUserRole, backendOnline }}>
        <div className="app-shell">
          <div key={subPageStack.length} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{renderSubPage()}</div>
        </div>
      </AppContext.Provider>
    )
  }

  // 用户模式 Tab（消息已改为探遇）
  const userTabs = [
    { id: 'home', icon: TI.home, label: '首页', color: '#2563EB' },
    { id: 'tasks', icon: TI.tasks, label: '我的任务', color: '#10B981' },
    ...(boardStatus.forum !== false ? [{ id: 'forum', icon: TI.forum, label: '四方馆', color: '#F59E0B' }] : []),
    { id: 'explore', icon: TI.msg, label: '探遇', color: '#A855F7' },
    { id: 'me', icon: TI.me, label: '我的', color: '#EC4899' },
  ]

  // 商家模式 Tab
  const merchantTabs = [
    { id: 'm-store', icon: TI.mStore, label: '店铺主页', color: '#2563EB' },
    { id: 'm-orders', icon: TI.orders, label: '订单详情', color: '#22C55E' },
    { id: 'm-revenue', icon: TI.revenue, label: '店铺收益', color: '#F59E0B' },
    { id: 'm-profile', icon: TI.me, label: '我的', color: '#A855F7' },
  ]

  const tabs = userRole === 'merchant' ? merchantTabs : userTabs

  const isDark = theme === 'dark'
  const tabBarBg = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)'
  const tabBarBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const activeColor = isDark ? '#2563EB' : '#2563EB'
  const inactiveColor = isDark ? '#475569' : '#94A3B8'

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage />
      case 'forum': return <ForumPage />
      case 'tasks': return <MyTasksPage />
      case 'explore': return <ExplorePage />
      case 'me': return <ProfilePage />
      case 'm-store': return <StoreHomeTab />
      case 'm-orders': return <OrdersManageTab />
      case 'm-revenue': return <RevenueTab />
      case 'm-profile': return <MerchantProfileTab />
      default: return <HomePage />
    }
  }

  const currentTabColor = tabs.find(t => t.id === activeTab)?.color || '#2563EB'

  return (
    <AppContext.Provider value={{ openSubPage, closeSubPage, activeTab, setActiveTab, theme, toggleTheme, memberType, setMemberType, userRole, setUserRole, backendOnline }}>
      <div className="app-shell">
        <div className="page-body">
          {renderPage()}
        </div>
        <div style={{ background: tabBarBg, borderTop: `1px solid ${tabBarBorder}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }} className="tab-bar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            const tabColor = tab.color
            // 中心发布按钮特殊样式
            if (tab.isCenter) {
              return (
                <div key={tab.id} className="tab-item"
                  onClick={() => openSubPage('publish')}
                  style={{ position: 'relative' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', marginTop: -10,
                    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                  }}>
                    {tab.icon}
                  </div>
                  <span className="tab-label" style={{ color: tabColor, fontWeight: 700 }}>{tab.label}</span>
                </div>
              )
            }
            return (
              <div key={tab.id} className={`tab-item ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  color: isActive ? tabColor : inactiveColor,
                  position: 'relative',
                }}>
                {isActive && <div style={{
                  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                  width: 20, height: 3, borderRadius: 2,
                  background: `linear-gradient(90deg, ${tabColor}, ${tabColor}AA)`,
                }} />}
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s', transform: isActive ? 'scale(1.1)' : 'scale(1)', position: 'relative' }}>
                  {tab.icon}
                </span>
                <span className="tab-label">{tab.label}</span>
                {tab.badge && <span className="tab-badge" />}
              </div>
            )
          })}
        </div>

        {/* 悬浮消息按钮（仅用户模式显示） */}
        {userRole === 'user' && <FloatingMessageButton />}

        {/* 底部Tab禁用提示 */}
        {tabDisabledToast && (
          <div style={{
            position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            padding: '12px 24px', borderRadius: 16, textAlign: 'center', zIndex: 200,
            animation: 'fadeIn .2s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>该功能未开，敬请期待</div>
          </div>
        )}

        {/* 管理端操作同步提示 */}
        {opsToast && (
          <div style={{
            position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            padding: '10px 20px', borderRadius: 14, zIndex: 300,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            animation: 'fadeIn .2s ease', whiteSpace: 'nowrap',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{opsToast}</span>
          </div>
        )}
      </div>
    </AppContext.Provider>
  )
}
