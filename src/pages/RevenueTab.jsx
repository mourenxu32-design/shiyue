import { useState } from 'react'
import { useApp } from '../App'

const I = {
  wallet: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  arrowUp: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
}

const weeklyData = [
  { day: '周一', income: 120 },
  { day: '周二', income: 180 },
  { day: '周三', income: 95 },
  { day: '周四', income: 210 },
  { day: '周五', income: 260 },
  { day: '周六', income: 340 },
  { day: '周日', income: 186 },
]

const monthlyData = [
  { day: '第1周', income: 580 },
  { day: '第2周', income: 720 },
  { day: '第3周', income: 690 },
  { day: '第4周', income: 820 },
]

const transactions = [
  { id: 1, date: '06-20 14:32', title: '订单收入', detail: '20250620001', amount: 39, type: 'income' },
  { id: 2, date: '06-20 14:15', title: '订单收入', detail: '20250620002', amount: 30, type: 'income' },
  { id: 3, date: '06-20 13:50', title: '订单收入', detail: '20250620003', amount: 48, type: 'income' },
  { id: 4, date: '06-20 11:45', title: '退款支出', detail: '20250620006', amount: 18, type: 'expense' },
  { id: 5, date: '06-19 22:10', title: '配送费支出', detail: '骑手配送费', amount: 12, type: 'expense' },
]

export default function RevenueTab() {
  const { theme } = useApp()
  const isDark = theme === 'dark'
  const [chartType, setChartType] = useState('week')
  const [txFilter, setTxFilter] = useState('all')
  const [showReport, setShowReport] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const headerText = isDark ? '#F1F5F9' : '#0F172A'
  const headerSub = isDark ? '#94A3B8' : '#64748B'
  const cardBg = 'var(--c-card)'
  const border = 'var(--c-border)'

  const data = chartType === 'week' ? weeklyData : monthlyData
  const maxVal = Math.max(...data.map(d => d.income))

  const filteredTx = txFilter === 'all' ? transactions : transactions.filter(t => t.type === txFilter && t.amount !== undefined)

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const settled = totalIncome - totalExpense
  const serviceFee = totalIncome * 0.05

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', padding: '24px 16px', borderRadius: '0 0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>可结算余额</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              {I.calendar}
              <span>本周</span>
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>¥{settled.toFixed(2)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
            {I.arrowUp}
            <span>较上周 +18.5%</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>总收入</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>¥{totalIncome.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>总支出</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>¥{totalExpense.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[{ l: '今日收入', v: '¥186', up: '+12' }, { l: '本周收入', v: '¥1,391', up: '+18.5%' }, { l: '本月收入', v: '¥5,830', up: '+9.2%' }].map(s => (
              <div key={s.l} style={{ background: cardBg, borderRadius: 14, padding: 14, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: headerText }}>{s.v}</div>
                <div style={{ fontSize: 11, color: headerSub, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ background: cardBg, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: headerText }}>收入走势</span>
              <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: 10, padding: 3 }}>
                {['week', 'month'].map(t => (
                  <button key={t} onClick={() => setChartType(t)} style={{
                    padding: '4px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: chartType === t ? '#2563EB' : 'transparent', color: chartType === t ? '#fff' : headerSub,
                  }}>{t === 'week' ? '本周' : '本月'}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 8, paddingTop: 10 }}>
              {data.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', borderRadius: 6, background: '#2563EB', minHeight: 4, height: `${Math.max(6, (d.income / maxVal) * 100)}%`, transition: 'height .4s' }} />
                  <span style={{ fontSize: 10, color: headerSub }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: cardBg, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: headerText }}>收支明细</span>
              <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: 10, padding: 3 }}>
                {[{ k: 'all', l: '全部' }, { k: 'income', l: '收入' }, { k: 'expense', l: '支出' }].map(t => (
                  <button key={t.k} onClick={() => setTxFilter(t.k)} style={{
                    padding: '4px 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: txFilter === t.k ? '#2563EB' : 'transparent', color: txFilter === t.k ? '#fff' : headerSub,
                  }}>{t.l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredTx.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: headerText }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: headerSub, marginTop: 2 }}>{t.date} · {t.detail}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.type === 'income' ? '#22C55E' : '#EF4444' }}>{t.type === 'income' ? '+' : '-'}¥{t.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: cardBg, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: headerText, marginBottom: 10 }}>结算说明</div>
            <div style={{ fontSize: 13, color: headerSub, lineHeight: 1.8 }}>
              <p style={{ margin: '4px 0' }}>1. 平台服务费按订单收入的 5% 收取，当前累计 ¥{serviceFee.toFixed(2)}。</p>
              <p style={{ margin: '4px 0' }}>2. 配送费支出在订单完成后自动结算。</p>
              <p style={{ margin: '4px 0' }}>3. 可提现余额将在 T+1 日到账。</p>
            </div>
            <button onClick={() => showToast('提现功能开发中')} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>立即提现</button>
          </div>

          <button onClick={() => setShowReport(true)} style={{ width: '100%', padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: cardBg, color: headerText, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {I.chart} 查看经营报表
          </button>
        </div>
      </div>

      {showReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }} onClick={() => setShowReport(false)}>
          <div style={{ background: cardBg, borderRadius: 20, padding: 24, width: '90%', maxWidth: 380, border: `1px solid ${border}`, maxHeight: '80%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: headerText }}>经营报表</span>
              <button onClick={() => setShowReport(false)} style={{ border: 'none', background: 'transparent', color: headerSub, cursor: 'pointer' }}>{I.close}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[{ l: '订单数', v: 48 }, { l: '客单价', v: '¥28.5' }, { l: '复购率', v: '32%' }, { l: '好评率', v: '96%' }].map(s => (
                <div key={s.l} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: headerText }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: headerSub, marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: headerSub, lineHeight: 1.8 }}>
              <p>· 本周订单高峰集中在 12:00-13:00 与 17:30-19:00</p>
              <p>· 招牌奶茶与鸡肉卷饼套餐最受欢迎</p>
              <p>· 建议增加晚间饮品库存以提升转化</p>
            </div>
            <button onClick={() => showToast('报表导出功能开发中')} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>导出报表</button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 220 }}>{toast}</div>
      )}
    </div>
  )
}
