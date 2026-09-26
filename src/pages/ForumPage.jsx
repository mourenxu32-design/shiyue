import { useState, useEffect } from 'react'
import { useApp } from '../App'
import api from '../utils/api'
import { getBoardStatus, getUserBoardPref } from '../utils/boardStatus'

/* 相对时间格式化 */
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

/* API 帖子 → 前端卡片字段映射 */
function mapApiPost(p) {
  return {
    id: String(p.id), type: p.post_type || 'discuss', board: p.board || 'campus',
    title: p.title || '', content: p.content || '',
    images: p.images || [], tags: p.tags || [],
    author: { name: p.author_nickname || `用户${p.author_id}`, avatar: (p.author_nickname || 'U')[0], verified: !!p.author_verified },
    time: timeAgo(p.created_at), distance: '',
    likes: p.likes_count || 0, comments: p.comments_count || 0,
    favorited: false, resolved: !!p.is_resolved,
    voteOptions: p.vote_options || null, voteTotal: p.vote_total || 0, votedOption: null,
    carpoolTime: p.carpool_time, carpoolFrom: p.carpool_from, carpoolTo: p.carpool_to,
    carpoolHave: p.carpool_have || 0, carpoolNeed: p.carpool_need || 0,
  }
}

/* 帖子类型配置 */
const POST_TYPES = {
  help:     { label: '求助', icon: '❓', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  discuss:  { label: '讨论', icon: '💬', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  intel:    { label: '情报', icon: '📡', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  share:    { label: '分享', icon: '📝', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  carpool:  { label: '拼车', icon: '🚗', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  exchange: { label: '交换', icon: '🔄', color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  vote:     { label: '投票', icon: '📊', color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
}

/* Mock帖子数据 */
const allPosts = {
  campus: [
    { id: 'fp1', type: 'help', board: 'campus', title: '有没有人知道图书馆自习室怎么预约？', content: '今天去图书馆发现自习室全满了，听说可以线上预约但不知道怎么操作，求大佬指点！', images: [], author: { name: '考研小王', avatar: '王', verified: true }, tags: ['图书馆'], time: '10分钟前', distance: '200m', likes: 12, comments: 8, favorited: false, resolved: false },
    { id: 'fp2', type: 'discuss', board: 'campus', title: '大家觉得食堂三楼新开的窗口怎么样？', content: '今天去试了一下，感觉味道还行但价格偏贵，一份盖浇饭要18块，你们觉得值不值？', images: ['https://picsum.photos/seed/food1/200/200'], author: { name: '吃货大学生', avatar: '吃', verified: false }, tags: ['食堂'], time: '30分钟前', distance: '500m', likes: 45, comments: 23, favorited: false },
    { id: 'fp3', type: 'intel', board: 'campus', title: '', content: '注意！明天上午9点到12点西区宿舍停电检修，大家提前充好电、备好热水。教务系统也会维护，别赶deadline。', images: [], author: { name: '学生会小李', avatar: '李', verified: true }, tags: ['通知'], time: '1小时前', distance: '1km', likes: 89, comments: 5, favorited: false, outdated: false },
    { id: 'fp4', type: 'share', board: 'campus', title: '分享几个超好用的学习APP', content: '大学四年积累了一些好用的学习工具，整理了一下分享给大家，每个都附了使用心得~', images: ['https://picsum.photos/seed/app1/200/200', 'https://picsum.photos/seed/app2/200/200'], author: { name: '学霸学姐', avatar: '学', verified: true }, tags: ['学习'], time: '2小时前', distance: '800m', likes: 156, comments: 34, favorited: false },
    { id: 'fp5', type: 'carpool', board: 'campus', title: '周六拼车去火车站', content: '周六早上8点出发去武汉站，已有2人，还差2人满座。', images: [], author: { name: '回家达人', avatar: '达', verified: false }, tags: ['出行'], time: '3小时前', distance: '300m', likes: 8, comments: 12, favorited: false, carpoolTime: '周六 08:00', carpoolFrom: '校门口', carpoolTo: '武汉站', carpoolHave: 2, carpoolNeed: 2 },
    { id: 'fp6', type: 'exchange', board: 'campus', title: '高数课本换英语四六级资料', content: '我有大一高数课本（第七版，几乎全新），想换四六级备考资料或网课账号。', images: [], author: { name: '换书小能手', avatar: '换', verified: false }, tags: ['交换'], time: '5小时前', distance: '600m', likes: 5, comments: 3, favorited: false },
    { id: 'fp7', type: 'vote', board: 'campus', title: '下学期选修课你们选什么？', content: '马上要选课了，来投个票看看大家的选择~', images: [], author: { name: '选课纠结症', avatar: '选', verified: false }, tags: ['选课'], time: '6小时前', distance: '400m', likes: 67, comments: 41, favorited: false, voteOptions: [{ id: 'v1', text: '影视鉴赏', count: 45 }, { id: 'v2', text: '心理学导论', count: 38 }, { id: 'v3', text: '创业基础', count: 22 }, { id: 'v4', text: 'Python编程', count: 51 }], votedOption: null, voteTotal: 156 },
    { id: 'fp8', type: 'help', board: 'campus', title: '求推荐靠谱的驾校', content: '暑假想学车，学校附近有没有推荐的驾校？最好有学长学姐去过的，价格透明那种。', images: [], author: { name: '准司机小张', avatar: '张', verified: false }, tags: ['驾校'], time: '昨天', distance: '200m', likes: 23, comments: 15, favorited: false, resolved: true },
  ],
  cos: [
    { id: 'fc1', type: 'discuss', board: 'cos', title: '暑假CP30准备出什么角色？', content: '今年CP30规模好像更大了，大家都在准备什么角色？来聊聊~', images: [], author: { name: '漫展老手', avatar: '漫', verified: true }, tags: ['漫展'], time: '20分钟前', distance: '2km', likes: 78, comments: 56, favorited: false },
    { id: 'fc2', type: 'share', board: 'cos', title: '自制EVA盔甲过程分享', content: '花了一个月时间用EVA泡沫做了一套盔甲，从切割到上色全过程记录，希望对大家有帮助。', images: ['https://picsum.photos/seed/cos1/200/200', 'https://picsum.photos/seed/cos2/200/200', 'https://picsum.photos/seed/cos3/200/200'], author: { name: '道具大师', avatar: '道', verified: true }, tags: ['道具'], time: '1小时前', distance: '5km', likes: 234, comments: 45, favorited: false },
    { id: 'fc3', type: 'help', board: 'cos', title: '第一次出cos，求假发打理教程', content: '刚入坑，买了一顶银色长假发，完全不知道怎么打理和造型，有没有大佬教教？', images: [], author: { name: '萌新coser', avatar: '萌', verified: false }, tags: ['假发'], time: '2小时前', distance: '1km', likes: 34, comments: 21, favorited: false, resolved: false },
    { id: 'fc4', type: 'intel', board: 'cos', title: '', content: '提醒：XX动漫城三楼新开了假发造型店，今天去体验了一下，修剪技术不错，价格比网上便宜。老板说学生打八折。', images: [], author: { name: '情报员小K', avatar: 'K', verified: false }, tags: ['店铺'], time: '4小时前', distance: '3km', likes: 56, comments: 12, favorited: false },
    { id: 'fc5', type: 'exchange', board: 'cos', title: '出闲置明日方舟阿米娅全套cos服', content: '穿过一次漫展，S码，含假发+鞋子+道具，打包出。', images: ['https://picsum.photos/seed/cos4/200/200'], author: { name: '退坑回血', avatar: '退', verified: false }, tags: ['出物'], time: '6小时前', distance: '4km', likes: 12, comments: 8, favorited: false },
    { id: 'fc6', type: 'vote', board: 'cos', title: '下一期团片出什么作品？', content: '社团经费有限，大家投票决定下一期团片吧~', images: [], author: { name: '社长', avatar: '社', verified: true }, tags: ['社团'], time: '昨天', distance: '1km', likes: 89, comments: 34, favorited: false, voteOptions: [{ id: 'v1', text: '鬼灭之刃', count: 67 }, { id: 'v2', text: '咒术回战', count: 45 }, { id: 'v3', text: '间谍过家家', count: 38 }], votedOption: null, voteTotal: 150 },
    { id: 'fc7', type: 'carpool', board: 'cos', title: '拼车去漫展！周日早场', content: '周日早7点从学校出发去会展中心，开车可带2人+装备。', images: [], author: { name: '老司机阿明', avatar: '明', verified: false }, tags: ['出行'], time: '昨天', distance: '800m', likes: 15, comments: 6, favorited: false, carpoolTime: '周日 07:00', carpoolFrom: '学校南门', carpoolTo: '会展中心', carpoolHave: 1, carpoolNeed: 2 },
    { id: 'fc8', type: 'share', board: 'cos', title: '分享我的化妆台收纳方案', content: 'cos化妆品越来越多，终于找到了一套高效的收纳方案，分享给大家参考。', images: ['https://picsum.photos/seed/cos5/200/200'], author: { name: '收纳达人', avatar: '纳', verified: false }, tags: ['化妆'], time: '2天前', distance: '2km', likes: 167, comments: 28, favorited: false },
  ],
  craft: [
    { id: 'fk1', type: 'discuss', board: 'craft', title: 'Blender和C4D新手选哪个入门？', content: '想学3D建模，看了一圈教程，感觉Blender免费但教程多而杂，C4D教程体系好但要付费。新手该怎么选？', images: [], author: { name: '3D新手小白', avatar: '3', verified: false }, tags: ['建模'], time: '15分钟前', distance: '1km', likes: 34, comments: 28, favorited: false },
    { id: 'fk2', type: 'share', board: 'craft', title: '自学3个月的作品集分享', content: '从零开始学UI设计三个月了，分享一下我的学习路线和作品集，希望能帮到同样在自学的朋友。', images: ['https://picsum.photos/seed/ui1/200/200', 'https://picsum.photos/seed/ui2/200/200'], author: { name: '自学设计师', avatar: '自', verified: true }, tags: ['UI设计'], time: '1小时前', distance: '2km', likes: 189, comments: 42, favorited: false },
    { id: 'fk3', type: 'help', board: 'craft', title: 'PR导出视频一直卡在99%怎么解决？', content: '用Premiere Pro剪了个5分钟的视频，导出到99%就卡住不动了，试了三次都一样。系统是Win11，内存16G。', images: [], author: { name: '剪辑新人', avatar: '剪', verified: false }, tags: ['剪辑'], time: '3小时前', distance: '500m', likes: 21, comments: 15, favorited: false, resolved: false },
    { id: 'fk4', type: 'intel', board: 'craft', title: '', content: 'Adobe全家桶教育版现在有活动，年付只要198，比之前便宜了一半。需要的赶紧去官网看看，活动月底截止。', images: [], author: { name: '省钱小能手', avatar: '省', verified: false }, tags: ['软件'], time: '5小时前', distance: '800m', likes: 234, comments: 18, favorited: false },
    { id: 'fk5', type: 'vote', board: 'craft', title: '自由设计师最常用的接单平台？', content: '来投票看看大家都用哪些平台接设计单~', images: [], author: { name: '自由设计师', avatar: '由', verified: true }, tags: ['接单'], time: '8小时前', distance: '3km', likes: 112, comments: 56, favorited: false, voteOptions: [{ id: 'v1', text: '猪八戒', count: 34 }, { id: 'v2', text: '站酷', count: 67 }, { id: 'v3', text: '小红书', count: 89 }, { id: 'v4', text: '朋友圈', count: 45 }], votedOption: null, voteTotal: 235 },
    { id: 'fk6', type: 'exchange', board: 'craft', title: '免费帮做logo换摄影作品', content: '我是平面设计专业，可以免费帮做logo设计（2版），想换一套个人写真摄影。', images: [], author: { name: '设计换摄影', avatar: '设', verified: false }, tags: ['交换'], time: '昨天', distance: '1km', likes: 28, comments: 9, favorited: false },
    { id: 'fk7', type: 'carpool', board: 'craft', title: '拼车去参加设计展会', content: '周六的设计展，有人一起拼车去吗？国际会展中心。', images: [], author: { name: '展会爱好者', avatar: '展', verified: false }, tags: ['出行'], time: '昨天', distance: '2km', likes: 6, comments: 4, favorited: false, carpoolTime: '周六 09:00', carpoolFrom: '地铁站', carpoolTo: '会展中心', carpoolHave: 1, carpoolNeed: 3 },
    { id: 'fk8', type: 'share', board: 'craft', title: '整理了200+免费商用字体包', content: '花了一周时间整理了一份可商用的免费字体合集，包含中英文共200+款，附带安装教程。', images: [], author: { name: '字体收集控', avatar: '字', verified: true }, tags: ['资源'], time: '2天前', distance: '4km', likes: 567, comments: 89, favorited: false },
  ],
  city: [
    { id: 'ft1', type: 'help', board: 'city', title: '谁能帮我下楼取个外卖？腿摔了不方便', content: '在家养伤，外卖只能送到小区门口，有邻居能顺手帮带上来吗？可以打赏10元，住12栋。', images: [], author: { name: '腿伤宅宅', avatar: '腿', verified: false }, tags: ['跑腿'], time: '5分钟前', distance: '300m', likes: 18, comments: 12, favorited: false, resolved: false },
    { id: 'ft2', type: 'share', board: 'city', title: '周末探店｜这家咖啡馆氛围感拉满', content: '藏在老街巷子里的独立咖啡馆，装修复古文艺，一杯手冲才28，适合拍照发呆一下午。', images: ['https://picsum.photos/seed/cafe1/200/200', 'https://picsum.photos/seed/cafe2/200/200'], author: { name: '探店小达人', avatar: '探', verified: true }, tags: ['探店'], time: '1小时前', distance: '1.5km', likes: 234, comments: 56, favorited: false },
    { id: 'ft3', type: 'intel', board: 'city', title: '', content: '提醒：本周六上午8点-18点XX片区停水检修，涵盖XX小区、XX公寓，提前储水。物业电话：188xxxx。', images: [], author: { name: '片区管家', avatar: '片', verified: true }, tags: ['通知'], time: '3小时前', distance: '800m', likes: 89, comments: 8, favorited: false, outdated: false },
    { id: 'ft4', type: 'help', board: 'city', title: '求推荐靠谱的上门保洁阿姨', content: '周末大扫除想找个保洁阿姨，2室一厅大概要3小时，有没有邻居用过觉得靠谱的推荐一下？', images: [], author: { name: '打工人小李', avatar: '李', verified: false }, tags: ['保洁'], time: '4小时前', distance: '600m', likes: 45, comments: 23, favorited: false, resolved: false },
    { id: 'ft5', type: 'discuss', board: 'city', title: '小区楼下快递柜收费合理吗？', content: '我们小区快递柜从昨天开始每个包裹收0.5元，之前一直是免费的。大家觉得这个收费合理吗？', images: [], author: { name: '快递大户', avatar: '快', verified: false }, tags: ['讨论'], time: '6小时前', distance: '400m', likes: 167, comments: 89, favorited: false },
    { id: 'ft6', type: 'exchange', board: 'city', title: '猫粮换狗粮｜同城面交', content: '我家猫不吃这款粮了，还剩2袋未拆封，想换同品牌的狗粮，同小区或附近面交。', images: ['https://picsum.photos/seed/pet1/200/200'], author: { name: '铲屎官阿花', avatar: '花', verified: false }, tags: ['宠物'], time: '昨天', distance: '1km', likes: 12, comments: 5, favorited: false },
    { id: 'ft7', type: 'vote', board: 'city', title: '楼下新开哪家早餐店最好吃？', content: '最近楼下新开了几家早餐店，来投票选出你最喜欢的一家~', images: [], author: { name: '早餐吃货', avatar: '早', verified: false }, tags: ['美食'], time: '昨天', distance: '500m', likes: 78, comments: 34, favorited: false, voteOptions: [{ id: 'v1', text: '老王油条豆浆', count: 67 }, { id: 'v2', text: '李记生煎包', count: 89 }, { id: 'v3', text: '肠粉阿姨', count: 56 }, { id: 'v4', text: '煎饼小哥', count: 45 }], votedOption: null, voteTotal: 257 },
    { id: 'ft8', type: 'carpool', board: 'city', title: '周末拼车去宜家', content: '周六下午1点从XX小区出发去宜家，有要一起去买家具的吗？车位还空3个。', images: [], author: { name: '新居布置', avatar: '新', verified: false }, tags: ['出行'], time: '2天前', distance: '2km', likes: 9, comments: 7, favorited: false, carpoolTime: '周六 13:00', carpoolFrom: 'XX小区门口', carpoolTo: '宜家', carpoolHave: 1, carpoolNeed: 3 },
  ],
}

/* 排序选项 */
const sortOptions = [
  { id: 'latest', label: '最新', icon: '🕐' },
  { id: 'hot', label: '最热', icon: '🔥' },
  { id: 'quality', label: '精华', icon: '✨' },
]

/* 用户性别映射 */
const userGender = {
  '花花': 'female', '学霸学姐': 'female', '收纳达人': 'female', '退坑回血': 'female',
  '萌新coser': 'female', '美妆店主': 'female', '小可爱': 'female', '设计换摄影': 'female',
  '考研小王': 'male', '吃货大学生': 'male', '学生会小李': 'male', '回家达人': 'male',
  '换书小能手': 'male', '选课纠结症': 'male', '准司机小张': 'male',
  '漫展老手': 'male', '道具大师': 'male', '情报员小K': 'male', '社长': 'male',
  '老司机阿明': 'male', '3D新手小白': 'male', '自学设计师': 'male', '剪辑新人': 'male',
  '省钱小能手': 'male', '自由设计师': 'male', '展会爱好者': 'male', '字体收集控': 'male',
}

/* 性别图标组件 */
function GenderIcon({ user, size = 12 }) {
  const g = userGender[user]
  if (!g) return null
  return (
    <div style={{
      width: size, height: size, borderRadius: 3,
      background: g === 'male' ? '#2563EB' : '#EC4899',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'absolute', bottom: -1, left: -1,
      border: '1px solid var(--c-card)',
    }}>
      {g === 'male' ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="10" cy="14" r="7"/><path d="M21 3l-6.5 6.5"/><path d="M16 3h5v5"/></svg>
      ) : (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><circle cx="12" cy="9" r="7"/><path d="M12 16v6"/><path d="M9 19h6"/></svg>
      )}
    </div>
  )
}

export default function ForumPage() {
  const { openSubPage } = useApp()
  const [boardStatus, setBoardStatusState] = useState(getBoardStatus)
  const [userPref, setUserPrefState] = useState(getUserBoardPref)
  const [activeBoard, setActiveBoard] = useState('campus')
  const [activeSort, setActiveSort] = useState('latest')
  const [showTypeSheet, setShowTypeSheet] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [activeFilters, setActiveFilters] = useState({ type: '全部', time: '不限' })
  const [apiPosts, setApiPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)

  // 加载帖子列表
  useEffect(() => {
    let cancelled = false
    async function load() {
      setPostsLoading(true)
      try {
        const sortMap = { latest: 'newest', hot: 'hot', quality: 'featured' }
        const resp = await api.forum.posts({ board: activeBoard, sort: sortMap[activeSort] || 'newest', page_size: 50 })
        if (cancelled) return
        setApiPosts((resp?.data?.items || []).map(mapApiPost))
      } catch (err) {
        if (!cancelled) console.error('[ForumPage] 加载帖子失败:', err)
      } finally {
        if (!cancelled) setPostsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [activeBoard, activeSort])

  // 监听管理端板块状态变化 + 用户偏好变化
  useEffect(() => {
    const onBoard = () => setBoardStatusState(getBoardStatus())
    const onPref = (ev) => setUserPrefState({ ...(ev.detail || getUserBoardPref()) })
    window.addEventListener('board-status-change', onBoard)
    window.addEventListener('user-board-pref-change', onPref)
    return () => {
      window.removeEventListener('board-status-change', onBoard)
      window.removeEventListener('user-board-pref-change', onPref)
    }
  }, [])

  const boards = [
    { id: 'campus', label: '校园局', icon: '🏫', accent: '#2563EB' },
    { id: 'cos', label: 'Cosplay', icon: '🎭', accent: '#A855F7' },
    { id: 'city', label: '同城解忧', icon: '📍', accent: '#06B6D4' },
    { id: 'craft', label: '兼工阁', icon: '💼', accent: '#10B981' },
  ]

  // 根据管理端状态 + 用户偏好双层过滤可显示的板块
  const visibleBoards = boards.filter(b => boardStatus[b.id] !== false && userPref[b.id] !== false)

  // 当前板块被关闭时，自动切换到第一个可见板块
  useEffect(() => {
    if (visibleBoards.length > 0 && !visibleBoards.some(b => b.id === activeBoard)) {
      setActiveBoard(visibleBoards[0].id)
    }
  }, [visibleBoards.map(b => b.id).join(','), activeBoard])

  const posts = apiPosts
  const filterTypes = ['全部', '求助', '讨论', '情报', '分享', '拼车', '交换', '投票']
  const filterTimes = ['不限', '1小时内', '今天', '3天内', '本周']
  const typeKeyMap = { '求助': 'help', '讨论': 'discuss', '情报': 'intel', '分享': 'share', '拼车': 'carpool', '交换': 'exchange', '投票': 'vote' }
  const activeFilterCount = Object.entries(activeFilters).filter(([k, v]) => v !== '全部' && v !== '不限').length

  const filtered = posts.filter(p => {
    if (searchText && !p.title.includes(searchText) && !p.content.includes(searchText)) return false
    if (activeFilters.type !== '全部' && p.type !== typeKeyMap[activeFilters.type]) return false
    return true
  })

  const currentBoard = visibleBoards.find(b => b.id === activeBoard) || visibleBoards[0]

  /* 帖子卡片渲染 */
  const renderPostCard = (post) => {
    const typeConf = POST_TYPES[post.type]
    return (
      <div key={post.id}
        onClick={() => openSubPage('forum-post', post)}
        style={{
          background: 'var(--c-card)', borderRadius: 16, padding: '14px 16px', margin: '0 16px 10px',
          cursor: 'pointer', border: '1px solid var(--c-border)', borderLeft: `3.5px solid ${typeConf.color}`,
          transition: 'all .15s', position: 'relative', overflow: 'hidden',
        }}>
        {/* 顶部标签行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 6,
            background: typeConf.bg, color: typeConf.color, fontWeight: 700, letterSpacing: 0.5,
          }}>{typeConf.icon} {typeConf.label}</span>
          {post.resolved && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.12)', color: '#22C55E', fontWeight: 600 }}>✓ 已解决</span>}
          {post.outdated && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: 'rgba(156,163,175,0.12)', color: '#9CA3AF', fontWeight: 600 }}>可能已过时</span>}
          {post.carpoolHave + post.carpoolNeed && post.type === 'carpool' && post.carpoolNeed === 0 && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: 'rgba(156,163,175,0.12)', color: '#9CA3AF', fontWeight: 600 }}>已满员</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {post.tags?.map(t => <span key={t} style={{ fontSize: 10, color: 'var(--c-text3)', fontWeight: 500 }}>#{t}</span>)}
          </div>
        </div>
        {/* 标题+正文 */}
        {post.title && <div style={{ fontSize: 15, fontWeight: 650, color: 'var(--c-text)', marginBottom: 6, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</div>}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: post.images?.length ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
          {post.images?.length > 0 && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={post.images[0]} alt="" style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover' }} />
              {post.images.length > 1 && (
                <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                  +{post.images.length - 1}
                </div>
              )}
            </div>
          )}
        </div>
        {/* 拼车帖路线信息 */}
        {post.type === 'carpool' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', fontSize: 12, color: 'var(--c-text2)' }}>
            <span style={{ color: '#8B5CF6', fontWeight: 600 }}>🕐 {post.carpoolTime}</span>
            <span style={{ color: 'var(--c-text3)' }}>·</span>
            <span>📍 {post.carpoolFrom}</span>
            <span style={{ color: '#8B5CF6' }}>→</span>
            <span>{post.carpoolTo}</span>
            <span style={{ marginLeft: 'auto', color: '#8B5CF6', fontWeight: 600 }}>👥 {post.carpoolHave}/{post.carpoolHave + post.carpoolNeed}</span>
          </div>
        )}
        {/* 投票帖预览 */}
        {post.type === 'vote' && post.voteOptions && (
          <div style={{ marginTop: 10 }}>
            {post.voteOptions.slice(0, 3).map(opt => {
              const pct = post.voteTotal ? Math.round(opt.count / post.voteTotal * 100) : 0
              return (
                <div key={opt.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--c-text2)', marginBottom: 3 }}>
                    <span>{opt.text}</span><span style={{ fontWeight: 600, color: '#14B8A6' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--c-input)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #14B8A6, #5EEAD4)', transition: 'width .4s' }} />
                  </div>
                </div>
              )
            })}
            <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 4, textAlign: 'center' }}>共 {post.voteTotal} 人参与投票</div>
          </div>
        )}
        {/* 底部信息 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--c-border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #6B5CE7, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 600 }}>{post.author.avatar}</div>
              <GenderIcon user={post.author.name} size={10} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--c-text2)', fontWeight: 500 }}>{post.author.name}</span>
            {post.author.verified && <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 600 }}>认证</span>}
            <span style={{ fontSize: 10, color: 'var(--c-text3)' }}>· {post.time}</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--c-text3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span style={{ fontWeight: 500 }}>{post.comments}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span style={{ fontWeight: 500 }}>{post.likes}</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-bg)', position: 'relative' }}>
      {/* ===== 顶部导航 ===== */}
      <div style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', flexShrink: 0 }}>
        {/* 主导航行 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', letterSpacing: 1 }}>四方馆</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Campus Forum</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(37,99,235,0.12)', cursor: 'pointer', width: 'fit-content', border: '1px solid rgba(37,99,235,0.15)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>武汉大学</span>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div onClick={() => setSearchOpen(!searchOpen)} style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s', border: '1px solid rgba(37,99,235,0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', border: '1px solid rgba(37,99,235,0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '2px solid #0F172A', boxShadow: '0 0 6px rgba(239,68,68,0.4)' }} />
            </div>
          </div>
        </div>
        {/* 搜索框 */}
        {searchOpen && (
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.08)', borderRadius: 12, padding: '0 14px', border: '1px solid rgba(37,99,235,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input autoFocus value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="搜索帖子标题或内容..."
                style={{ flex: 1, padding: '10px 0', border: 'none', background: 'transparent', color: '#fff', fontSize: 13, outline: 'none' }} />
              {searchText && <span onClick={() => setSearchText('')} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </span>}
            </div>
          </div>
        )}
        {/* 板块 Segmented Tabs - 根据管理端状态 + 用户偏好双层过滤 */}
        <div style={{ padding: '0 16px 14px' }}>
          {visibleBoards.length > 0 ? (
            <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
              {visibleBoards.map(b => {
                const isActive = activeBoard === b.id
                return (
                  <div key={b.id} onClick={() => { setActiveBoard(b.id); setSearchText('') }}
                    style={{
                      flex: 1, textAlign: 'center', padding: '9px 0', cursor: 'pointer',
                      borderRadius: 10, transition: 'all .25s',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                      background: isActive ? b.accent : 'transparent',
                      boxShadow: isActive ? `0 2px 8px ${b.accent}40` : 'none',
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                    }}>
                    {b.label}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '14px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              所有板块已关闭，请在首页「自定义」中重新开启
            </div>
          )}
        </div>
      </div>

      {/* 排序栏 + 统计 + 筛选 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', flexShrink: 0, background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border-light)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {sortOptions.map(s => (
            <div key={s.id} onClick={() => setActiveSort(s.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeSort === s.id ? (currentBoard?.accent || '#2563EB') : 'var(--c-input)',
                color: activeSort === s.id ? '#fff' : 'var(--c-text3)',
                transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 4,
                boxShadow: activeSort === s.id ? `0 2px 8px ${currentBoard?.accent || '#2563EB'}40` : 'none',
              }}>
              <span style={{ fontSize: 11 }}>{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--c-text3)', fontWeight: 500 }}>{filtered.length} 条帖子</span>
          <div onClick={() => setShowFilter(!showFilter)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 16, cursor: 'pointer',
              background: showFilter || activeFilterCount > 0 ? (currentBoard?.accent || '#2563EB') : 'var(--c-input)',
              color: showFilter || activeFilterCount > 0 ? '#fff' : 'var(--c-text3)',
              fontSize: 12, fontWeight: 600, transition: 'all .2s', position: 'relative',
              boxShadow: showFilter || activeFilterCount > 0 ? `0 2px 8px ${currentBoard?.accent || '#2563EB'}30` : 'none',
            }}>
            <span style={{ fontSize: 12 }}>⚙</span>
            <span>筛选</span>
            {activeFilterCount > 0 && (
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilterCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilter && (
        <div style={{ padding: '14px 16px', background: 'var(--c-card)', borderBottom: '1px solid var(--c-border)', flexShrink: 0 }}>
          {/* 类型筛选 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, letterSpacing: 0.5 }}>帖子类型</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {filterTypes.map(t => (
                <div key={t} onClick={() => setActiveFilters(prev => ({ ...prev, type: t }))}
                  style={{
                    padding: '6px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', fontWeight: 500,
                    background: activeFilters.type === t ? (currentBoard?.accent || 'var(--c-accent)') : 'var(--c-input)',
                    color: activeFilters.type === t ? '#fff' : 'var(--c-text2)',
                    border: activeFilters.type === t ? `1px solid ${currentBoard?.accent || 'var(--c-accent)'}` : '1px solid transparent',
                    transition: 'all .15s',
                  }}>
                  {t !== '全部' && <span style={{ marginRight: 3, fontSize: 11 }}>{POST_TYPES[typeKeyMap[t]]?.icon}</span>}
                  {t}
                </div>
              ))}
            </div>
          </div>
          {/* 时间筛选 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text2)', marginBottom: 8, letterSpacing: 0.5 }}>发布时间</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {filterTimes.map(t => (
                <div key={t} onClick={() => setActiveFilters(prev => ({ ...prev, time: t }))}
                  style={{
                    padding: '6px 14px', borderRadius: 16, fontSize: 12, cursor: 'pointer', fontWeight: 500,
                    background: activeFilters.time === t ? (currentBoard?.accent || 'var(--c-accent)') : 'var(--c-input)',
                    color: activeFilters.time === t ? '#fff' : 'var(--c-text2)',
                    border: activeFilters.time === t ? `1px solid ${currentBoard?.accent || 'var(--c-accent)'}` : '1px solid transparent',
                    transition: 'all .15s',
                  }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => setActiveFilters({ type: '全部', time: '不限' })}
              style={{ flex: 1, padding: '9px', borderRadius: 10, border: '1px solid var(--c-border-light)', background: 'transparent', color: 'var(--c-text3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              重置
            </button>
            <button onClick={() => setShowFilter(false)}
              style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: currentBoard?.accent || 'var(--c-accent)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              确认筛选
            </button>
          </div>
        </div>
      )}

      {/* 帖子列表 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80, WebkitOverflowScrolling: 'touch' }}>
        <div style={{ height: 8 }} />
        {postsLoading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 14 }}>加载帖子中...</div>
          </div>
        )}
        {!postsLoading && filtered.map(renderPostCard)}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--c-text3)' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>暂无帖子</div>
            <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>快来发布第一条帖子吧~</div>
          </div>
        )}
      </div>

      {/* 悬浮发帖按钮 */}
      <div onClick={() => setShowTypeSheet(true)}
        style={{
          position: 'absolute', bottom: 20, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 6px 24px rgba(245,158,11,0.4)',
          zIndex: 50, transition: 'all .3s',
        }}>
        <span style={{ color: 'white', fontSize: 28, fontWeight: 300, lineHeight: 1 }}>+</span>
      </div>

      {/* 发帖类型选择弹窗 */}
      {showTypeSheet && (
        <div onClick={() => setShowTypeSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--c-card)', borderRadius: '24px 24px 0 0', padding: '8px 20px 28px', animation: 'slideUp .25s ease' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--c-border)', margin: '8px auto 20px' }} />
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4, textAlign: 'center' }}>选择帖子类型</div>
            <div style={{ fontSize: 12, color: 'var(--c-text3)', textAlign: 'center', marginBottom: 20 }}>选择适合的类型让更多同学看到</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {Object.entries(POST_TYPES).map(([key, val]) => (
                <div key={key} onClick={() => { setShowTypeSheet(false); openSubPage('forum-create', { type: key, board: activeBoard }) }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 6px', borderRadius: 16, background: 'var(--c-input)', cursor: 'pointer', transition: 'all .15s', border: '1.5px solid transparent' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: val.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{val.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)' }}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
