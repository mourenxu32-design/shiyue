import { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { I, SettingNav, SettingCard, SettingToggle } from './SettingShared'
import api from '../../utils/api'

export default function NotificationSettingsPage() {
  const { openSubPage } = useApp()
  const [loading, setLoading] = useState(true)
  const [prefs, setPrefs] = useState({
    task_accepted: true, new_msg: true, task_done: true,
    review_remind: true, task_expire: true, member_expire: true,
    holiday_mode: true, sys_notice: true, in_app: true,
    push: true, vibrate: false, sound: true,
  })

  useEffect(() => {
    api.settings.preferences().then(res => {
      if (res?.data?.notification) setPrefs(res.data.notification)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const update = (key, value) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    api.settings.updatePreferences('notification', next).catch(() => {})
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="通知设置" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>任务通知</div>
        <SettingCard>
          <SettingToggle icon={I.check} label="任务被接通知" value={prefs.task_accepted} onChange={v => update('task_accepted', v)} />
          <SettingToggle icon={I.msg} label="新消息通知" value={prefs.new_msg} onChange={v => update('new_msg', v)} />
          <SettingToggle icon={I.gift} label="任务完成提醒" value={prefs.task_done} onChange={v => update('task_done', v)} />
          <SettingToggle icon={I.star} label="评价提醒" value={prefs.review_remind} onChange={v => update('review_remind', v)} />
          <SettingToggle icon={I.clock} label="任务即将到期提醒" value={prefs.task_expire} onChange={v => update('task_expire', v)} />
        </SettingCard>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>系统通知</div>
        <SettingCard>
          <SettingToggle icon={I.card} label="会员到期提醒" value={prefs.member_expire} onChange={v => update('member_expire', v)} />
          <SettingToggle icon={I.palm} label="假期模式通知" value={prefs.holiday_mode} onChange={v => update('holiday_mode', v)} />
          <SettingToggle icon={I.announce} label="系统公告" value={prefs.sys_notice} onChange={v => update('sys_notice', v)} />
        </SettingCard>
        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: 'var(--c-text3, #999)', letterSpacing: 0.5 }}>通知方式</div>
        <SettingCard>
          <SettingToggle icon={I.mobile} label="应用内通知" desc="不可关闭" value={prefs.in_app} onChange={v => update('in_app', v)} disabled />
          <SettingToggle icon={I.upload} label="Push推送" value={prefs.push} onChange={v => update('push', v)} />
          <SettingToggle icon={I.vibrate} label="振动" value={prefs.vibrate} onChange={v => update('vibrate', v)} />
          <SettingToggle icon={I.sound} label="声音" value={prefs.sound} onChange={v => update('sound', v)} />
        </SettingCard>
      </div>
    </div>
  )
}
