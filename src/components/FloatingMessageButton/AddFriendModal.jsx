/**
 * 悬浮消息按钮 - 添加好友弹窗组件
 * @module AddFriendModal
 */

/**
 * 添加好友弹窗
 * @param {Object} props
 * @param {string} props.newFriendName - 新好友名称
 * @param {Function} props.onNameChange - 名称变化回调
 * @param {Function} props.onAdd - 添加回调
 * @param {Function} props.onCancel - 取消回调
 */
export function AddFriendModal({ newFriendName, onNameChange, onAdd, onCancel }) {
  const handleKeyDown = (e) => {
    e.stopPropagation()
    if (e.key === 'Enter') onAdd()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => { e.stopPropagation(); onCancel() }}
    >
      <div
        style={{
          width: '85%', maxWidth: 340, background: 'var(--c-card)', borderRadius: 20,
          padding: '28px 24px', border: '1px solid var(--c-border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          animation: 'modalPopIn .25s cubic-bezier(.16,1,.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>
          添加好友
        </div>
        <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 20 }}>
          输入好友昵称或邀请码添加好友
        </div>
        <input
          className="form-input"
          placeholder="输入昵称或邀请码"
          value={newFriendName}
          onChange={e => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--c-border)',
              background: 'transparent', color: 'var(--c-text2)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={onAdd}
            style={{
              flex: 1, padding: 12, borderRadius: 12, border: 'none',
              background: '#2563EB', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}
