import { useState } from 'react'
import { useApp } from '../App'

const sections = [
  {
    title: '服务条款',
    content: '欢迎使用莳约平台。本服务条款是您与莳约平台之间的法律协议。使用本平台即表示您同意接受以下条款的约束。莳约是一个悬赏任务发布与接单平台，连接发布者与接单者，提供任务发布、接单、评价等功能。'
  },
  {
    title: '用户行为规范',
    content: '您在使用本平台时，应当遵守法律法规，不得发布违法违规内容，不得恶意刷单、刷评价，不得利用平台进行诈骗或其他损害他人利益的行为。违反规定可能导致账号被封禁。'
  },
  {
    title: '隐私政策',
    content: '我们重视您的隐私保护。收集的个人信息仅用于提供和改善服务，包括但不限于：注册信息（手机号、学校信息）、任务相关数据（位置、评价）、支付信息（支付宝账号）。我们不会将您的个人信息出售给第三方。'
  },
  {
    title: '交易与结算',
    content: '平台采用发布者直接结算模式，无平台资金托管。悬赏佣金由发布者通过支付宝直接支付给接单者。平台不对交易纠纷承担资金担保责任，建议双方保留交易凭证。'
  },
  {
    title: '会员与卡券',
    content: '会员服务为虚拟商品，购买后即时生效，不支持退款。卡券有明确有效期，过期自动作废。平台有权根据运营需要调整会员权益内容，但会提前通知用户。'
  },
  {
    title: '免责声明',
    content: '莳约作为信息发布平台，不对用户之间的线下交易行为承担任何责任。用户应自行判断任务安全性，平台建议在进行线下服务时保持通讯畅通，注意人身安全。'
  },
]

export default function UserAgreementPage() {
  const { closeSubPage } = useApp()
  const [tab, setTab] = useState('terms')
  const tabs = [
    { id: 'terms', label: '服务条款' },
    { id: 'privacy', label: '隐私政策' },
    { id: 'faq', label: '常见问题' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      <div style={{ flexShrink: 0, padding: '12px 16px 0', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div onClick={closeSubPage} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18 }}>←</div>
          <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>用户协议</div>
          <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>更新于 2025.06</span>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: tab === t.id ? 'var(--c-text)' : 'var(--c-text3)',
              borderBottom: tab === t.id ? '3px solid var(--c-accent)' : '3px solid transparent',
            }}>{t.label}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
        {tab === 'terms' && sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{s.title}</div>
            <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.8 }}>{s.content}</div>
          </div>
        ))}
        {tab === 'privacy' && (
          <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>莳约非常重视用户隐私保护。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。</p>
            <div style={{ background: 'var(--c-card)', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid var(--c-border-light)' }}>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 6 }}>📱 我们收集的信息</div>
              <div>• 注册信息：手机号、昵称、头像</div>
              <div>• 认证信息：学校信息、学籍证明</div>
              <div>• 支付信息：支付宝账号（加密存储）</div>
              <div>• 使用数据：位置（仅任务相关）、浏览记录</div>
            </div>
            <div style={{ background: 'var(--c-card)', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid var(--c-border-light)' }}>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 6 }}>🔒 信息保护措施</div>
              <div>• 数据传输全程 HTTPS 加密</div>
              <div>• 支付信息采用银行级加密存储</div>
              <div>• 定期安全审计和漏洞修复</div>
              <div>• 严格的内部数据访问权限管理</div>
            </div>
            <div style={{ background: 'var(--c-card)', borderRadius: 12, padding: 16, border: '1px solid var(--c-border-light)' }}>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 6 }}>🗑 数据删除</div>
              <div>您可以随时申请删除账号及关联数据，我们将在 7 个工作日内完成处理。</div>
            </div>
          </div>
        )}
        {tab === 'faq' && (
          <div>
            {[
              { q: '如何发布任务？', a: '点击底部"+"按钮，选择板块，填写任务信息和佣金，发布即可。' },
              { q: '如何接单？', a: '在首页或角色扮演板块浏览任务，点击"揭榜"按钮即可接单。' },
              { q: '佣金如何结算？', a: '任务完成后，发布者通过支付宝直接向接单者转账，无平台托管。' },
              { q: '如何获得年卡？', a: '进入商店页面（点击首页左上角商店图标），选择年卡购买即可。' },
              { q: '账号被封怎么办？', a: '请联系客服（我的→设置→关于莳约），说明情况申诉解封。' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--c-card)', borderRadius: 12, padding: 16, marginBottom: 10, border: '1px solid var(--c-border-light)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Q: {item.q}</div>
                <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.6 }}>A: {item.a}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
