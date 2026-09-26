import { useState, useRef } from 'react'
import { useApp } from '../App'

const I = {
  box: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>,
  plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  camera: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  tag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
}

const categories = ['全部', '招牌推荐', '饮品', '小吃', '套餐']

const initialStore = {
  name: '莳约奶茶铺', avatar: '🧋', verified: true, rating: 4.8, sales: 524,
  desc: '校园里最受欢迎的饮品小吃店，每日新鲜制作',
  location: '学校商业街 A12铺', openHours: '08:00 - 22:00',
  announcement: '新店开业：满30减5，满50减10，欢迎下单！',
  status: '营业中',
}

const initialProducts = [
  { id: 1, name: '招牌奶茶', price: 12, sales: 128, stock: 9999, img: '🧋', status: 'active', category: '饮品' },
  { id: 2, name: '冰美式', price: 10, sales: 96, stock: 9999, img: '☕', status: 'active', category: '饮品' },
  { id: 3, name: '鸡肉卷饼', price: 15, sales: 64, stock: 9999, img: '🌯', status: 'active', category: '小吃' },
  { id: 4, name: '芒果班戟', price: 18, sales: 42, stock: 9999, img: '🥭', status: 'active', category: '小吃' },
  { id: 5, name: '奶茶+卷饼套餐', price: 25, sales: 28, stock: 9999, img: '📦', status: 'active', category: '套餐' },
]

const initialPhotos = [
  { id: 'ph1', label: '店铺门面', color: '#F59E0B', emoji: '🏠' },
  { id: 'ph2', label: '吧台区域', color: '#2563EB', emoji: '☕' },
  { id: 'ph3', label: '制作区', color: '#22C55E', emoji: '🧋' },
  { id: 'ph4', label: '堂食座位', color: '#A855F7', emoji: '🪑' },
]

const discountRules = [
  { id: 1, spend: 20, discount: 2 },
  { id: 2, spend: 30, discount: 5 },
  { id: 3, spend: 50, discount: 10 },
]

export default function StoreHomeTab() {
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const [store, setStore] = useState(initialStore)
  const [products, setProducts] = useState(initialProducts)
  const [photos, setPhotos] = useState(initialPhotos)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showStoreEditModal, setShowStoreEditModal] = useState(false)
  const [showMarketingModal, setShowMarketingModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [previewImage, setPreviewImage] = useState('') // 用于图片预览
  const [toast, setToast] = useState('')
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(true)
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(30)
  const [discountEnabled, setDiscountEnabled] = useState(true)
  const [rules, setRules] = useState(discountRules)
  const [previewImg, setPreviewImg] = useState('')
  const fileInputRef = useRef(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const headerText = isDark ? '#F1F5F9' : '#0F172A'
  const headerSub = isDark ? '#94A3B8' : '#64748B'
  const cardBg = 'var(--c-card)'
  const border = 'var(--c-border)'

  const filteredProducts = activeCategory === '全部'
    ? products
    : products.filter(p => p.category === activeCategory)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('图片大小不能超过 5MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewImg(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSaveProduct = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const name = fd.get('name')
    const price = parseFloat(fd.get('price'))
    const category = fd.get('category')
    const stock = parseInt(fd.get('stock') || '9999')
    if (!name || !price) { showToast('请填写完整信息'); return }
    const img = previewImg || editingProduct?.img || '📦'
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, name, price, category, stock, img } : p))
      showToast('商品已更新')
    } else {
      setProducts(prev => [...prev, { id: Date.now(), name, price, category, stock, sales: 0, img, status: 'active' }])
      showToast('商品已上架')
    }
    closeProductModal()
  }

  const closeProductModal = () => { setShowProductModal(false); setEditingProduct(null); setPreviewImg('') }

  const toggleStatus = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))
  }

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    showToast('商品已删除')
  }

  const handleSaveStore = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setStore(prev => ({
      ...prev,
      name: fd.get('name'),
      desc: fd.get('desc'),
      openHours: fd.get('openHours'),
      location: fd.get('location'),
    }))
    setShowStoreEditModal(false)
    showToast('店铺信息已保存')
  }

  const handleSaveAnnouncement = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setStore(prev => ({ ...prev, announcement: fd.get('announcement') }))
    setShowAnnouncementModal(false)
    showToast('店铺公告已更新')
  }

  const addDiscountRule = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const spend = parseFloat(fd.get('spend'))
    const discount = parseFloat(fd.get('discount'))
    if (!spend || !discount || discount >= spend) { showToast('规则设置不合理'); return }
    setRules(prev => [...prev, { id: Date.now(), spend, discount }])
    e.target.reset()
    showToast('满减规则已添加')
  }

  const removeRule = (id) => { setRules(prev => prev.filter(r => r.id !== id)); showToast('规则已删除') }

  const renderImg = (img) => {
    if (!img || img === '📦') {
      return <span style={{ fontSize: 28 }}>📦</span>
    }
    // 尝试判断是否是 base64 或其他图片 URL
    if (img.startsWith('data:') || img.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      return <img src={img} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', cursor: 'pointer' }} onClick={() => setPreviewImage(img)} />
    }
    // 如果不是图片，显示 emoji 作为默认图标
    return <span style={{ fontSize: 28 }}>{img}</span>
  }

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: cardBg, padding: 16, borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: isDark ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>{store.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: headerText }}>{store.name}</span>
                {store.verified && <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#2563EB', color: '#fff' }}>蓝V</span>}
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: store.status === '营业中' ? '#22C55E' : '#94A3B8', color: '#fff' }}>{store.status}</span>
              </div>
              <div style={{ fontSize: 12, color: headerSub, marginTop: 4 }}>{store.desc}</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 12, color: headerSub }}>
                <span>⭐ {store.rating}</span>
                <span>月售 {store.sales}</span>
                <span>⏰ {store.openHours}</span>
              </div>
            </div>
            <button onClick={() => setShowStoreEditModal(true)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.edit}</button>
          </div>

          <div onClick={() => setShowAnnouncementModal(true)} style={{
            background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)', borderRadius: 10,
            padding: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            border: '1px solid rgba(245,158,11,0.12)',
          }}>
            <span style={{ color: '#F59E0B', flexShrink: 0 }}>{I.bell}</span>
            <span style={{ fontSize: 12, color: headerSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.announcement || '点击设置店铺公告'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
            {[{ l: '今日订单', v: 12 }, { l: '今日收入', v: '¥186' }, { l: '待确认', v: 2 }].map(s => (
              <div key={s.l} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: headerText }}>{s.v}</div>
                <div style={{ fontSize: 11, color: headerSub, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 12 }}>
          <div style={{ background: cardBg, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: headerText }}>商品管理</span>
              <button onClick={() => { setEditingProduct(null); setPreviewImg(''); setShowProductModal(true) }} style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>{I.plus} 添加商品</button>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12 }}>
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)} style={{
                  padding: '5px 12px', borderRadius: 16, border: 'none', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                  background: activeCategory === c ? '#2563EB' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  color: activeCategory === c ? '#fff' : headerSub,
                }}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredProducts.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 12, border: '1px solid var(--c-border-light)', opacity: p.status === 'inactive' ? 0.6 : 1,
                }}>
                  {renderImg(p.img)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: headerText }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: headerSub, marginTop: 2 }}>月售 {p.sales} · 库存 {p.stock}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#2563EB' }}>¥{p.price}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button onClick={() => { setEditingProduct(p); setPreviewImg(p.img.startsWith('data:') ? p.img : ''); setShowProductModal(true) }} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.edit}</button>
                      <button onClick={() => toggleStatus(p.id)} style={{ border: 'none', background: 'transparent', color: p.status === 'active' ? '#F59E0B' : '#22C55E', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{p.status === 'active' ? '下架' : '上架'}</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}>{I.trash}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: cardBg, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: headerText }}>营销活动</span>
              <button onClick={() => setShowMarketingModal(true)} style={{ fontSize: 12, color: '#2563EB', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}>管理</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, background: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.06)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: headerText }}>免配送费</div>
                  <div style={{ fontSize: 12, color: headerSub, marginTop: 2 }}>满¥{freeDeliveryThreshold}免配送费</div>
                </div>
                <span style={{ fontSize: 12, color: freeDeliveryEnabled ? '#22C55E' : '#94A3B8', fontWeight: 600 }}>{freeDeliveryEnabled ? '已开启' : '已关闭'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: headerText }}>满减优惠</div>
                  <div style={{ fontSize: 12, color: headerSub, marginTop: 2 }}>{rules.map(r => `满${r.spend}减${r.discount}`).join('，')}</div>
                </div>
                <span style={{ fontSize: 12, color: discountEnabled ? '#22C55E' : '#94A3B8', fontWeight: 600 }}>{discountEnabled ? '已开启' : '已关闭'}</span>
              </div>
            </div>
          </div>

          <div style={{ background: cardBg, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: headerText, marginBottom: 12 }}>店铺相册</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {photos.map(ph => (
                <div key={ph.id} style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 12, padding: '20px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 28 }}>{ph.emoji}</span>
                  <span style={{ fontSize: 11, color: headerSub }}>{ph.label}</span>
                </div>
              ))}
              <div onClick={() => setShowPhotoModal(true)} style={{
                background: 'var(--c-card)', borderRadius: 14, padding: '20px 10px',
                border: '2px dashed var(--c-border)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
              }}>
                <span style={{ color: 'var(--c-text3)' }}>{I.plus}</span>
                <span style={{ fontSize: 11, color: 'var(--c-text3)' }}>添加照片</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div onClick={() => showToast('经营数据功能开发中')} style={{
              background: cardBg, borderRadius: 14, padding: 14,
              border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>{I.chart}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: headerText }}>经营数据</div>
                <div style={{ fontSize: 12, color: headerSub, marginTop: 1 }}>查看详细报表</div>
              </div>
            </div>
            <div onClick={() => setShowMarketingModal(true)} style={{
              background: cardBg, borderRadius: 14, padding: 14,
              border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}>{I.tag}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: headerText }}>营销工具</div>
                <div style={{ fontSize: 12, color: headerSub, marginTop: 1 }}>优惠券与活动</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 商品编辑弹窗 */}
      {showProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={closeProductModal}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '86%', maxWidth: 360, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>{editingProduct ? '编辑商品' : '添加商品'}</span>
              <button onClick={closeProductModal} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>商品图片</label>
                <div onClick={() => fileInputRef.current?.click()} style={{
                  width: 80, height: 80, borderRadius: 12, border: '2px dashed var(--c-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                }}>
                  {previewImg ? <img src={previewImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <span style={{ color: 'var(--c-text3)' }}>{I.camera}</span>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>商品名称</label>
                <input name="name" defaultValue={editingProduct?.name || ''} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>价格</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price || ''} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>库存</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock || 9999} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>分类</label>
                <select name="category" defaultValue={editingProduct?.category || '饮品'} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box' }}>
                  {categories.filter(c => c !== '全部').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{editingProduct ? '保存修改' : '立即上架'}</button>
            </form>
          </div>
        </div>
      )}

      {/* 店铺信息编辑弹窗 */}
      {showStoreEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowStoreEditModal(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '86%', maxWidth: 360, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>编辑店铺信息</span>
              <button onClick={() => setShowStoreEditModal(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <form onSubmit={handleSaveStore}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>店铺名称</label>
                <input name="name" defaultValue={store.name} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>店铺简介</label>
                <textarea name="desc" defaultValue={store.desc} rows={3} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>营业时间</label>
                <input name="openHours" defaultValue={store.openHours} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, color: headerSub, marginBottom: 6 }}>店铺地址</label>
                <input name="location" defaultValue={store.location} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>保存</button>
            </form>
          </div>
        </div>
      )}

      {/* 公告编辑弹窗 */}
      {showAnnouncementModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowAnnouncementModal(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '86%', maxWidth: 360, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>店铺公告</span>
              <button onClick={() => setShowAnnouncementModal(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <form onSubmit={handleSaveAnnouncement}>
              <textarea name="announcement" defaultValue={store.announcement} rows={4} style={{ width: '100%', padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: 18 }} />
              <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>保存公告</button>
            </form>
          </div>
        </div>
      )}

      {/* 营销活动弹窗 */}
      {showMarketingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowMarketingModal(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '90%', maxWidth: 380, border: `1px solid ${border}`, maxHeight: '80%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>营销活动</span>
              <button onClick={() => setShowMarketingModal(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: headerText }}>免配送费</span>
                <button onClick={() => setFreeDeliveryEnabled(!freeDeliveryEnabled)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: freeDeliveryEnabled ? '#2563EB' : '#94A3B8', position: 'relative' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: freeDeliveryEnabled ? 22 : 2, transition: 'left .2s' }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: headerSub }}>满</span>
                <input type="number" value={freeDeliveryThreshold} onChange={e => setFreeDeliveryThreshold(parseFloat(e.target.value) || 0)} style={{ width: 70, padding: 8, borderRadius: 8, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText, textAlign: 'center' }} />
                <span style={{ fontSize: 13, color: headerSub }}>元免配送费</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: headerText }}>满减优惠</span>
                <button onClick={() => setDiscountEnabled(!discountEnabled)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: discountEnabled ? '#F59E0B' : '#94A3B8', position: 'relative' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: discountEnabled ? 22 : 2, transition: 'left .2s' }} />
                </button>
              </div>
              {rules.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: 13, color: headerText }}>满{r.spend}减{r.discount}</span>
                  <button onClick={() => removeRule(r.id)} style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>删除</button>
                </div>
              ))}
              <form onSubmit={addDiscountRule} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input name="spend" type="number" placeholder="满" style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText }} />
                <input name="discount" type="number" placeholder="减" style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${border}`, background: 'var(--c-input)', color: headerText }} />
                <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#F59E0B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>添加</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 商品图片预览弹窗 */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(8px)' }} onClick={() => setPreviewImage('')}>
          <div onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage('')} style={{
              position: 'absolute', top: 16, right: 16, padding: 10, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%',
              cursor: 'pointer', fontSize: 24, zIndex: 1,
            }}>{I.close}</button>
            <img src={previewImage} alt="商品详情" style={{
              maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>
      )}

      {/* 照片上传弹窗 */}
      {showPhotoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => { setShowPhotoModal(false); setPreviewImg('') }}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '86%', maxWidth: 340, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>添加店铺照片</span>
              <button onClick={() => { setShowPhotoModal(false); setPreviewImg('') }} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <div onClick={() => fileInputRef.current?.click()} style={{
              width: '100%', height: 160, borderRadius: 12, border: '2px dashed var(--c-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', marginBottom: 16,
            }}>
              {previewImg ? <img src={previewImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <span style={{ color: 'var(--c-text3)' }}>{I.camera}</span>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <button onClick={() => { if (previewImg) { setPhotos(prev => [...prev, { id: Date.now(), label: '店铺照片', color: '#2563EB', emoji: '📷' }]); setPreviewImg(''); setShowPhotoModal(false); showToast('照片已添加') } }} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>确认上传</button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 200 }}>{toast}</div>
      )}
    </div>
  )
}
