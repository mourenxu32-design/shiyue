import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard, SettingToggle, SettingChoice } from './SettingShared'
import api from '../../utils/api'

export default function PrivacySettingsPage() {
  const { openSubPage } = useApp()
  const [loading, setLoading] = useState(true)
  const [prefs, setPrefs] = useState({
    show_alipay: false, show_online: true, find_by_phone: true,
    publish_visible: '所有人可见', accept_visible: '所有人可见', review_visible: '所有人可见',
    block_stranger: false, keyword_filter: true, personalized: true,
  })

  useEffect(() => {
    api.settings.preferences().then(res => {
      if (res?.data?.privacy) setPrefs(res.data.privacy)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const update = (key, value) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    api.settings.updatePreferences('privacy', next).catch(() => {})
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="隐私设置" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>个人信息展示</div>
        <SettingCard>
          <SettingToggle icon={I.alipay} label="展示支付宝账号" desc="任务详情页对交易对方展示" value={prefs.show_alipay} onChange={v => update('show_alipay', v)} />
          <SettingToggle icon={I.online} label="展示在线状态" desc="IM聊天中对方可见在线状态" value={prefs.show_online} onChange={v => update('show_online', v)} />
          <SettingToggle icon={I.phone} label="允许通过手机号找到我" value={prefs.find_by_phone} onChange={v => update('find_by_phone', v)} />
        </SettingCard>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>可见性设置</div>
        <SettingCard>
          <SettingChoice icon={I.doc} label="我的发布记录" options={['所有人可见', '仅好友可见', '仅自己可见']} value={prefs.publish_visible} onChange={v => update('publish_visible', v)} />
          <SettingChoice icon={I.brief} label="我的接单记录" options={['所有人可见', '仅好友可见', '仅自己可见']} value={prefs.accept_visible} onChange={v => update('accept_visible', v)} />
          <SettingChoice icon={I.star} label="我的评价" options={['所有人可见', '仅好友可见', '仅自己可见']} value={prefs.review_visible} onChange={v => update('review_visible', v)} />
        </SettingCard>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>安全与推荐</div>
        <SettingCard>
          <SettingToggle icon={I.ban} label="不接收陌生人消息" value={prefs.block_stranger} onChange={v => update('block_stranger', v)} />
          <SettingToggle icon={I.filter} label="关键词过滤" desc="自动过滤骚扰消息中的敏感词" value={prefs.keyword_filter} onChange={v => update('keyword_filter', v)} />
          <SettingToggle icon={I.spark} label="个性化推荐" desc="根据接单偏好推荐任务" value={prefs.personalized} onChange={v => update('personalized', v)} />
        </SettingCard>
      </div>
    </div>
  )
}
