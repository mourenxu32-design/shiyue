import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'
import { isTaskLockedForFree, checkAmountLimit } from '../utils/taskValidation'
import { getBoardStatus, isBoardEnabled, getUserBoardPref, setUserBoardPref, USER_CUSTOMIZABLE_BOARDS } from '../utils/boardStatus'

// 校园板块
const categories = ['全部', '代取快递', '代买代送', '校内跑腿', '占座排队', '技能定制', '闲置出售', '技能服务', '约拍接单', '代跑接单', '更多']

/* 价格配色：悬赏类(接单者赚钱)豆沙色，服务类(发布者收钱)青蓝色 */
const PRICE_EARN = '#C2786A'
const PRICE_SERVICE = '#22B8CF'
const serviceCats = ['闲置出售', '技能服务', '约拍接单', '代跑接单']
const getPriceColor = (cat) => serviceCats.includes(cat) ? PRICE_SERVICE : PRICE_EARN

/* 类目边框色 */
const catBorderColor = {
  // 校园
  '代取快递': '#2563EB', '代买代送': '#0EA5E9', '校内跑腿': '#F59E0B',
  '占座排队': '#EF4444', '技能定制': '#8B5CF6', '闲置出售': '#10B981',
  '技能服务': '#EC4899', '约拍接单': '#F97316', '代跑接单': '#14B8A6',
  // Cosplay
  'Cos妆造': '#E879F9', '道具定制': '#A78BFA', '摄影约拍': '#38BDF8',
  '假发造型': '#FB923C', '服装定制': '#F472B6', '后期修图': '#34D399',
  // 兼工阁
  '建模接单': '#6366F1', '平面设计': '#F43F5E', 'UI设计': '#8B5CF6',
  '视频剪辑': '#F59E0B', '原画插画': '#EC4899', '程序开发': '#10B981',
  '文案写作': '#06B6D4', 'PPT定制': '#EF4444', '翻译服务': '#3B82F6',
  '音频制作': '#A855F7', '数据处理': '#14B8A6',
  // 同城
  '同城跑腿': '#06B6D4', '宠物服务': '#F59E0B',
  '上门维修': '#EF4444', '代驾服务': '#8B5CF6', '搬家帮手': '#F97316',
  '生活管家': '#EC4899', '同城溜娃': '#14B8A6',
}

// 角色扮演板块
const cosCategories = ['全部', 'Cos妆造', '道具定制', '摄影约拍', '假发造型', '服装定制', '后期修图']
// 兼工阁板块
const craftCategories = ['全部', '建模接单', '平面设计', 'UI设计', '视频剪辑', '原画插画', '程序开发', '文案写作', 'PPT定制', '翻译服务', '音频制作', '数据处理']
// 性别映射（API 暂不提供性别字段，保留空映射）
const userGender = {}

/* 性别小图标 */
function GenderIcon({ user, size = 14 }) {
  const g = userGender[user]
  if (!g) return null
  return (
    <div style={{
      width: size, height: size, borderRadius: 4,
      background: g === 'male' ? '#2563EB' : '#EC4899',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'absolute', bottom: -2, left: -2,
      border: '1.5px solid var(--c-card)',
    }}>
      {g === 'male' ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="10" cy="14" r="7"/><path d="M21 3l-6.5 6.5"/><path d="M16 3h5v5"/></svg>
      ) : (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="12" cy="9" r="7"/><path d="M12 16v6"/><path d="M9 19h6"/></svg>
      )}
    </div>
  )
}
const cosWorks = [
  { id: 1, title: '原神纳西妲全套道具', price: 580, author: '手工匠人鹿', img: '🎨' },
  { id: 2, title: '蓝色监狱Cos妆面作品集', price: 80, author: '妆娘小樱', img: '💄' },
  { id: 3, title: 'EVA明日香战斗服定制', price: 1200, author: '裁缝工坊', img: '👗' },
  { id: 4, title: '间谍过家家阿尼亚假发', price: 150, author: '毛娘花花', img: '💇' },
  { id: 5, title: '鬼灭之刃日轮刀金属版', price: 420, author: '铁匠铺', img: '⚔️' },
  { id: 6, title: '外景摄影作品·古风系列', price: 300, author: '摄影师阿光', img: '📷' },
]

/* 板块配色映射 */
const boardTheme = {
  campus: { accent: '#2563EB', label: '校园兼职', icon: '🎓' },
  cos:    { accent: '#A855F7', label: 'Cosplay', icon: '🎭' },
  city:   { accent: '#06B6D4', label: '同城解忧', icon: '📍' },
  craft:  { accent: '#10B981', label: '兼工阁', icon: '🏗️' },
}

// 同城板块
const cityCategories = ['全部', '同城跑腿', '代买代送', '宠物服务', '上门维修', '代驾服务', '搬家帮手', '生活管家', '同城溜娃']

// SOS紧急求救任务（全局显示）
const sosTasks = [
  { id: 'sos_h1', cat: '紧急求救', catTag: 'SOS', title: '夜间独行遇到可疑人员跟踪 求附近人帮助', desc: '已报警但需要平台协助通知附近用户', amount: 0, user: '小林同学', rating: 4.9, time: '2分钟前', remain: '紧急', location: '学校西门外200m', urgent: true, remainMinutes: 5, isSOS: true },
  { id: 'sos_h2', cat: '紧急求救', catTag: 'SOS', title: '图书馆突发身体不适 头晕无法站立', desc: '需要附近同学帮忙叫校医或搀扶', amount: 0, user: '考研小王', rating: 4.7, time: '8分钟前', remain: '紧急', location: '学校图书馆3楼', urgent: true, remainMinutes: 15, isSOS: true },
]

/* 筛选面板组件 */
function FilterPanel({ filters, updateFilter, resetFilters, onClose, accentColor }) {
  const filterOptions = [
    { key: 'time', label: '完成时间', options: ['不限', '1小时内', '今天内', '3天内', '本周内'] },
    { key: 'amount', label: '薪资区间', options: ['不限', '10元以下', '10~50元', '50~200元', '200元以上'] },
    { key: 'distance', label: '距离范围', options: ['不限', '500m内', '1km内', '3km内', '5km内'] },
    { key: 'urgency', label: '紧急程度', options: ['全部', '急单优先', '仅普通'] },
    { key: 'auth', label: '认证状态', options: ['全部', '学生认证', '实名认证'] },
  ]
  return (
    <div style={{ padding: '16px', background: 'var(--c-card)', borderBottom: '1px solid var(--c-border)' }}>
      {filterOptions.map(group => (
        <div key={group.key} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{group.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {group.options.map(opt => {
              const active = filters[group.key] === opt
              return (
                <div key={opt} onClick={() => updateFilter(group.key, opt)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 500,
                    background: active ? accentColor : 'var(--c-input)',
                    color: active ? '#fff' : 'var(--c-text2)',
                    border: active ? `1.5px solid ${accentColor}` : '1.5px solid transparent',
                    transition: 'all .15s',
                  }}>{opt}</div>
              )
            })}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={resetFilters} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid var(--c-border-light)', background: 'transparent', color: 'var(--c-text3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>重置</button>
        <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: accentColor, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>确认</button>
      </div>
    </div>
  )
}

/* 相对时间格式化 */
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

/* 后端任务 → 前端卡片字段映射 */
function mapApiTask(t) {
  const remainMinutes = t.deadline
    ? Math.max(0, Math.floor((new Date(t.deadline).getTime() - Date.now()) / 60000))
    : 9999
  return {
    id: t.id, cat: t.category, catTag: t.cat_tag || t.category,
    title: t.title, desc: t.description,
    amount: Number(t.amount), user: t.publisher_nickname || `用户${t.publisher_id}`,
    rating: 4.8, time: timeAgo(t.created_at),
    remain: t.deadline ? `剩余${remainMinutes < 60 ? remainMinutes + '分钟' : Math.floor(remainMinutes / 60) + '小时'}` : '长期有效',
    location: t.location || '', urgent: t.is_urgent,
    remainMinutes, yearCard: t.is_year_card_only,
    isService: t.is_service, delivery: t.delivery_method,
    board: t.board, images: t.images,
  }
}

export default function HomePage() {
  const { openSubPage, memberType } = useApp()
  const [apiTasks, setApiTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)
  const [boardStatus, setBoardStatusState] = useState(getBoardStatus)
  const [activeBoard, setActiveBoard] = useState('campus')
  const [activeCat, setActiveCat] = useState('全部')
  const [cosSubTab, setCosSubTab] = useState('bounty')
  const [activeCosCat, setActiveCosCat] = useState('全部')
  const [activeCraftCat, setActiveCraftCat] = useState('全部')
  const [activeCityCat, setActiveCityCat] = useState('全部')
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({ time: '不限', amount: '不限', distance: '不限', urgency: '全部', auth: '全部' })
  const [showBoardEditor, setShowBoardEditor] = useState(false)
  const [userPref, setUserPrefState] = useState(getUserBoardPref)

  // 监听板块状态变化（管理端同步）
  useEffect(() => {
    const handler = () => setBoardStatusState(getBoardStatus())
    window.addEventListener('board-status-change', handler)
    return () => window.removeEventListener('board-status-change', handler)
  }, [])

  // 加载当前板块任务列表
  useEffect(() => {
    let cancelled = false
    async function loadTasks() {
      setTasksLoading(true)
      setTasksError(null)
      try {
        const resp = await api.tasks.list({ board: activeBoard, status: 'open', page_size: 50 })
        if (cancelled) return
        const items = resp?.data?.items || []
        setApiTasks(items.map(mapApiTask))
      } catch (err) {
        if (!cancelled) { console.error('[HomePage] 加载任务失败:', err); setTasksError(err.message) }
      } finally {
        if (!cancelled) setTasksLoading(false)
      }
    }
    loadTasks()
    return () => { cancelled = true }
  }, [activeBoard])

  // 监听用户自定义偏好变化
  useEffect(() => {
    const handler = (ev) => setUserPrefState({ ...(ev.detail || getUserBoardPref()) })
    window.addEventListener('user-board-pref-change', handler)
    return () => window.removeEventListener('user-board-pref-change', handler)
  }, [])

  // 当前板块被管理端或用户隐藏时，自动切换到第一个可见板块
  useEffect(() => {
    const isVisible = (id) => boardStatus[id] !== false && userPref[id] !== false
    if (!isVisible(activeBoard)) {
      const firstVisible = Object.keys(boardTheme).find(isVisible)
      if (firstVisible) setActiveBoard(firstVisible)
    }
  }, [boardStatus, userPref, activeBoard])

  const handleBoardClick = (id) => {
    setActiveBoard(id)
    setShowFilter(false)
  }

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== '不限' && v !== '全部').length
  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
  const resetFilters = () => setFilters({ time: '不限', amount: '不限', distance: '不限', urgency: '全部', auth: '全部' })

  const theme = boardTheme[activeBoard]
  const accent = theme.accent

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* ===== Fixed Header ===== */}
      <div style={{ flexShrink: 0 }}>
        {/* Nav Bar */}
        <div style={{ padding: '14px 16px 10px', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
          {/* Top Row: Logo + Search + Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <img
              src="/shop-icon.png"
              alt="商店"
              onClick={() => openSubPage('shop')}
              style={{ width: 34, height: 34, borderRadius: 10, cursor: 'pointer', objectFit: 'cover' }}
            />
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', background: 'var(--c-input)', borderRadius: 12,
              border: '1px solid var(--c-border-light)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input placeholder="搜索任务关键词..." style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--c-text)', fontSize: 14, flex: 1 }} />
              <span style={{ color: 'var(--c-text3)', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--c-card)', border: '1px solid var(--c-border-light)' }}>搜索</span>
            </div>
          </div>

          {/* Board Tabs - 已关闭或被用户隐藏的板块完全隐藏，右侧提供“自定义”按钮 */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--c-input)', borderRadius: 12, padding: 3 }}>
            <div style={{ display: 'flex', flex: 1, gap: 4, minWidth: 0 }}>
              {Object.entries(boardTheme)
                .filter(([id]) => boardStatus[id] !== false && userPref[id] !== false)
                .map(([id, t]) => {
                  const isActive = activeBoard === id
                  return (
                    <div key={id}
                      onClick={() => handleBoardClick(id)}
                      style={{
                        flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        color: isActive ? '#fff' : 'var(--c-text3)',
                        background: isActive ? t.accent : 'transparent',
                        boxShadow: isActive ? `0 2px 12px ${t.accent}44` : 'none',
                        transition: 'all .25s', whiteSpace: 'nowrap',
                      }}>
                      {t.label}
                    </div>
                  )
                })}
            </div>
            <div
              onClick={() => setShowBoardEditor(true)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
                color: 'var(--c-text3)', background: 'var(--c-card)',
                border: '1px solid var(--c-border-light)',
                transition: 'all .2s',
              }}
              title="自定义显示的板块">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
            </div>

            {/* 自定义板块浮层（贴在自定义按钮正下方） */}
            {showBoardEditor && (
              <>
                {/* 全屏透明热区：点击外部关闭 */}
                <div
                  onClick={() => setShowBoardEditor(false)}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 99,
                    background: 'rgba(15,23,42,0.25)',
                  }}
                />
                {/* 浮层主体 */}
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 100,
                  width: 288, background: 'var(--c-card)',
                  borderRadius: 16, padding: '14px 16px 16px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)',
                  border: '1px solid var(--c-border-light)',
                  animation: 'popInDown .18s cubic-bezier(.2,.9,.3,1.2)',
                }}>
                  {/* 指向按钮的小三角 */}
                  <div style={{
                    position: 'absolute', top: -6, right: 14,
                    width: 12, height: 12, background: 'var(--c-card)',
                    transform: 'rotate(45deg)',
                    borderLeft: '1px solid var(--c-border-light)',
                    borderTop: '1px solid var(--c-border-light)',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>自定义首页板块</div>
                    <div
                      onClick={() => setShowBoardEditor(false)}
                      style={{
                        width: 24, height: 24, borderRadius: 12, cursor: 'pointer',
                        background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--c-text3)',
                      }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--c-text3)', marginBottom: 12, lineHeight: 1.5 }}>
                    管理端已关闭的板块不会显示
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                    {USER_CUSTOMIZABLE_BOARDS.map((id) => {
                      const t = boardTheme[id]
                      if (!t) return null
                      const adminEnabled = boardStatus[id] !== false
                      const userVisible = userPref[id] !== false
                      const visibleCount = USER_CUSTOMIZABLE_BOARDS.filter(b => userPref[b] !== false && boardStatus[b] !== false).length
                      const isLastVisible = adminEnabled && userVisible && visibleCount === 1
                      return (
                        <div key={id} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 10,
                          background: 'var(--c-input)',
                          border: '1px solid var(--c-border-light)',
                          opacity: adminEnabled ? 1 : 0.5,
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: `${t.accent}22`, color: t.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, flexShrink: 0,
                          }}>
                            {t.icon || '●'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t.label}</div>
                            <div style={{ fontSize: 10, color: adminEnabled ? 'var(--c-text3)' : '#EF4444', marginTop: 1 }}>
                              {adminEnabled ? '点击切换' : '管理后台已关闭'}
                            </div>
                          </div>
                          <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 22, flexShrink: 0, cursor: adminEnabled && !isLastVisible ? 'pointer' : 'not-allowed' }}>
                            <input
                              type="checkbox"
                              checked={userVisible && adminEnabled}
                              disabled={!adminEnabled || isLastVisible}
                              onChange={(e) => {
                                if (isLastVisible) return
                                setUserBoardPref(id, e.target.checked)
                                setUserPrefState(prev => ({ ...prev, [id]: e.target.checked }))
                              }}
                              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                            />
                            <span style={{
                              position: 'absolute', inset: 0, borderRadius: 11,
                              background: (userVisible && adminEnabled) ? t.accent : 'var(--c-border)',
                              transition: 'background .2s',
                            }} />
                            <span style={{
                              position: 'absolute', top: 2, left: (userVisible && adminEnabled) ? 18 : 2,
                              width: 18, height: 18, borderRadius: '50%', background: 'white',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left .2s',
                            }} />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setShowBoardEditor(false)}
                    style={{
                      width: '100%', padding: 9, marginTop: 12, borderRadius: 10,
                      border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                      color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(37,99,235,0.28)',
                    }}>
                    完成
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== SOS 紧急求救任务卡片（全局显示，红色粗边框） ===== */}
        {boardStatus.sos !== false && sosTasks.length > 0 && (
          <div style={{ padding: '10px 16px 0' }}>
            {sosTasks.map(sos => (
              <div key={sos.id} onClick={() => openSubPage('sos-detail', { ...sos, board: 'sos' })}
                style={{
                  padding: '14px 16px', borderRadius: 14, marginBottom: 8, cursor: 'pointer',
                  background: 'rgba(220,38,38,0.04)',
                  border: '3px solid #DC2626',
                  boxShadow: '0 4px 20px rgba(220,38,38,0.15), inset 0 0 0 1px rgba(220,38,38,0.08)',
                  position: 'relative', overflow: 'hidden',
                  animation: 'sosCardPulse 2s ease-in-out infinite',
                }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, #DC2626, #EF4444, #DC2626)',
                  backgroundSize: '200% 100%',
                  animation: 'sosGradient 2s linear infinite',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                    color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1,
                  }}>🚨 SOS</div>
                  <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>{sos.time}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 6,
                    background: 'rgba(220,38,38,0.1)', color: '#DC2626', fontWeight: 700,
                  }}>{sos.location}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#991B1B', marginBottom: 4, lineHeight: 1.4 }}>{sos.title}</div>
                <div style={{ fontSize: 12, color: '#B91C1C', opacity: 0.8, marginBottom: 10 }}>{sos.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 8,
                      background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 10, fontWeight: 700,
                    }}>{sos.user[0]}</div>
                    <span style={{ fontSize: 12, color: '#991B1B', fontWeight: 600 }}>{sos.user}</span>
                  </div>
                  <div style={{
                    padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                    color: '#fff', boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                  }}>立即响应</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 校园板块头部 ===== */}
        {activeBoard === 'campus' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>最新任务</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />
                {activeFilterCount > 0 && (
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: accent, color: '#fff', fontWeight: 700 }}>{activeFilterCount}项筛选</span>
                )}
              </div>
              <div onClick={() => setShowFilter(!showFilter)} style={{
                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                padding: '6px 14px', borderRadius: 10,
                background: showFilter ? accent : 'var(--c-input)',
                color: showFilter ? '#fff' : 'var(--c-text2)',
                fontSize: 12, fontWeight: 600, position: 'relative',
                border: showFilter ? 'none' : '1px solid var(--c-border-light)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M6 12h12M8 18h8"/></svg>
                <span>筛选</span>
              </div>
            </div>
            {showFilter && (
              <FilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} onClose={() => setShowFilter(false)} accentColor={accent} />
            )}
            <div className="filter-bar">
              {categories.map(cat => (
                <div key={cat} className={`filter-chip ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
                  {cat}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== 角色扮演板块头部 ===== */}
        {activeBoard === 'cos' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 800 }}>{cosSubTab === 'bounty' ? '悬赏求助' : '手作工坊'}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />
              </div>
              <div onClick={() => setShowFilter(!showFilter)} style={{
                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                padding: '6px 14px', borderRadius: 10,
                background: showFilter ? accent : 'var(--c-input)',
                color: showFilter ? '#fff' : 'var(--c-text2)',
                fontSize: 12, fontWeight: 600,
                border: showFilter ? 'none' : '1px solid var(--c-border-light)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M6 12h12M8 18h8"/></svg>
                <span>筛选</span>
              </div>
            </div>
            {showFilter && (
              <FilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} onClose={() => setShowFilter(false)} accentColor={accent} />
            )}
            <div className="sub-tabs">
              <div className={`sub-tab ${cosSubTab === 'bounty' ? 'active' : ''}`} onClick={() => setCosSubTab('bounty')}>悬赏求助</div>
              <div className={`sub-tab ${cosSubTab === 'workshop' ? 'active' : ''}`} onClick={() => setCosSubTab('workshop')}>手作工坊</div>
            </div>
          </>
        )}

        {/* ===== 兼工阁板块头部 ===== */}
        {activeBoard === 'craft' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 800 }}>技能服务</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />
              </div>
              <div onClick={() => setShowFilter(!showFilter)} style={{
                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                padding: '6px 14px', borderRadius: 10,
                background: showFilter ? accent : 'var(--c-input)',
                color: showFilter ? '#fff' : 'var(--c-text2)',
                fontSize: 12, fontWeight: 600,
                border: showFilter ? 'none' : '1px solid var(--c-border-light)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M6 12h12M8 18h8"/></svg>
                <span>筛选</span>
              </div>
            </div>
            {showFilter && (
              <FilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} onClose={() => setShowFilter(false)} accentColor={accent} />
            )}
            <div className="filter-bar">
              {craftCategories.map(cat => (
                <div key={cat} className={`filter-chip ${activeCraftCat === cat ? 'active' : ''}`} onClick={() => setActiveCraftCat(cat)}>
                  {cat}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== 同城板块头部 ===== */}
        {activeBoard === 'city' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 800 }}>同城服务</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />
              </div>
              <div onClick={() => setShowFilter(!showFilter)} style={{
                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                padding: '6px 14px', borderRadius: 10,
                background: showFilter ? accent : 'var(--c-input)',
                color: showFilter ? '#fff' : 'var(--c-text2)',
                fontSize: 12, fontWeight: 600, position: 'relative',
                border: showFilter ? 'none' : '1px solid var(--c-border-light)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M6 12h12M8 18h8"/></svg>
                <span>筛选</span>
              </div>
            </div>
            {showFilter && (
              <FilterPanel filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} onClose={() => setShowFilter(false)} accentColor={accent} />
            )}
            <div className="filter-bar">
              {cityCategories.map(cat => (
                <div key={cat} className={`filter-chip ${activeCityCat === cat ? 'active' : ''}`} onClick={() => setActiveCityCat(cat)}>
                  {cat}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== 校园板块：任务列表 ===== */}
      {activeBoard === 'campus' && (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80, WebkitOverflowScrolling: 'touch' }}>
          {/* 官方任务卡片 — 流光边框（受板块管理控制） */}
          {boardStatus.official !== false && <div style={{ padding: '12px 16px 0' }}>
            <div className="official-task-card" style={{ padding: '16px' }} onClick={() => openSubPage('official-task-detail')}>
              <div className="official-task-glow" />
              <div style={{ position: 'relative', zIndex: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="official-task-badge">🎁 官方活动</span>
                    <span style={{ fontSize: 11, color: 'var(--c-text3)' }}>截止 2025-12-31</span>
                  </div>
                  <div className="official-task-reward">¥5/人</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 6 }}>邀请好友赚现金</div>
                <div style={{ fontSize: 12, color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 12 }}>
                  邀请好友注册莳约App，每成功邀请一人并完成实名认证，立得 <span style={{ color: '#FF0080', fontWeight: 700 }}>¥5</span> 现金奖励，上不封顶！
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--c-text3)' }}>
                    <span>👥 已有 <strong style={{ color: 'var(--c-text)' }}>1,523</strong> 人参与</span>
                    <span>💰 已发放 <strong style={{ color: '#22C55E' }}>¥7,615</strong></span>
                  </div>
                  <div style={{
                    padding: '6px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff',
                    background: 'linear-gradient(135deg, #FF0080, #FF8C00)',
                    boxShadow: '0 4px 12px rgba(255,0,128,0.3)',
                  }}>立即参与 →</div>
                </div>
              </div>
            </div>
          </div>}

          {tasksLoading ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 90, margin: '8px 16px', borderRadius: 14, background: 'var(--c-input)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />)}
            </div>
          ) : tasksError ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--c-text3)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>!</div>
              <div style={{ fontSize: 13 }}>加载失败：{tasksError}</div>
            </div>
          ) : apiTasks.filter(t => activeCat === '全部' || t.cat === activeCat).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text3)', fontSize: 13 }}>暂无「{activeCat}」相关任务</div>
          ) : apiTasks
            .filter(t => activeCat === '全部' || t.cat === activeCat)
            .sort((a, b) => {
              if (a.urgent && !b.urgent) return -1
              if (!a.urgent && b.urgent) return 1
              if (a.urgent && b.urgent) return (a.remainMinutes || 0) - (b.remainMinutes || 0)
              return 0
            })
            .map(task => (
            <div key={task.id} className="task-card" style={{ borderLeft: `3px solid ${catBorderColor[task.cat] || 'var(--c-border)'}` }} onClick={() => openSubPage('detail', task)}>
              <div className="task-card-header" style={{ marginBottom: 8 }}>
                <div className="task-card-user">
                  <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => { e.stopPropagation(); openSubPage('user-profile', { user: task.user }) }}>
                    <div className="task-card-avatar" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', fontSize: 11, fontWeight: 700 }}>{task.user[0]}</div>
                    <GenderIcon user={task.user} size={14} />
                  </div>
                  <span className="task-card-name" style={{ fontWeight: 600, color: 'var(--c-text)' }}>{task.user}</span>
                  <div className="task-card-rating" style={{ color: '#F59E0B' }}>★ {task.rating}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {task.urgent && <span className="urgent-badge">⚡ 急</span>}
                  <span className="tag" style={{ fontSize: 10, background: `${accent}18`, color: accent }}>{task.catTag}</span>
                </div>
              </div>
              <div className="task-card-title">{task.title}</div>
              <div className="task-card-meta">
                <span>{task.location}</span>
                <span style={{ color: task.remain.includes('15分') || task.remain.includes('45分') ? '#EF4444' : 'var(--c-text2)' }}>{task.remain}</span>
              </div>
              <div className="task-card-footer">
                <div className="task-card-amount" style={{ color: getPriceColor(task.cat) }}>¥{task.amount}</div>
                <button className="reveal-btn" style={{ background: accent }}>揭榜</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== 角色扮演：悬赏求助 ===== */}
      {activeBoard === 'cos' && cosSubTab === 'bounty' && (
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="filter-bar">
            {cosCategories.map(cat => (
              <div key={cat} className={`filter-chip ${activeCosCat === cat ? 'active' : ''}`} onClick={() => setActiveCosCat(cat)}>
                {cat}
              </div>
            ))}
          </div>
          <div style={{ paddingBottom: 12 }}>
            {apiTasks.filter(t => activeCosCat === '全部' || t.cat === activeCosCat).map(task => {
              const locked = isTaskLockedForFree('cos', task.amount) && memberType === 'free'
              return (
                <div key={task.id} className="task-card" style={{ borderLeft: `3px solid ${catBorderColor[task.cat] || '#A855F7'}` }} onClick={() => openSubPage('detail', { ...task, board: 'cos' })}>
                  {locked && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700 }}>🔒 限会员</div>}
                  <div className="task-card-header" style={{ marginBottom: 8 }}>
                    <div className="task-card-user">
                      <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => { e.stopPropagation(); openSubPage('user-profile', { user: task.user }) }}>
                        <div className="task-card-avatar" style={{ background: 'linear-gradient(135deg, #A855F7, #EC4899)', fontSize: 11, fontWeight: 700 }}>{task.user[0]}</div>
                        <GenderIcon user={task.user} size={14} />
                      </div>
                      <span className="task-card-name" style={{ fontWeight: 600, color: 'var(--c-text)' }}>{task.user}</span>
                      <div className="task-card-rating" style={{ color: '#F59E0B' }}>★ {task.rating}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span className="tag tag-gray" style={{ fontSize: 10 }}>{task.delivery}</span>
                      <span className="tag tag-purple" style={{ fontSize: 10 }}>{task.catTag}</span>
                    </div>
                  </div>
                  <div className="task-card-title">{task.title}</div>
                  <div className="task-card-meta">
                    <span>{task.location}</span>
                    <span>{task.remain}</span>
                  </div>
                  <div className="task-card-footer">
                    <div className="task-card-amount">¥{task.amount}</div>
                    {locked ? (
                      <button className="reveal-btn" style={{ background: '#444', color: '#888', cursor: 'not-allowed', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}
                        onClick={(e) => { e.stopPropagation(); openSubPage('member') }}>
                        🔒 需会员
                      </button>
                    ) : (
                      <button className="reveal-btn" style={{ background: accent }}>揭榜</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== 角色扮演：手作工坊 ===== */}
      {activeBoard === 'cos' && cosSubTab === 'workshop' && (
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 0' }}>
          <div className="work-grid">
            {cosWorks.map(work => (
              <div key={work.id} className="work-card">
                <div className="work-card-img">
                  <span style={{ fontSize: 36 }}>{work.img}</span>
                </div>
                <div className="work-card-info">
                  <div className="work-card-title">{work.title}</div>
                  <div className="work-card-price">¥{work.price}<span style={{ fontSize: 11, color: 'var(--c-text3)', fontWeight: 400 }}> 起</span></div>
                  <div className="work-card-author">{work.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 兼工阁：任务列表 ===== */}
      {activeBoard === 'craft' && (
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 0' }}>
          {apiTasks.filter(t => activeCraftCat === '全部' || t.cat === activeCraftCat).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text3)', fontSize: 13 }}>
              暂无「{activeCraftCat}」相关任务
            </div>
          ) : apiTasks.filter(t => activeCraftCat === '全部' || t.cat === activeCraftCat).map(t => {
            const locked = isTaskLockedForFree('craft', t.amount) && memberType === 'free'
            return (
              <div key={t.id} className="task-card" style={{ borderLeft: `3px solid ${catBorderColor[t.cat] || '#10B981'}` }} onClick={() => openSubPage('detail', { ...t, board: 'craft' })}>
                {locked && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700 }}>🔒 限会员</div>}
                <div className="task-card-header" style={{ marginBottom: 8 }}>
                  <div className="task-card-user">
                    <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => { e.stopPropagation(); openSubPage('user-profile', { user: t.user }) }}>
                      <div className="task-card-avatar" style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)', fontSize: 11, fontWeight: 700 }}>{t.user[0]}</div>
                      <GenderIcon user={t.user} size={14} />
                    </div>
                    <span className="task-card-name" style={{ fontWeight: 600, color: 'var(--c-text)' }}>{t.user}</span>
                    <div className="task-card-rating" style={{ color: '#F59E0B' }}>★ {t.rating}</div>
                  </div>
                  <span className="tag" style={{ fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>{t.cat}</span>
                </div>
                <div className="task-card-title">{t.title}</div>
                <div className="task-card-meta">
                  <span>⏰ {t.deadline}</span>
                  <span>{t.time}</span>
                </div>
                <div className="task-card-footer">
                  <div className="task-card-amount" style={{ color: getPriceColor(t.cat) }}>¥{t.amount}</div>
                  {locked ? (
                    <button className="reveal-btn" style={{ background: '#444', color: '#888', cursor: 'not-allowed', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}
                      onClick={(e) => { e.stopPropagation(); openSubPage('member') }}>
                      🔒 需会员
                    </button>
                  ) : (
                    <button className="reveal-btn" style={{ background: accent }}>揭榜</button>
                  )}
                </div>
              </div>
            )
          })}
          {apiTasks.filter(t => activeCraftCat === '全部' || t.cat === activeCraftCat).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text3)', fontSize: 13 }}>
              暂无「{activeCraftCat}」相关任务
            </div>
          )}
        </div>
      )}

      {/* ===== 同城：任务列表 ===== */}
      {activeBoard === 'city' && (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80, WebkitOverflowScrolling: 'touch' }}>
          {apiTasks
            .filter(t => activeCityCat === '全部' || t.cat === activeCityCat)
            .sort((a, b) => {
              if (a.urgent && !b.urgent) return -1
              if (!a.urgent && b.urgent) return 1
              if (a.urgent && b.urgent) return (a.remainMinutes || 0) - (b.remainMinutes || 0)
              return 0
            })
            .map(task => (
            <div key={task.id} className="task-card" style={{ borderLeft: `3px solid ${catBorderColor[task.cat] || '#06B6D4'}` }} onClick={() => openSubPage('detail', { ...task, board: 'city' })}>
              <div className="task-card-header" style={{ marginBottom: 8 }}>
                <div className="task-card-user">
                  <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => { e.stopPropagation(); openSubPage('user-profile', { user: task.user }) }}>
                    <div className="task-card-avatar" style={{ background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', fontSize: 11, fontWeight: 700 }}>{task.user[0]}</div>
                    <GenderIcon user={task.user} size={14} />
                  </div>
                  <span className="task-card-name" style={{ fontWeight: 600, color: 'var(--c-text)' }}>{task.user}</span>
                  <div className="task-card-rating" style={{ color: '#F59E0B' }}>★ {task.rating}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {task.urgent && <span className="urgent-badge">⚡ 急</span>}
                  <span className="tag" style={{ fontSize: 10, background: `${accent}18`, color: accent }}>{task.catTag}</span>
                </div>
              </div>
              <div className="task-card-title">{task.title}</div>
              <div className="task-card-meta">
                <span>📍 {task.location}</span>
                <span style={{ color: task.remain.includes('30分') ? '#EF4444' : 'var(--c-text2)' }}>{task.remain}</span>
              </div>
              <div className="task-card-footer">
                <div className="task-card-amount" style={{ color: getPriceColor(task.cat) }}>¥{task.amount}</div>
                <button className="reveal-btn" style={{ background: accent }}>揭榜</button>
              </div>
            </div>
          ))}
          {apiTasks.filter(t => activeCityCat === '全部' || t.cat === activeCityCat).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text3)', fontSize: 13 }}>
              暂无「{activeCityCat}」相关任务
            </div>
          )}
        </div>
      )}

      {/* FAB 发悬赏按钮 */}
      <div
        onClick={() => openSubPage('publish')}
        style={{
          position: 'absolute', bottom: 24, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(245,158,11,0.4)',
          cursor: 'pointer', zIndex: 20, transition: 'all .2s',
        }}>
        <span style={{ color: 'white', fontSize: 28, fontWeight: 300, lineHeight: 1 }}>+</span>
      </div>
    </div>
  )
}
