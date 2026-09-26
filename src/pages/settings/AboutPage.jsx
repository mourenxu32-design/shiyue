import { useApp } from '../../App'
import { I, SettingNav, SettingCard } from './SettingShared'

export default function AboutPage() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const cardBg = isDark ? '#1E2536' : '#FFFFFF'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'

  const features = [
    { icon: I.task, title: '发悬赏揭皇榜', desc: '发布校园任务，高效解决问题', color: '#6366F1' },
    { icon: I.pin, title: '校园跑腿服务', desc: '代取快递、代买代送、占座排队', color: '#3B82F6' },
    { icon: I.star, title: 'Cosplay委托', desc: '妆造、道具、摄影一站式服务', color: '#F59E0B' },
    { icon: I.shield, title: '实名信用体系', desc: '实名认证+信用评分，安全可靠', color: '#22C55E' },
  ]

  const contactItems = [
    { icon: I.globe, label: '官方网站', value: 'www.shiyue.app' },
    { icon: I.mail, label: '联系邮箱', value: 'hi@shiyue.app' },
    { icon: I.headset, label: '客服电话', value: '400-888-8888' },
    { icon: I.wechat, label: '微信公众号', value: '莳约ShiYue' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg, #F2F2F7)' }}>
      <SettingNav title="关于莳约" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px 24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: '0 auto 16px',
            background: isDark ? 'linear-gradient(135deg, #D4A853, #E8C878)' : 'linear-gradient(135deg, #1E2A3A, #2D3E55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark ? '0 4px 20px rgba(212,168,83,0.3)' : '0 4px 20px rgba(30,42,58,0.3)',
          }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: isDark ? '#1A1A1A' : '#FFFFFF', fontFamily: 'serif' }}>莳</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: textColor, letterSpacing: 4, marginBottom: 6 }}>莳约</div>
          <div style={{ fontSize: 13, color: subColor, letterSpacing: 3, marginBottom: 8 }}>悬赏为约，揭榜来莳</div>
          <div style={{ fontSize: 12, color: subColor, background: isDark ? '#252E42' : '#F0F0F5', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>Version 1.0.0</div>
        </div>

        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: subColor, letterSpacing: 0.5 }}>功能介绍</div>
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {features.map(f => (
              <div key={f.title} style={{
                minWidth: 160, padding: 16, borderRadius: 16, background: cardBg,
                border: `1px solid ${borderColor}`, flexShrink: 0,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 10,
                  background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: subColor, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 24px 8px', fontSize: 12, fontWeight: 600, color: subColor, letterSpacing: 0.5 }}>联系我们</div>
        <SettingCard>
          {contactItems.map((item, i) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderBottom: i < contactItems.length - 1 ? `1px solid ${borderColor}` : 'none',
            }}>
              <span style={{ color: subColor, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 14, color: textColor }}>{item.label}</span>
              <span style={{ fontSize: 12, color: subColor }}>{item.value}</span>
            </div>
          ))}
        </SettingCard>

        <div style={{ textAlign: 'center', padding: '24px 16px 40px', fontSize: 11, color: subColor }}>
          Copyright © 2026 莳约 版权所有
        </div>
      </div>
    </div>
  )
}
