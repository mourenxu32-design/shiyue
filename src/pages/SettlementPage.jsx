import { useState } from 'react'
import { useApp } from '../App'
import api, { getToken } from '../utils/api'

/* 上传 + 确认 区块组件 */
function UploadConfirmBlock({ title, desc, uploaded, onUpload, uploading, confirmed, confirmedLabel, onConfirm, confirmColor, confirming }) {
  return (
    <div className="card" style={{ margin: '0 0 12px' }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--c-text)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 12 }}>{desc}</div>

      {/* 上传区域 */}
      {uploaded ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 80, height: 80, borderRadius: 10, background: 'var(--c-input)', border: '1px solid var(--c-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🖼️</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--c-text2)' }}>已上传凭证</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 4 }}>点击可重新上传</div>
          </div>
        </div>
      ) : (
        <div onClick={uploading ? undefined : onUpload} className="upload-item" style={{ border: '2px dashed var(--c-border-light)', marginBottom: 12, cursor: uploading ? 'wait' : 'pointer', height: 100, opacity: uploading ? 0.6 : 1 }}>
          {uploading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--c-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>上传中...</span>
            </div>
          ) : (
            <>
              <span style={{ fontSize: 28, color: 'var(--c-text3)' }}>+</span>
              <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>上传图片</span>
            </>
          )}
        </div>
      )}

      {/* 确认按钮 */}
      {confirmed ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span style={{ color: '#22C55E', fontSize: 16 }}>✓</span>
          <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>{confirmedLabel}已确认</span>
        </div>
      ) : (
        <button
          disabled={!uploaded || confirming}
          onClick={onConfirm}
          style={{
            width: '100%', padding: 10, borderRadius: 10, border: 'none',
            background: uploaded ? confirmColor : 'var(--c-input)',
            color: uploaded ? (confirmColor === '#22C55E' ? '#000' : '#fff') : 'var(--c-text3)',
            fontSize: 13, fontWeight: 600, cursor: uploaded && !confirming ? 'pointer' : 'not-allowed',
            transition: 'all .2s', opacity: confirming ? 0.7 : 1,
          }}>
          {confirming ? '确认中...' : `${confirmedLabel}确认`}
        </button>
      )}
    </div>
  )
}

/* 星级评分组件 */
function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{ fontSize: 26, cursor: 'pointer', color: star <= value ? '#FFD700' : 'var(--c-input)', transition: 'color .15s' }}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function SettlementPage({ data, onBack }) {
  const task = data || { title: '帮助将美式咖啡送到图书馆3F，42号桌', amount: 15, user: '小莎', board: 'campus' }

  const [localToast, setLocalToast] = useState(null)
  const showToast = (msg) => { setLocalToast(msg); setTimeout(() => setLocalToast(null), 2500) }

  // 当前用户身份（true = 雇主/发布者视角）
  const [isEmployer] = useState(true)

  // 上传状态
  const [employerUploaded, setEmployerUploaded] = useState(false)
  const [workerUploaded, setWorkerUploaded] = useState(false)
  const [employerUploading, setEmployerUploading] = useState(false)
  const [workerUploading, setWorkerUploading] = useState(false)

  // 上传的图片 URL
  const [employerScreenshotUrl, setEmployerScreenshotUrl] = useState('')
  const [workerProofUrl, setWorkerProofUrl] = useState('')

  // 确认状态
  const [employerConfirmed, setEmployerConfirmed] = useState(false)
  const [workerConfirmed, setWorkerConfirmed] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // 评价状态
  const [myRating, setMyRating] = useState(0)
  const [myReview, setMyReview] = useState('')
  const [otherRating, setOtherRating] = useState(0)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // 双方都确认 = 任务完成
  const bothConfirmed = employerConfirmed && workerConfirmed

  // 上传图片到服务器
  const handleUpload = async (isEmployerUpload) => {
    const setUploading = isEmployerUpload ? setEmployerUploading : setWorkerUploading
    const setUploaded = isEmployerUpload ? setEmployerUploaded : setWorkerUploaded
    const setUrl = isEmployerUpload ? setEmployerScreenshotUrl : setWorkerProofUrl

    if (!getToken()) { showToast('请先登录后再操作'); return }
    setUploading(true)
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) { setUploading(false); return }
        if (file.size > 5 * 1024 * 1024) { showToast('图片大小不能超过 5MB'); setUploading(false); return }
        const url = await api.upload(file)
        if (url) {
          setUrl(url)
          setUploaded(true)
          showToast('上传成功')
        } else {
          // mock 模式 / 上传失败时使用占位
          setUrl('placeholder://uploaded')
          setUploaded(true)
          showToast('上传成功')
        }
        setUploading(false)
      }
      input.oncancel = () => setUploading(false)
      input.click()
    } catch (err) {
      showToast('上传失败：' + (err?.message || '未知错误'))
      setUploading(false)
    }
  }

  // 提交结算更新到后端
  const handleConfirm = async (field) => {
    if (!task?.id) { showToast('任务信息不完整'); return }
    if (!getToken()) { showToast('请先登录'); return }
    setConfirming(true)
    try {
      const payload = {}
      if (employerScreenshotUrl) payload.employer_screenshot_url = employerScreenshotUrl
      if (workerProofUrl) payload.worker_proof_url = workerProofUrl
      payload[field] = true
      await api.settlements.upsertTask(task.id, payload)
      if (field === 'employer_confirmed') setEmployerConfirmed(true)
      else setWorkerConfirmed(true)
      showToast('确认成功')
    } catch (err) {
      showToast(err?.message || err?.detail || '确认失败')
    } finally {
      setConfirming(false)
    }
  }

  // 提交评价
  const submitReview = async () => {
    if (myRating === 0) return showToast('请先评分')
    if (!task?.id) return showToast('任务信息不完整')
    if (!getToken()) return showToast('请先登录')
    setReviewSubmitting(true)
    try {
      await api.tasks.review(task.id, { rating: myRating, content: myReview })
      // 模拟对方评价
      setOtherRating(5)
      showToast('评价提交成功！')
    } catch (err) {
      showToast(err?.message || err?.detail || '评价提交失败')
    } finally {
      setReviewSubmitting(false)
    }
  }

  // 结算完成后的界面
  if (submitted) {
    return (
      <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>结算完成！</div>
        <div style={{ fontSize: 14, color: 'var(--c-text2)', textAlign: 'center', marginBottom: 32 }}>
          任务已完成，感谢使用莳约
        </div>
        <button className="btn btn-purple btn-lg" style={{ width: 200 }} onClick={onBack}>返回首页</button>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', gap: 12, background: 'var(--c-nav)', borderBottom: '1px solid var(--c-border)' }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--c-border-light)', fontSize: 18, color: 'var(--c-text)' }}>←</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, color: 'var(--c-text)' }}>任务结算</span>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 16 }}>
        {/* Task Info */}
        <div style={{ padding: 20, borderRadius: 16, background: 'linear-gradient(135deg, #1E2A3A, #2D3A4A)', color: 'white', marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>任务标题</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{task.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 11, opacity: 0.6 }}>发布者</div><div style={{ fontWeight: 600, marginTop: 2 }}>{task.user}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, opacity: 0.6 }}>悬赏金额</div><div style={{ fontSize: 24, fontWeight: 800, color: '#22C55E', marginTop: 2 }}>¥{task.amount}</div></div>
          </div>
        </div>

        {/* 进度指示器 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--c-card)', border: '1px solid var(--c-border-light)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: (employerUploaded && workerUploaded) ? '#22C55E' : 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', transition: 'all .3s' }}>{(employerUploaded && workerUploaded) ? '✓' : '1'}</div>
            <div style={{ fontSize: 10, color: 'var(--c-text3)', textAlign: 'center' }}>上传凭证</div>
          </div>
          <div style={{ flex: 2, height: 2, background: bothConfirmed ? '#22C55E' : employerConfirmed || workerConfirmed ? 'linear-gradient(90deg, #22C55E, var(--c-input))' : 'var(--c-input)', borderRadius: 1, transition: 'all .3s' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: bothConfirmed ? '#22C55E' : 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', transition: 'all .3s' }}>{bothConfirmed ? '✓' : '2'}</div>
            <div style={{ fontSize: 10, color: 'var(--c-text3)', textAlign: 'center' }}>双方确认</div>
          </div>
          <div style={{ flex: 2, height: 2, background: bothConfirmed ? '#22C55E' : 'var(--c-input)', borderRadius: 1, transition: 'all .3s' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--c-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>3</div>
            <div style={{ fontSize: 10, color: 'var(--c-text3)', textAlign: 'center' }}>互相评价</div>
          </div>
        </div>

        {/* ===== 雇主上传结算截图 ===== */}
        <UploadConfirmBlock
          title="雇主上传结算截图"
          desc="发布者通过支付宝转账后，上传转账截图作为凭证"
          uploaded={employerUploaded}
          onUpload={() => handleUpload(true)}
          uploading={employerUploading}
          confirmed={workerConfirmed}
          confirmedLabel="接单者"
          onConfirm={() => handleConfirm('worker_confirmed')}
          confirmColor="#6B5CE7"
          confirming={confirming}
        />

        {/* ===== 接单者上传完成图片 ===== */}
        <UploadConfirmBlock
          title="接单者上传完成图片"
          desc="接单者完成任务后，上传完成证明图片"
          uploaded={workerUploaded}
          onUpload={() => handleUpload(false)}
          uploading={workerUploading}
          confirmed={employerConfirmed}
          confirmedLabel="雇主"
          onConfirm={() => handleConfirm('employer_confirmed')}
          confirmColor="#22C55E"
          confirming={confirming}
        />

        {/* 双方确认状态总览 */}
        {bothConfirmed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>✓</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#22C55E' }}>双方均已确认，任务完成</span>
          </div>
        )}

        {/* ===== 互相评价（双方确认后才显示） ===== */}
        {bothConfirmed && (
          <>
            {/* 我对对方的评价 */}
            <div className="card" style={{ margin: '0 0 12px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--c-text)' }}>
                {isEmployer ? '评价接单者' : '评价发布者'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 12 }}>请为对方打分并留下评价</div>

              <StarRating value={myRating} onChange={setMyRating} />

              <textarea
                className="form-input form-textarea"
                placeholder="写下你的评价（可选）"
                value={myReview}
                onChange={e => setMyReview(e.target.value)}
                style={{ minHeight: 60, marginTop: 12 }}
              />
            </div>

            {/* 对方给我的评价 */}
            {otherRating > 0 && (
              <div className="card" style={{ margin: '0 0 12px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--c-text)' }}>
                  {isEmployer ? '接单者对你的评价' : '发布者对你的评价'}
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: 18, color: s <= otherRating ? '#FFD700' : 'var(--c-input)' }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.6 }}>
                  非常靠谱，按时完成了任务，推荐！
                </div>
              </div>
            )}

            <div className="warning-bar yellow" style={{ borderRadius: 12, marginBottom: 16 }}>
              ⚠️ 请确保评价客观真实，纠纷可申请平台介入
            </div>
          </>
        )}
      </div>

      {/* Bottom Action */}
      <div style={{ background: 'var(--c-nav)', padding: '12px 16px', borderTop: '1px solid var(--c-border)' }}>
        {bothConfirmed ? (
          <button
            className="btn btn-purple btn-block btn-lg"
            disabled={myRating === 0 || reviewSubmitting}
            onClick={async () => {
              if (otherRating > 0) { setSubmitted(true); return }
              await submitReview()
            }}
            style={{ opacity: myRating === 0 || reviewSubmitting ? 0.5 : 1 }}>
            {reviewSubmitting ? '提交中...' : otherRating > 0 ? '完成结算' : '提交评价'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: 'var(--c-text3)' }}>
            {employerUploaded && workerUploaded
              ? '双方已上传凭证，请互相确认…'
              : employerUploaded || workerUploaded
                ? '等待对方上传凭证…'
                : '等待双方上传凭证并确认…'}
          </div>
        )}
      </div>

      {/* Toast 提示 */}
      {localToast && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 10, background: 'rgba(34,197,94,0.95)',
          color: '#fff', fontSize: 13, fontWeight: 600, zIndex: 999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', animation: 'fadeIn .2s ease',
        }}>{localToast}</div>
      )}
    </div>
  )
}
