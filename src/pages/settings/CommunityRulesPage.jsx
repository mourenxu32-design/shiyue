import { useApp } from '../../App'
import { SettingNav } from './SettingShared'

export default function CommunityRulesPage() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'
  const pageBg = isDark ? '#181E2C' : '#F2F2F7'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const cardBg = isDark ? '#1E2536' : '#FFFFFF'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'

  const rules = [
    {
      title: '尊重与友善',
      icon: '🤝',
      items: ['尊重每一位用户，禁止人身攻击、歧视和骚扰', '使用文明用语，营造良好的社区氛围', '尊重他人隐私，未经允许不得公开他人信息'],
    },
    {
      title: '真实与诚信',
      icon: '✅',
      items: ['发布真实有效的任务信息，禁止虚假内容', '如实描述任务要求和条件，不隐瞒关键信息', '按时完成任务约定，不恶意爽约或拖延'],
    },
    {
      title: '安全与合规',
      icon: '🛡️',
      items: ['禁止发布违法违规内容（涉黄涉暴、赌博等）', '禁止利用平台进行任何形式的欺诈行为', '禁止发布广告、刷单和垃圾营销信息'],
    },
    {
      title: '交易规范',
      icon: '💰',
      items: ['价格设置合理，禁止恶意低价或抬价', '接单前确认能力和时间，量力而行', '完成后及时确认并如实评价'],
    },
    {
      title: '账号管理',
      icon: '👤',
      items: ['一人一号，禁止注册多个账号刷单', '不得出售、转让或出借个人账号', '账号异常应及时联系客服处理'],
    },
    {
      title: '违规处理',
      icon: '⚠️',
      items: ['轻微违规：警告 + 扣分', '严重违规：封禁 7-30 天', '极端违规：永久封禁 + 清退处理'],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pageBg }}>
      <SettingNav title="社区公约" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '20px 20px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>莳约社区公约</div>
          <div style={{ fontSize: 12, color: subColor, marginTop: 4 }}>共建和谐互助的校园社区</div>
        </div>

        <div style={{ padding: '12px 20px 20px' }}>
          {rules.map((rule, i) => (
            <div key={i} style={{
              background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`,
              padding: '16px', marginBottom: i < rules.length - 1 ? 12 : 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{rule.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{rule.title}</span>
              </div>
              {rule.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: j < rule.items.length - 1 ? 8 : 0,
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%', background: isDark ? '#4A90D9' : '#1E2A3A',
                    flexShrink: 0, marginTop: 7,
                  }} />
                  <span style={{ fontSize: 13, color: subColor, lineHeight: 1.7 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            background: isDark ? 'rgba(107,92,231,0.08)' : 'rgba(107,92,231,0.06)',
            border: `1px solid ${isDark ? 'rgba(107,92,231,0.15)' : 'rgba(107,92,231,0.1)'}`,
            borderRadius: 12, padding: '12px 16px', fontSize: 12, color: isDark ? '#A29BFE' : '#6B5CE7', lineHeight: 1.7, textAlign: 'center',
          }}>
            遵守社区公约，共建美好校园社区。违规举报请联系：support@shiyue.com
          </div>
        </div>
      </div>
    </div>
  )
}
