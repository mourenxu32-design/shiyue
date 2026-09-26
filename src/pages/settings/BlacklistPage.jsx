import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard } from './SettingShared'
import api, { getToken } from '../../utils/api'

export default function BlacklistPage() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const inputBg = isDark ? '#252E42' : '#F5F5F7'
  const cardBg = isDark ? '#1E2536' : '#FFFFFF'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'
  const btnBg = isDark ? '#252E42' : '#F0F0F5'

  const [users, setUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.blacklist().then(resp => {
      if (cancelled) return
      const items = resp?.data?.items || resp?.data
      if (Array.isArray(items) && items.length > 0) {
        setUsers(items.map(u => ({
          id: u.blocked_user_id || u.id,
          name: u.blocked_nickname || u.nickname || '用户',
          avatar: (u.blocked_nickname || u.nickname || 'U')[0],
          time: u.created_at ? u.created_at.slice(0, 10) : '',
        })))
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const removeUser = async (id) => {
    try {
      await api.users.removeBlacklist(id)
      setUsers(users.filter(u => u.id !== id))
      showToast('已移除黑名单')
    } catch (err) { showToast(err?.message || '移除失败') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="黑名单" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: inputBg, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor }}>{I.ban}</div>
            <div style={{ fontSize: 14, color: subColor }}>暂无黑名单用户</div>
          </div>
        ) : (
          <SettingCard>
            {users.map((user, i) => (
              <div key={user.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderBottom: i < users.length - 1 ? `1px solid ${borderColor}` : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: isDark ? '#3A4455' : '#E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: subColor, fontWeight: 600,
                }}>{user.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: textColor }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: subColor, marginTop: 2 }}>拉黑于 {user.time}</div>
                </div>
                <button onClick={() => removeUser(user.id)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #F59E0B', background: 'transparent', color: '#F59E0B', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  移除
                </button>
              </div>
            ))}
          </SettingCard>
        )}

        <div style={{ padding: '0 20px 16px' }}>
          <button onClick={() => setShowAdd(true)}
            style={{
              width: '100%', padding: 14, borderRadius: 12, background: 'transparent',
              border: `1.5px solid ${borderColor}`, color: subColor, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <span>{I.plus}</span> 添加黑名单
          </button>
        </div>
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}

      {showAdd && (
        <div onClick={() => setShowAdd(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: cardBg, borderRadius: 20, padding: 24, width: '85%', maxWidth: 340, border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: textColor, marginBottom: 16, textAlign: 'center' }}>添加黑名单</div>
            <input placeholder="输入对方手机号或昵称搜索"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${borderColor}`, fontSize: 14, outline: 'none', marginBottom: 16, background: inputBg, color: textColor }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAdd(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, background: btnBg, border: 'none', fontSize: 14, fontWeight: 600, color: textColor, cursor: 'pointer' }}>取消</button>
              <button onClick={() => setShowAdd(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, background: (isDark ? '#4A90D9' : '#1E2A3A'), border: 'none', fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>搜索</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
