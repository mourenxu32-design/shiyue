/**
 * 悬浮消息按钮 - 模拟数据
 * @module mockData
 */

/**
 * @typedef {Object} Conversation
 * @property {number} id
 * @property {string} user
 * @property {string} avatar
 * @property {string} gender
 * @property {string} lastMsg
 * @property {string} time
 * @property {number} unread
 * @property {boolean} online
 * @property {string} task
 * @property {boolean} pinned
 * @property {string} board
 */

/** @type {Conversation[]} */
export const conversations = [
  { id: 1, user: '小莎', avatar: '莎', gender: 'female', lastMsg: '好的，我大概半小时到', time: '14:22', unread: 2, online: true, task: '帮取快递', pinned: true, board: 'campus' },
  { id: 2, user: '陈老师', avatar: '陈', gender: 'female', lastMsg: '问卷链接已发你邮箱，请查收', time: '13:10', unread: 1, online: true, task: '心理调查', pinned: false, board: 'campus' },
  { id: 3, user: '马哥', avatar: '马', gender: 'male', lastMsg: '取件码请私信我', time: '昨天', unread: 0, online: false, task: '快递代取', pinned: false, board: 'campus' },
  { id: 4, user: '大四学姐', avatar: '四', gender: 'female', lastMsg: '表格已经收到了，谢谢你！', time: '昨天', unread: 0, online: false, task: '交表格', pinned: false, board: 'campus' },
  { id: 5, user: '方舟博士', avatar: '方', gender: 'male', lastMsg: '妆面很满意，下次还找你~', time: '周一', unread: 0, online: true, task: 'Cos妆造', pinned: false, board: 'cos' },
  { id: 6, user: '万事屋', avatar: '万', gender: 'male', lastMsg: '假发修剪好了，明天寄出', time: '周日', unread: 0, online: false, task: '假发造型', pinned: false, board: 'cos' },
]

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} title
 * @property {string} msg
 * @property {string} time
 * @property {string} icon
 * @property {string} color
 * @property {boolean} read
 */

/** @type {Message[]} */
export const systemMessages = [
  { id: 's1', title: '系统维护', msg: '系统将于今晚 02:00 进行升级维护，预计持续 1 小时', time: '04:05', icon: '🔧', color: '#10B981', read: false },
  { id: 's2', title: '版本更新', msg: 'v1.2.3 新版本已发布，包含性能优化和 Bug 修复', time: '昨天', icon: '📦', color: '#A855F7', read: false },
]

/** @type {Message[]} */
export const taskMessages = [
  { id: 't1', title: '新任务分配', msg: '您被分配了一个新任务：帮取快递，请及时处理', time: '2026-01-15', icon: '✅', color: '#EF4444', read: false },
  { id: 't2', title: '任务变更', msg: '您的任务"Cos 妆造"的需求有所变更，请查看详情', time: '2026-01-14', icon: '🔄', color: '#2563EB', read: false },
  { id: 't3', title: '任务取消', msg: '任务"道具定制"已被发布者取消，原因：找到其他提供者', time: '2026-01-13', icon: '❌', color: '#9CA3AF', read: true },
]

/** @type {Message[]} */
export const interactMessages = [
  { id: 'i1', title: '点赞', msg: '方舟博士给您的 Cos 帖子点了赞', time: '2026-01-16', icon: '❤️', color: '#EF4444', read: false },
  { id: 'i2', title: '收藏', msg: '万事屋收藏了您的 Cos 作品「雷电将军」', time: '2026-01-15', icon: '⭐', color: '#F59E0B', read: true },
  { id: 'i3', title: '评论', msg: '大四学姐评论了您的帖子：「做得非常好！」', time: '2026-01-14', icon: '💬', color: '#A855F7', read: true },
]

/**
 * @typedef {Object} Friend
 * @property {number} id
 * @property {string} name
 * @property {string} avatar
 * @property {string} gender
 * @property {boolean} online
 * @property {string} group
 */

/** @type {Friend[]} */
export const defaultFriends = [
  { id: 1, name: '小莎', avatar: '莎', gender: 'female', online: true, group: '常用搭档' },
  { id: 2, name: '马哥', avatar: '马', gender: 'male', online: false, group: '常用搭档' },
  { id: 3, name: '方舟博士', avatar: '方', gender: 'male', online: true, group: 'Cos圈' },
  { id: 4, name: '万事屋', avatar: '万', gender: 'male', online: false, group: 'Cos圈' },
  { id: 5, name: '陈老师', avatar: '陈', gender: 'female', online: true, group: '学业互助' },
  { id: 6, name: '大四学姐', avatar: '四', gender: 'female', online: false, group: '学业互助' },
  { id: 7, name: '研究生小王', avatar: '研', gender: 'male', online: true, group: '技能合作' },
  { id: 8, name: '雷电将军', avatar: '雷', gender: 'male', online: false, group: 'Cos圈' },
]

/** 好友分组列表 */
export const defaultGroups = ['全部', '常用搭档', 'Cos圈', '学业互助', '技能合作']
