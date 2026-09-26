import { useApp } from '../../App'
import { SettingNav } from './SettingShared'

export default function PrivacyPolicyPage() {
  const { openSubPage, theme } = useApp()
  const isDark = theme === 'dark'
  const pageBg = isDark ? '#181E2C' : '#F2F2F7'
  const textColor = isDark ? '#F0F2F5' : '#1A1A1A'
  const subColor = isDark ? '#8090A8' : '#999'
  const cardBg = isDark ? '#1E2536' : '#FFFFFF'
  const borderColor = isDark ? '#2A3040' : '#E8E8EC'

  const sections = [
    {
      title: '1. 信息收集',
      content: '我们会收集您在注册、使用服务过程中提供的个人信息，包括但不限于：手机号码、身份信息、学籍信息、支付宝账号等。这些信息用于身份验证、交易安全和提供更好的服务体验。'
    },
    {
      title: '2. 信息使用',
      content: '我们收集的信息将严格用于以下目的：\n• 验证用户身份，保障平台安全\n• 匹配任务发布者和接单者\n• 处理交易支付和佣金结算\n• 优化平台功能和用户体验\n• 处理用户反馈和投诉'
    },
    {
      title: '3. 信息保护',
      content: '我们采用行业标准的安全技术措施保护您的个人信息，包括数据加密传输、访问控制、安全审计等。实名认证信息和身份证照片采用AES-256加密存储，仅用于身份核验，绝不外泄。'
    },
    {
      title: '4. 信息共享',
      content: '未经您的明确同意，我们不会向任何第三方共享您的个人信息，以下情况除外：\n• 法律法规要求的信息披露\n• 交易双方同意完成服务对接\n• 支付宝等支付渠道处理佣金结算'
    },
    {
      title: '5. 用户权利',
      content: '您有权随时查看、修改和删除您的个人信息。您可以：\n• 在"设置"中查看和管理个人信息\n• 注销账号并删除所有数据\n• 联系客服申请数据导出或删除\n• 撤回对信息收集的授权同意'
    },
    {
      title: '6. Cookie 与追踪',
      content: '我们使用必要的 Cookie 和类似技术来维持会话状态、记录偏好设置和提升使用体验。您可以随时清除浏览器 Cookie。'
    },
    {
      title: '7. 未成年人保护',
      content: '莳约平台面向年满18周岁的大学生用户。我们不会故意收集未成年人的个人信息。如发现误收集，我们将立即删除相关数据。'
    },
    {
      title: '8. 政策更新',
      content: '我们可能会不定期更新本隐私政策。重大变更将通过站内通知或短信方式告知您。继续使用平台服务即表示同意更新后的政策。'
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pageBg }}>
      <SettingNav title="隐私政策" onBack={() => openSubPage('settings')} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '20px 20px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>莳约隐私政策</div>
          <div style={{ fontSize: 12, color: subColor, marginTop: 4 }}>最后更新：2025年6月1日</div>
        </div>

        <div style={{ margin: '8px 20px 20px', background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: '20px 16px' }}>
          <div style={{ fontSize: 13, color: subColor, lineHeight: 1.8, marginBottom: 20 }}>
            莳约（以下简称"我们"）非常重视用户隐私保护。本政策详细说明了我们如何收集、使用和保护您的个人信息。
          </div>

          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: i < sections.length - 1 ? 20 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: subColor, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</div>
            </div>
          ))}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${borderColor}`, fontSize: 12, color: subColor, textAlign: 'center' }}>
            如有任何隐私相关问题，请联系：privacy@shiyue.com
          </div>
        </div>
      </div>
    </div>
  )
}
