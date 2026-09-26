import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard, SettingChoice, SettingSlider, SettingRow, SettingToggle, ConfirmModal } from './SettingShared'
import api from '../../utils/api'

export default function GeneralSettingsPage() {
  const { openSubPage } = useApp()
  const [loading, setLoading] = useState(true)
  const [prefs, setPrefs] = useState({
    dark_mode: '跟随系统', font_size: '标准',
    default_board: '上次选择', default_delivery: '每次询问',
    img_quality: '标准', auto_video: true,
  })
  const [showClear, setShowClear] = useState(false)

  useEffect(() => {
    api.settings.preferences().then(res => {
      if (res?.data?.general) setPrefs(res.data.general)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const update = (key, value) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    api.settings.updatePreferences('general', next).catch(() => {})
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="通用设置" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>显示设置</div>
        <SettingCard>
          <SettingChoice icon={I.moon} label="深色模式" options={['跟随系统', '浅色模式', '深色模式']} value={prefs.dark_mode} onChange={v => update('dark_mode', v)} />
          <SettingSlider icon={I.font} label="字体大小" options={['小', '标准', '大']} value={prefs.font_size} onChange={v => update('font_size', v)} />
        </SettingCard>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>默认设置</div>
        <SettingCard>
          <SettingChoice icon={I.board} label="默认发布板块" options={['上次选择', '校园任务', 'Cosplay']} value={prefs.default_board} onChange={v => update('default_board', v)} />
          <SettingChoice icon={I.pkg} label="默认交付方式" options={['线下面交', '远程快递', '线上交付', '每次询问']} value={prefs.default_delivery} onChange={v => update('default_delivery', v)} />
        </SettingCard>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>数据与缓存</div>
        <SettingCard>
          <SettingChoice icon={I.img} label="图片质量" options={['省流量', '标准', '高清']} value={prefs.img_quality} onChange={v => update('img_quality', v)} />
          <SettingToggle icon={I.play} label="自动播放视频" desc="仅在WiFi下自动播放" value={prefs.auto_video} onChange={v => update('auto_video', v)} />
          <SettingRow icon={I.trash} label="清除缓存" status="23.5MB" onClick={() => setShowClear(true)} last />
        </SettingCard>
      </div>
      {showClear && (
        <ConfirmModal title="清除缓存" desc="确认清除 23.5MB 缓存数据？清除后不会影响正常使用。" onConfirm={() => setShowClear(false)} onCancel={() => setShowClear(false)} />
      )}
    </div>
  )
}
