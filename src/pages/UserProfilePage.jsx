import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

/* 性别图标组件 */
function GenderBadge({ gender, size = 20 }) {
  if (gender === 'male') {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6,
        background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
          <circle cx="10" cy="14" r="7"/><path d="M21 3l-6.5 6.5"/><path d="M16 3h5v5"/>
        </svg>
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
        <circle cx="12" cy="9" r="7"/><path d="M12 16v6"/><path d="M9 19h6"/>
      </svg>
    </div>
  )
}

/* 用户数据 */
const USERS = {
  '小莎': {
    name: '小莎', avatar: '莎', gender: 'female', school: '武汉大学 · 外语学院',
    verified: true, realName: true, memberType: '月卡会员', memberColor: '#8B5CF6',
    creditScore: 88, published: 15, completed: 22, rating: 94,
    bio: '外语专业大三，擅长英语口语，空闲时间接单赚零花钱~',
    recentTasks: [
      { id: 1, title: '帮取快递送到3舍', amount: 12, time: '2小时前', status: 'completed' },
      { id: 2, title: '代买瑞幸生椰拿铁', amount: 8, time: '5小时前', status: 'completed' },
      { id: 3, title: '图书馆占座', amount: 6, time: '昨天', status: 'completed' },
    ],
    gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
  },
  '马哥': {
    name: '马哥', avatar: '马', gender: 'male', school: '武汉大学 · 机械工程学院',
    verified: true, realName: true, memberType: null, memberColor: null,
    creditScore: 91, published: 8, completed: 45, rating: 98,
    bio: '大四工科男，跑腿速度快，好评率高！',
    recentTasks: [
      { id: 4, title: '南门取快递包裹', amount: 10, time: '1小时前', status: 'completed' },
      { id: 5, title: '帮买打印资料', amount: 8, time: '3小时前', status: 'completed' },
    ],
    gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
  },
  '方舟博士': {
    name: '方舟博士', avatar: '方', gender: 'male', school: '华中科技大学 · 计算机学院',
    verified: true, realName: false, memberType: '季卡会员', memberColor: '#F59E0B',
    creditScore: 95, published: 28, completed: 12, rating: 96,
    bio: '原神深度玩家，Cos道具定制接单中~',
    recentTasks: [
      { id: 6, title: '明日方舟阿米娅妆面', amount: 120, time: '昨天', status: 'completed' },
      { id: 7, title: '雷神薙刀定制', amount: 350, time: '3天前', status: 'ongoing' },
    ],
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  },
  '陈老师': {
    name: '陈老师', avatar: '陈', gender: 'female', school: '武汉大学 · 心理学院',
    verified: true, realName: true, memberType: '年卡会员', memberColor: '#D4A853',
    creditScore: 99, published: 56, completed: 3, rating: 100,
    bio: '心理学研究生，课题研究需要参与者，报酬丰厚~',
    recentTasks: [
      { id: 8, title: '心理调查问卷（15分钟）', amount: 30, time: '2小时前', status: 'ongoing' },
    ],
    gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
  },
  '研二学长': {
    name: '研二学长', avatar: '研', gender: 'male', school: '武汉大学 · 计算机学院',
    verified: true, realName: true, memberType: '月卡会员', memberColor: '#8B5CF6',
    creditScore: 93, published: 42, completed: 38, rating: 97,
    bio: '计算机研二在读，擅长编程辅导，Python/Java/C++均可',
    recentTasks: [
      { id: 9, title: 'Python编程一对一辅导', amount: 80, time: '1小时前', status: 'ongoing' },
      { id: 10, title: '数据结构作业辅导', amount: 60, time: '昨天', status: 'completed' },
    ],
    gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
  },
}

export default function UserProfilePage({ data, onBack }) {
  const { openSubPage, theme } = useApp()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const [apiUser, setApiUser] = useState(null)

  const userName = data?.user || data?.name || '小莎'
  const mockUser = USERS[userName] || USERS['小莎']

  // 尝试从 API 加载用户资料
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.profile().then(resp => {
      if (cancelled) return
      const u = resp?.data
      if (u) {
        setApiUser({
          name: u.nickname, avatar: (u.nickname || 'U')[0],
          gender: u.gender === 1 ? 'male' : 'female',
          school: u.school_name || '',
          verified: !!u.is_student_verified, realName: !!u.is_realname_verified,
          memberType: u.member_type || null,
          memberColor: u.member_type?.includes('年') ? '#D4A853' : u.member_type?.includes('季') ? '#F59E0B' : '#8B5CF6',
          creditScore: u.credit_score ?? 90,
          published: u.published_count ?? 0, completed: u.completed_count ?? 0,
          rating: u.good_rate ?? 95, bio: '', recentTasks: [],
          gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        })
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  // 如果查看的是自己的主页，用 API 数据；否则用 mock
  const isSelf = data?.isSelf || (apiUser && apiUser.name === userName)
  const user = isSelf && apiUser ? apiUser : mockUser

  const handleFollow = async () => {
    if (!getToken()) { showToast('请先登录'); return }
    setFollowLoading(true)
    try {
      // 后端暂无关注接口，先切换本地状态
      setIsFollowing(!isFollowing)
      showToast(isFollowing ? '已取消关注' : '已关注')
    } finally { setFollowLoading(false) }
  }

  const isDark = theme === 'dark'
  const cardBg = isDark ? '#1E2536' : 'var(--c-card)'
  const border = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const subColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)' }}>
      {/* 顶部导航栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)', flexShrink: 0 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-text2)" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--c-text)' }}>用户主页</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* 头像 + 基本信息 */}
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 22,
                background: user.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#fff', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}>{user.avatar}</div>
              {/* 性别符号 - 左下角 */}
              <div style={{ position: 'absolute', bottom: -2, left: -2 }}>
                <GenderBadge gender={user.gender} size={22} />
              </div>
              {/* 认证角标 - 右下角 */}
              {user.verified && (
                <div style={{
                  position: 'absolute', bottom: -3, right: -3,
                  width: 22, height: 22, borderRadius: 7,
                  background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2.5px solid var(--c-bg)',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
              )}
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-text)' }}>{user.name}</span>
                {user.memberType && (
                  <span style={{
                    background: `linear-gradient(135deg, ${user.memberColor}, ${user.memberColor}CC)`,
                    color: '#fff', padding: '2px 10px', borderRadius: 6,
                    fontSize: 10, fontWeight: 700,
                  }}>{user.memberType}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: subColor, marginBottom: 10, fontWeight: 500 }}>{user.school}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {user.verified && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(34,197,94,0.08)', color: '#22C55E',
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </span>
                    学生认证
                  </span>
                )}
                {user.realName && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(59,130,246,0.08)', color: '#3B82F6',
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </span>
                    实名认证
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 个人简介 */}
          {user.bio && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 12,
              background: cardBg, border: `1px solid ${border}`,
              fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.6,
            }}>{user.bio}</div>
          )}

          {/* 数据统计 */}
          <div style={{ display: 'flex', marginTop: 16, background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
            {[
              { label: '信用分', value: user.creditScore, accent: '#4ADE80' },
              { label: '发布', value: user.published, accent: 'var(--c-text)' },
              { label: '完成', value: user.completed, accent: 'var(--c-text)' },
              { label: '好评率', value: `${user.rating}%`, accent: '#F59E0B' },
            ].map((item, i) => (
              <div key={item.label} style={{
                flex: 1, textAlign: 'center', padding: '16px 0 14px',
                borderRight: i < 3 ? `1px solid ${border}` : 'none',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.accent, fontFamily: "'DIN Alternate', 'SF Mono', monospace", lineHeight: 1 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 10, color: subColor, marginTop: 5, fontWeight: 500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ padding: '20px 20px 0', display: 'flex', gap: 10 }}>
          <button onClick={handleFollow} disabled={followLoading} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            border: isFollowing ? '1px solid var(--c-border)' : 'none',
            background: isFollowing ? 'transparent' : '#2563EB',
            color: isFollowing ? 'var(--c-text3)' : '#fff',
            fontSize: 14, fontWeight: 700, cursor: followLoading ? 'not-allowed' : 'pointer', transition: 'all .2s',
            boxShadow: isFollowing ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
            opacity: followLoading ? 0.6 : 1,
          }}>
            {isFollowing ? '已关注' : '+ 关注'}
          </button>
          <button onClick={() => openSubPage('chat', { user: user.name, avatar: user.avatar, task: '私信' })} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            border: '1px solid var(--c-border)', background: 'transparent',
            color: 'var(--c-text)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -2, marginRight: 4 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            发消息
          </button>
        </div>

        {/* 最近任务记录 */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 10, letterSpacing: 0.5 }}>最近任务</div>
          <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden' }}>
            {user.recentTasks.map((task, i) => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: i < user.recentTasks.length - 1 ? `1px solid ${border}` : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>{task.time}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#10B981', fontFamily: "'DIN Alternate', 'SF Mono', monospace" }}>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>¥</span>{task.amount}
                  </span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 600,
                    background: task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.1)',
                    color: task.status === 'completed' ? '#10B981' : '#2563EB',
                  }}>{task.status === 'completed' ? '已完成' : '进行中'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部留白 */}
        <div style={{ padding: '28px 0 40px' }} />
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
