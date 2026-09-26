import { useApp } from '../../App'
import { I, SettingNav, SettingCard, SettingRow, ConfirmModal } from './SettingShared'
import { useState } from 'react'
import api from '../../utils/api'
import { clearToken } from '../../utils/api'

export default function AccountSecurityPage() {
  const { openSubPage } = useApp()
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const handleDeactivate = async () => {
    setDeactivating(true)
    try {
      await api.users.deactivate({ confirm: true })
      clearToken()
      window.location.reload()
    } catch (e) {
      alert(e.message || '注销失败')
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="账号安全" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        <SettingCard>
          <SettingRow icon={I.phone} label="手机号" status="138****8888" />
          <SettingRow icon={I.lock} label="修改密码" />
          <SettingRow icon={I.device} label="登录设备管理" status="当前设备 iPhone 15" last />
        </SettingCard>
        <SettingCard>
          <SettingRow icon={I.warn} label="注销账号" danger onClick={() => setShowDeactivate(true)} last />
        </SettingCard>
      </div>
      {showDeactivate && (
        <ConfirmModal title="注销账号" desc="注销后所有数据将无法恢复，确定要注销账号吗？此操作不可撤销。" danger confirmText={deactivating ? '注销中...' : '确认注销'} onConfirm={handleDeactivate} onCancel={() => setShowDeactivate(false)} />
      )}
    </div>
  )
}
