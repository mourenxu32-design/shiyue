import { useState, useEffect } from 'react'
import api, { getToken } from '../utils/api'

export default function AuthCenterPage({ onBack }) {
  const [tab, setTab] = useState('real')
  const [realAuthDone, setRealAuthDone] = useState(false)
  const [studentAuthDone, setStudentAuthDone] = useState(false)
  const [toast, setToast] = useState('')
  const [realName, setRealName] = useState('')
  const [realId, setRealId] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [eduEmail, setEduEmail] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api.users.profile().then(resp => {
      if (cancelled) return
      const u = resp?.data
      if (u?.is_realname_verified) setRealAuthDone(true)
      if (u?.is_student_verified) setStudentAuthDone(true)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleSubmitReal = async () => {
    if (!realName.trim() || !realId.trim()) { showToast('请填写完整信息'); return }
    try {
      await api.users.verifyRealname({ name: realName, id_number: realId })
      setRealAuthDone(true)
      showToast('实名认证提交成功！')
    } catch (err) { showToast(err?.message || '提交失败') }
  }

  const handleSubmitStudent = async () => {
    if (!schoolName.trim()) { showToast('请填写学校名称'); return }
    try {
      await api.users.verifyStudent({ school_name: schoolName, edu_email: eduEmail || undefined })
      setStudentAuthDone(true)
      showToast('学籍认证提交成功！')
    } catch (err) { showToast(err?.message || '提交失败') }
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, color: 'var(--c-text)' }}>认证中心</span>
      </div>

      <div className="sub-tabs">
        <div className={`sub-tab ${tab === 'real' ? 'active' : ''}`} onClick={() => setTab('real')}>实名认证</div>
        <div className={`sub-tab ${tab === 'student' ? 'active' : ''}`} onClick={() => setTab('student')}>学籍认证</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'real' && (
          <>
            {realAuthDone ? (
              <div className="card" style={{ margin: '0 0 12px', textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--c-text)' }}>实名认证已通过</div>
                <div style={{ fontSize: 13, color: 'var(--c-text2)', marginBottom: 4 }}>姓名：鹿**</div>
                <div style={{ fontSize: 13, color: 'var(--c-text2)' }}>身份证：320***********1234</div>
              </div>
            ) : (
              <>
                <div className="card" style={{ margin: '0 0 12px' }}>
                  <div className="form-label" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--c-text)', fontSize: 14 }}>姓名</div>
                  <input className="form-input" placeholder="请输入真实姓名" value={realName} onChange={e => setRealName(e.target.value)} />
                </div>
                <div className="card" style={{ margin: '0 0 12px' }}>
                  <div className="form-label" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--c-text)', fontSize: 14 }}>身份证号</div>
                  <input className="form-input" placeholder="请输入身份证号码" value={realId} onChange={e => setRealId(e.target.value)} />
                </div>
                <div className="card" style={{ margin: '0 0 12px' }}>
                  <div className="form-label" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--c-text)', fontSize: 14 }}>身份证照片</div>
                  <div className="upload-grid">
                    <div className="upload-item"><span className="plus">+</span><span>正面</span></div>
                    <div className="upload-item"><span className="plus">+</span><span>反面</span></div>
                  </div>
                </div>
                <button onClick={handleSubmitReal} className="btn btn-purple btn-block btn-lg" style={{ marginTop: 8 }}>提交实名认证</button>
              </>
            )}
          </>
        )}

        {tab === 'student' && (
          <>
            {studentAuthDone ? (
              <div className="card" style={{ margin: '0 0 12px', textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--c-text)' }}>学籍认证已通过</div>
                <div style={{ fontSize: 13, color: 'var(--c-text2)' }}>武汉大学 · 计算机学院</div>
              </div>
            ) : (
              <>
                <div className="card" style={{ margin: '0 0 12px' }}>
                  <div className="form-label" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--c-text)', fontSize: 14 }}>学校名称</div>
                  <input className="form-input" placeholder="请输入学校名称" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
                </div>
                <div className="card" style={{ margin: '0 0 12px' }}>
                  <div className="form-label" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--c-text)', fontSize: 14 }}>学生证照片</div>
                  <div className="upload-grid">
                    <div className="upload-item"><span className="plus">+</span><span>学生证首页</span></div>
                    <div className="upload-item"><span className="plus">+</span><span>注册页</span></div>
                  </div>
                </div>
                <div className="card" style={{ margin: '0 0 12px' }}>
                  <div className="form-label" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--c-text)', fontSize: 14 }}>教育邮箱验证</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" placeholder="xxx@whu.edu.cn" style={{ flex: 1 }} value={eduEmail} onChange={e => setEduEmail(e.target.value)} />
                    <button onClick={() => showToast('验证码已发送')} className="btn btn-purple btn-sm" style={{ flexShrink: 0 }}>发送验证码</button>
                  </div>
                </div>
                <button onClick={handleSubmitStudent} className="btn btn-purple btn-block btn-lg" style={{ marginTop: 8 }}>提交学籍认证</button>
              </>
            )}
            <div className="warning-bar yellow" style={{ borderRadius: 12, marginTop: 8 }}>
              💡 学籍认证后可解锁更多功能，发布和接单更受信任
            </div>
          </>
        )}
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, zIndex: 9999 }}>{toast}</div>}
    </div>
  )
}
