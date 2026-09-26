import { useState, useMemo, useCallback, useEffect } from 'react'
import { useApp } from '../App'
import api from '../utils/api'

/* ====== 图标 ====== */
const I = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  clock: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  cart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  bike: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>,
  arrowDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,

  fire: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-4-2-5 3 2 4 5 4 7a6 6 0 0 1-12 0c0-5 6-7 6-12z"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

/* ====== 金刚区分类图标（线性 SVG） ====== */
const categoryIcons = {
  推荐: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.45L16.18 20 12 16.77 7.82 20l1.09-6.28L4 9.27l5.91-1.01L12 2z"/>
    </svg>
  ),
  快餐: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16c0-4-3.5-7-8-7s-8 3-8 7z"/>
      <rect x="3" y="14" width="18" height="2.5" rx="1"/>
      <path d="M5 18.5h14c0 1-3 2-7 2s-7-1-7-2z"/>
    </svg>
  ),
  饮品: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8l1.5 13h7L17 8"/>
      <path d="M6 8h12"/>
      <line x1="13" y1="3" x2="13" y2="8"/>
      <circle cx="13" cy="3" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  小吃: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v9M12 3v9M17 3v9"/>
      <path d="M4 14h16l-1.5 7H5.5L4 14z"/>
    </svg>
  ),
  甜点: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="18" height="9" rx="2"/>
      <path d="M3 16c3-2 6 1 9-1s6 1 9-1"/>
      <path d="M9 12V9a3 3 0 016 0v3"/>
    </svg>
  ),
  水果: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="7"/>
      <path d="M12 7V4"/>
      <path d="M12 4c2 0 4 1 4 3"/>
    </svg>
  ),
  鲜花: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="2.5"/>
      <ellipse cx="12" cy="4" rx="1.5" ry="2.5"/>
      <ellipse cx="7.5" cy="6.5" rx="1.5" ry="2.5" transform="rotate(60 7.5 6.5)"/>
      <ellipse cx="16.5" cy="6.5" rx="1.5" ry="2.5" transform="rotate(-60 16.5 6.5)"/>
      <ellipse cx="8" cy="12" rx="1.5" ry="2.5" transform="rotate(-60 8 12)"/>
      <ellipse cx="16" cy="12" rx="1.5" ry="2.5" transform="rotate(60 16 12)"/>
      <line x1="12" y1="14.5" x2="12" y2="21"/>
      <path d="M9 18c1-1.5 3-1.5 3 0"/>
    </svg>
  ),
  超市: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h1.5l2.5 10h10l2-7H7.5"/>
      <circle cx="9.5" cy="19" r="1.5"/>
      <circle cx="17" cy="19" r="1.5"/>
    </svg>
  ),
}

/* ====== 金刚区分类 ====== */
const categoryGrid = [
  { key: '推荐', color: '#EF4444' },
  { key: '快餐', color: '#F97316' },
  { key: '饮品', color: '#A855F7' },
  { key: '小吃', color: '#F59E0B' },
  { key: '甜点', color: '#EC4899' },
  { key: '水果', color: '#10B981' },
  { key: '鲜花', color: '#E879A0' },
  { key: '超市', color: '#3B82F6' },
]

/* ====== 排序选项 ====== */
const sortOptions = [
  { key: 'comprehensive', label: '综合排序' },
  { key: 'distance', label: '距离最近' },
  { key: 'rating', label: '评分最高' },
  { key: 'sales', label: '销量最高' },
]

/* ====== 筛选标签 ====== */
const filterTags = ['满减优惠', '免配送费', '新商家', '24小时', '品牌商家']

/* ====== 商家数据 ====== */
const shops = [
  {
    id: 's1', name: '莳约奶茶铺', img: '🧋', rating: 4.8, sales: 524, deliveryTime: 25,
    distance: '1.2km', tag: '饮品', discount: '满30减5', minOrder: 15, deliveryFee: 3,
    deliveryType: '商家配送', isHot: true, isNew: false, isBrand: true,
    products: [
      { id: 'p1', name: '招牌奶茶', price: 12, original: 15, sales: 128, img: '🧋' },
      { id: 'p2', name: '冰美式', price: 10, original: 12, sales: 96, img: '☕' },
      { id: 'p3', name: '芒果班戟', price: 18, original: 22, sales: 42, img: '🥭' },
    ]
  },
  {
    id: 's2', name: '校园炸鸡', img: '🍗', rating: 4.6, sales: 318, deliveryTime: 30,
    distance: '1.5km', tag: '小吃', discount: '满25减3', minOrder: 20, deliveryFee: 2,
    deliveryType: '平台配送', isHot: false, isNew: false, isBrand: false,
    products: [
      { id: 'p4', name: '香辣鸡翅', price: 15, original: 18, sales: 86, img: '🍗' },
      { id: 'p5', name: '炸鸡套餐', price: 28, original: 35, sales: 64, img: '🍱' },
    ]
  },
  {
    id: 's3', name: '水果鲜生', img: '🍓', rating: 4.9, sales: 892, deliveryTime: 20,
    distance: '0.8km', tag: '水果', discount: '满40减8', minOrder: 10, deliveryFee: 0,
    deliveryType: '平台配送', isHot: true, isNew: false, isBrand: true,
    products: [
      { id: 'p6', name: '草莓拼盘', price: 25, original: 32, sales: 203, img: '🍓' },
      { id: 'p7', name: '芒果切块', price: 18, original: 22, sales: 156, img: '🥭' },
      { id: 'p8', name: '西瓜果盘', price: 15, original: 18, sales: 178, img: '🍉' },
    ]
  },
  {
    id: 's4', name: '便利店24H', img: '🏪', rating: 4.7, sales: 1203, deliveryTime: 15,
    distance: '0.5km', tag: '便利店', discount: '满20减2', minOrder: 8, deliveryFee: 1,
    deliveryType: '商家配送', isHot: false, isNew: false, isBrand: false,
    products: [
      { id: 'p9', name: '关东煮', price: 8, original: 10, sales: 412, img: '🍢' },
      { id: 'p10', name: '饭团', price: 6, original: 8, sales: 567, img: '🍙' },
    ]
  },
  {
    id: 's5', name: '鲜花小筑', img: '🌸', rating: 4.8, sales: 156, deliveryTime: 40,
    distance: '2.0km', tag: '鲜花', discount: '满50减10', minOrder: 30, deliveryFee: 5,
    deliveryType: '商家配送', isHot: false, isNew: true, isBrand: false,
    products: [
      { id: 'p11', name: '玫瑰花束', price: 68, original: 88, sales: 34, img: '🌹' },
      { id: 'p12', name: '百合花篮', price: 128, original: 158, sales: 12, img: '💐' },
    ]
  },
  {
    id: 's6', name: '甜品工坊', img: '🍰', rating: 4.7, sales: 445, deliveryTime: 35,
    distance: '1.8km', tag: '甜点', discount: '满35减6', minOrder: 15, deliveryFee: 3,
    deliveryType: '平台配送', isHot: true, isNew: false, isBrand: true,
    products: [
      { id: 'p13', name: '草莓蛋糕', price: 22, original: 28, sales: 89, img: '🍰' },
      { id: 'p14', name: '提拉米苏', price: 25, original: 32, sales: 67, img: '🧁' },
      { id: 'p15', name: '马卡龙套装', price: 35, original: 45, sales: 45, img: '🍪' },
    ]
  },
  {
    id: 's7', name: '快餐一号', img: '🍔', rating: 4.5, sales: 678, deliveryTime: 28,
    distance: '1.0km', tag: '快餐', discount: '满30减5', minOrder: 18, deliveryFee: 2,
    deliveryType: '商家配送', isHot: false, isNew: false, isBrand: false,
    products: [
      { id: 'p16', name: '双层牛肉堡', price: 20, original: 25, sales: 156, img: '🍔' },
      { id: 'p17', name: '鸡肉卷套餐', price: 18, original: 22, sales: 134, img: '🌯' },
    ]
  },
]

export default function ExplorePage() {
  const { theme, openSubPage } = useApp()
  const isDark = theme === 'dark'

  const [activeCategory, setActiveCategory] = useState('推荐')
  const [searchText, setSearchText] = useState('')
  const [activeSort, setActiveSort] = useState('comprehensive')
  const [activeFilters, setActiveFilters] = useState([])
  const [showSortPanel, setShowSortPanel] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [cart, setCart] = useState({})
  const [showCart, setShowCart] = useState(false)
  const [apiShops, setApiShops] = useState(null) // null = 未加载, [] = 空

  // 尝试从 API 加载商家列表（fallback 到本地 mock）
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const resp = await api.merchants.list({ page_size: 50 })
        if (cancelled) return
        const items = resp?.data?.items || []
        if (items.length > 0) {
          setApiShops(items.map(m => ({
            id: String(m.id), name: m.name, img: m.logo_url || '🏪',
            rating: m.rating || 4.5, sales: m.total_sales || 0,
            deliveryTime: m.delivery_time || 30, distance: '',
            tag: m.category || '推荐', discount: m.discount_info || '',
            minOrder: m.min_order || 0, deliveryFee: m.delivery_fee || 0,
            deliveryType: m.delivery_type || '平台配送',
            isHot: !!m.is_hot, isNew: !!m.is_new, isBrand: !!m.is_brand,
            products: [],
          })))
        }
      } catch { /* API 不可用时保持 null，使用本地 mock */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const shopsList = apiShops || shops

  // 主题色变量
  const T = {
    text: isDark ? '#F1F5F9' : '#0F172A',
    sub: isDark ? '#94A3B8' : '#64748B',
    sub2: isDark ? '#64748B' : '#94A3B8',
    card: 'var(--c-card)',
    border: 'var(--c-border)',
    inputBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    tagBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  }

  // 购物车统计
  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const product = shopsList.flatMap(s => s.products).find(p => p.id === id)
      return product ? { ...product, qty } : null
    }).filter(Boolean)
  }, [cart])

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)

  // 购物车操作
  const addToCart = useCallback((productId) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCart(prev => {
      const next = { ...prev }
      if (next[productId] > 1) next[productId]--
      else delete next[productId]
      return next
    })
  }, [])

  // 筛选逻辑
  const filteredShops = useMemo(() => {
    let result = activeCategory === '推荐' ? [...shopsList] : shopsList.filter(s => s.tag === activeCategory)

    // 搜索过滤
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.products.some(p => p.name.toLowerCase().includes(q))
      )
    }

    // 筛选标签
    if (activeFilters.includes('满减优惠')) result = result.filter(s => s.discount)
    if (activeFilters.includes('免配送费')) result = result.filter(s => s.deliveryFee === 0)
    if (activeFilters.includes('新商家')) result = result.filter(s => s.isNew)
    if (activeFilters.includes('24小时')) result = result.filter(s => s.tag === '便利店')
    if (activeFilters.includes('品牌商家')) result = result.filter(s => s.isBrand)

    // 排序
    switch (activeSort) {
      case 'distance': result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'sales': result.sort((a, b) => b.sales - a.sales); break
    }

    return result
  }, [activeCategory, searchText, activeFilters, activeSort])

  const toggleFilter = (tag) => {
    setActiveFilters(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ===== 顶部定位 + 搜索栏 ===== */}
      <div style={{ background: T.card, padding: '10px 16px 12px', flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
        {/* 定位地址 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <span style={{ color: '#2563EB' }}>{I.pin}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>大学城·南门</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.sub} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          <span style={{ fontSize: 11, color: T.sub2, marginLeft: 'auto' }}>5分钟内送达</span>
        </div>
        {/* 搜索框 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 10, background: T.inputBg,
          }}>
            <span style={{ color: T.sub }}>{I.search}</span>
            <input value={searchText} onChange={e => setSearchText(e.target.value)}
              placeholder="搜索商家或商品"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: T.text, fontSize: 14 }}
            />
            {searchText && (
              <span onClick={() => setSearchText('')} style={{ cursor: 'pointer', color: T.sub, display: 'flex' }}>{I.close}</span>
            )}
          </div>
        </div>
      </div>

      {/* ===== 可滚动内容区 ===== */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* 金刚区分类宫格 */}
        <div style={{ background: T.card, padding: '14px 8px 10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 0' }}>
            {categoryGrid.map(c => {
              const isActive = activeCategory === c.key
              return (
                <div key={c.key} onClick={() => setActiveCategory(c.key)} style={{ textAlign: 'center', cursor: 'pointer', padding: '6px 0' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, margin: '0 auto 5px',
                    background: isActive ? `${c.color}14` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'),
                    border: isActive ? `1.5px solid ${c.color}40` : '1.5px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? c.color : (isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93'),
                    transition: 'all .2s',
                  }}>{categoryIcons[c.key]}</div>
                  <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? c.color : T.sub }}>{c.key}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Banner 广告位 */}
        <div style={{ margin: '0 12px 10px', borderRadius: 14, overflow: 'hidden', display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, borderRadius: 12, padding: 14,
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>新客立减</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>首单最高减12元</div>
            </div>
            <div style={{ fontSize: 24 }}>🎁</div>
          </div>
          <div style={{
            flex: 1, borderRadius: 12, padding: 14,
            background: 'linear-gradient(135deg, #10B981, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>满减专区</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>多档满减上不封顶</div>
            </div>
            <div style={{ fontSize: 24 }}>💰</div>
          </div>
        </div>

        {/* ===== 排序筛选栏 ===== */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10, background: T.card,
          display: 'flex', alignItems: 'center', gap: 0, padding: '0 12px',
          borderBottom: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}`,
        }}>
          {sortOptions.map(opt => (
            <div key={opt.key} onClick={() => { setActiveSort(opt.key); setShowSortPanel(false) }} style={{
              flex: 1, textAlign: 'center', padding: '10px 0', cursor: 'pointer',
              fontSize: 13, fontWeight: activeSort === opt.key ? 700 : 500,
              color: activeSort === opt.key ? '#2563EB' : T.sub,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
              {opt.label}
              {opt.key === 'comprehensive' && (
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, marginLeft: 2 }}>
                  <svg width="8" height="6" viewBox="0 0 10 6" fill={activeSort === 'comprehensive' ? '#2563EB' : 'none'} stroke={activeSort === 'comprehensive' ? '#2563EB' : T.sub} strokeWidth="1.5"><polygon points="5 0 10 6 0 6"/></svg>
                  <svg width="8" height="6" viewBox="0 0 10 6" fill="none" stroke={T.sub} strokeWidth="1.5"><polygon points="5 6 10 0 0 0"/></svg>
                </span>
              )}
            </div>
          ))}
          <div onClick={() => setShowFilterPanel(!showFilterPanel)} style={{
            padding: '10px 8px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            color: activeFilters.length > 0 ? '#2563EB' : T.sub,
            display: 'flex', alignItems: 'center', gap: 2, borderLeft: `1px solid ${T.border}`,
          }}>
            筛选
            {activeFilters.length > 0 && (
              <span style={{ minWidth: 16, height: 16, borderRadius: 8, background: '#2563EB', color: '#fff', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilters.length}</span>
            )}
          </div>
        </div>

        {/* 筛选面板 */}
        {showFilterPanel && (
          <div style={{ background: T.card, padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {filterTags.map(tag => {
                const isActive = activeFilters.includes(tag)
                return (
                  <div key={tag} onClick={() => toggleFilter(tag)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: isActive ? '#2563EB' : T.inputBg, color: isActive ? '#fff' : T.sub,
                    transition: 'all .2s',
                  }}>{tag}</div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={() => setActiveFilters([])} style={{
                flex: 1, padding: '9px 0', borderRadius: 10, border: `1px solid ${T.border}`,
                background: 'transparent', color: T.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>清空</button>
              <button onClick={() => setShowFilterPanel(false)} style={{
                flex: 1, padding: '9px 0', borderRadius: 10, border: 'none',
                background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>确定</button>
            </div>
          </div>
        )}

        {/* ===== 商家卡片列表 ===== */}
        <div style={{ padding: '10px 12px 80px' }}>
          {filteredShops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: T.sub, fontSize: 14 }}>
              没有找到符合条件的商家
            </div>
          )}
          {filteredShops.map(shop => (
            <div key={shop.id} onClick={() => openSubPage('shop', { shopId: shop.id })} style={{
              background: T.card, borderRadius: 14, marginBottom: 10,
              border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer',
            }}>
              {/* 店铺头部 */}
              <div style={{ padding: '12px 14px 10px', display: 'flex', gap: 12 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 12, flexShrink: 0,
                  background: isDark ? 'rgba(37,99,235,0.1)' : 'rgba(37,99,235,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                }}>{shop.img}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{shop.name}</span>
                    {shop.isBrand && <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700, background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>品牌</span>}
                    {shop.isHot && <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>热门</span>}
                    {shop.isNew && <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>新</span>}
                  </div>
                  {/* 评分行 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#F59E0B', fontWeight: 700 }}>{I.star}{shop.rating}</span>
                    <span style={{ color: T.sub }}>月售{shop.sales}</span>
                    <span style={{ color: T.sub, display: 'flex', alignItems: 'center', gap: 2 }}>{I.clock}{shop.deliveryTime}min</span>
                    <span style={{ color: T.sub }}>{shop.distance}</span>
                  </div>
                  {/* 配送信息 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#2563EB' }}>{I.bike}{shop.deliveryType}</span>
                    <span style={{ color: T.sub }}>起送¥{shop.minOrder}</span>
                    <span style={{ color: shop.deliveryFee === 0 ? '#10B981' : T.sub }}>{shop.deliveryFee === 0 ? '免配送费' : `配送¥${shop.deliveryFee}`}</span>
                  </div>
                  {/* 优惠标签 */}
                  {shop.discount && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)',
                      }}>{shop.discount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 商品横向滚动 + 加购 */}
              <div style={{ display: 'flex', gap: 8, padding: '0 14px 12px', overflowX: 'auto' }} onClick={e => e.stopPropagation()}>
                {shop.products.map(p => {
                  const qty = cart[p.id] || 0
                  return (
                    <div key={p.id} style={{
                      flexShrink: 0, width: 108, borderRadius: 10,
                      background: T.tagBg, border: `1px solid ${T.border}`, overflow: 'hidden',
                    }}>
                      <div style={{
                        width: '100%', height: 72,
                        background: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                      }}>{p.img}</div>
                      <div style={{ padding: 7 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#EF4444' }}>¥{p.price}</span>
                          <span style={{ fontSize: 10, color: T.sub2, textDecoration: 'line-through' }}>¥{p.original}</span>
                        </div>
                        <div style={{ fontSize: 9, color: T.sub2, marginTop: 1 }}>月售{p.sales}</div>
                        {/* 加购按钮 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                          {qty > 0 && (
                            <>
                              <div onClick={() => removeFromCart(p.id)} style={{
                                width: 22, height: 22, borderRadius: 11, border: '1.5px solid #2563EB',
                                background: 'transparent', color: '#2563EB', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>{I.minus}</div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: T.text, minWidth: 12, textAlign: 'center' }}>{qty}</span>
                            </>
                          )}
                          <div onClick={() => addToCart(p.id)} style={{
                            width: 22, height: 22, borderRadius: 11, border: 'none',
                            background: '#2563EB', color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                          }}>{I.plus}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 购物车悬浮按钮 ===== */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)', maxWidth: 410,
          borderRadius: 28, overflow: 'hidden',
          background: isDark ? '#1E293B' : '#1A1A2E',
          display: 'flex', alignItems: 'center', padding: '6px 6px 6px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 100,
        }}>
          {/* 购物车图标 + 角标 */}
          <div style={{ position: 'relative', marginRight: 10 }} onClick={() => setShowCart(true)}>
            <div style={{
              width: 44, height: 44, borderRadius: 22, background: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>{I.cart}</div>
            <span style={{
              position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
              background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1A1A2E',
            }}>{cartCount}</span>
          </div>
          {/* 合计 */}
          <div style={{ flex: 1, color: '#fff' }} onClick={() => setShowCart(true)}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>¥{cartTotal.toFixed(1)}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>配送费¥3 · 已选{cartCount}件</div>
          </div>
          {/* 结算按钮 */}
          <div style={{
            padding: '12px 24px', borderRadius: 22, background: '#2563EB', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }} onClick={() => openSubPage('checkout', { items: cartItems, total: cartTotal, onClearCart: () => setCart({}) })}>去结算</div>
        </div>
      )}

      {/* ===== 购物车弹窗 ===== */}
      {showCart && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }} onClick={() => setShowCart(false)}>
          <div style={{
            background: T.card, borderRadius: '20px 20px 0 0', maxHeight: '60vh',
            display: 'flex', flexDirection: 'column', animation: 'slideUp .3s ease',
          }} onClick={e => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>购物车 ({cartCount}件)</span>
              <div onClick={() => { setCart({}); setShowCart(false) }} style={{ fontSize: 13, color: T.sub, cursor: 'pointer' }}>清空</div>
            </div>
            {/* 商品列表 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', padding: '12px 0',
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: T.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginRight: 10 }}>{item.img}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#EF4444', marginTop: 2 }}>¥{item.price}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div onClick={() => removeFromCart(item.id)} style={{
                      width: 24, height: 24, borderRadius: 12, border: '1.5px solid #2563EB',
                      color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{I.minus}</div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                    <div onClick={() => addToCart(item.id)} style={{
                      width: 24, height: 24, borderRadius: 12, background: '#2563EB', color: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{I.plus}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* 底部结算栏 */}
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>¥{cartTotal.toFixed(1)}</span>
                <span style={{ fontSize: 11, color: T.sub, marginLeft: 8 }}>另需配送费¥3</span>
              </div>
              <div onClick={() => { setShowCart(false); openSubPage('checkout', { items: cartItems, total: cartTotal, onClearCart: () => setCart({}) }) }} style={{
                flex: 1, maxWidth: 140, marginLeft: 'auto', padding: '12px 0', borderRadius: 22,
                background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, textAlign: 'center', cursor: 'pointer',
              }}>去结算</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
