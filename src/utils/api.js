/**
 * 莳约 App API 客户端
 *
 * USE_MOCK = true  → 所有方法返回 undefined，由前端 mock 数据兜底
 * USE_MOCK = false → 调用后端 API
 *
 * 渐进式切换：逐个页面将 USE_MOCK 改为 false
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"; // 通过环境变量 VITE_USE_MOCK=true 开启 Mock

// ---- Token 管理 ----
const getToken = () => localStorage.getItem("shiyue_token");
const setToken = (access, refresh) => {
  localStorage.setItem("shiyue_token", access);
  if (refresh) localStorage.setItem("shiyue_refresh_token", refresh);
};
const clearToken = () => {
  localStorage.removeItem("shiyue_token");
  localStorage.removeItem("shiyue_refresh_token");
};

// ---- 请求封装 ----
async function request(path, options = {}) {
  if (USE_MOCK) return undefined; // mock 模式返回 undefined，前端 fallback 到本地数据

  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const resp = await fetch(url, { ...options, headers });

  if (resp.status === 401) {
    // token 过期，尝试刷新
    const refreshToken = localStorage.getItem("shiyue_refresh_token");
    if (refreshToken && !options._retried) {
      const refreshResp = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (refreshResp.ok) {
        const refreshData = await refreshResp.json();
        setToken(refreshData.data.access_token, refreshData.data.refresh_token);
        return request(path, { ...options, _retried: true });
      }
    }
    clearToken();
    window.location.href = "/login";
    throw new Error("认证已过期");
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `请求失败 (${resp.status})`);
  }
  return resp.json();
}

const get = (path) => request(path);
const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) });
const del = (path) => request(path, { method: "DELETE" });

async function upload(file) {
  if (USE_MOCK) return undefined;
  const formData = new FormData();
  formData.append("file", file);
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const resp = await fetch(`${API_BASE}/upload/image`, { method: "POST", headers, body: formData });
  const data = await resp.json();
  return data.data?.url;
}

// ---- API 模块 ----
const api = {
  // 认证
  auth: {
    sendCode: (phone) => post("/auth/send-code", { phone, purpose: "login" }),
    smsLogin: async (phone, code, inviteCode) => {
      const res = await post("/auth/sms-login", { phone, code, invite_code: inviteCode || undefined, agreed_terms: true });
      if (res?.data) setToken(res.data.access_token, res.data.refresh_token);
      return res;
    },
    devLogin: async () => {
      const res = await post("/auth/dev-login", {});
      if (res?.data) setToken(res.data.access_token, res.data.refresh_token);
      return res;
    },
    register: (data) => post("/auth/register", data),
    login: async (phone, password) => {
      const res = await post("/auth/login", { phone, password });
      if (res?.data) setToken(res.data.access_token, res.data.refresh_token);
      return res;
    },
    refresh: () => post("/auth/refresh", { refresh_token: localStorage.getItem("shiyue_refresh_token") }),
    me: () => get("/auth/me"),
    changePassword: (data) => put("/auth/change-password", data),
  },

  // 用户
  users: {
    profile: () => get("/users/profile"),
    updateProfile: (data) => put("/users/profile", data),
    verifyStudent: (data) => post("/users/verify/student", data),
    verifyRealname: (data) => post("/users/verify/realname", data),
    alipayAccounts: () => get("/users/alipay-accounts"),
    addAlipay: (data) => post("/users/alipay-accounts", data),
    coupons: () => get("/users/coupons"),
    purchaseHistory: () => get("/users/purchase-history"),
    blacklist: () => get("/users/blacklist"),
    addBlacklist: (userId) => post(`/users/blacklist/${userId}`),
    removeBlacklist: (userId) => del(`/users/blacklist/${userId}`),
    deactivate: (data) => post("/users/deactivate", data),
  },

  // 优惠券（独立路由 /coupons）
  coupons: {
    available: () => get('/coupons'),
    mine: () => get('/coupons/mine'),
    claim: (type, qty = 1) => post(`/coupons/${type}/claim?qty=${qty}`),
    use: (type, amount) => post(`/coupons/use?coupon_type=${type}&order_amount=${amount}`),
  },

  // 任务
  tasks: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/tasks?${q}`);
    },
    detail: (id) => get(`/tasks/${id}`),
    create: (data) => post("/tasks", data),
    update: (id, data) => put(`/tasks/${id}`, data),
    delete: (id) => del(`/tasks/${id}`),
    accept: (id) => post(`/tasks/${id}/accept`),
    complete: (id) => post(`/tasks/${id}/complete`),
    confirm: (id) => post(`/tasks/${id}/confirm`),
    review: (id, data) => post(`/tasks/${id}/review`, data),
  },

  // 订单
  orders: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/orders?${q}`);
    },
    create: (data) => post('/orders', data),
    detail: (id) => get(`/orders/${id}`),
    pay: (id, payMethod = 'alipay') => post(`/orders/${id}/pay?pay_method=${payMethod}`),
    cancel: (id, reason = '') => post(`/orders/${id}/cancel?reason=${encodeURIComponent(reason)}`),
    complete: (id) => post(`/orders/${id}/complete`),
    updateStatus: (id, status) => put(`/orders/${id}/status?status=${status}`),
  },

  // 商家
  merchants: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/merchants?${q}`);
    },
    apply: (data) => post('/merchants/apply', data),
    my: () => get("/merchants/my"),
    updateMy: (data) => put("/merchants/my", data),
    detail: (id) => get(`/merchants/${id}`),
    products: (id) => get(`/merchants/${id}/products`),
    createProduct: (data) => post("/merchants/my/products", data),
    updateProduct: (id, data) => put(`/merchants/my/products/${id}`, data),
    myOrders: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/merchants/my/orders?${q}`);
    },
    reviews: (id, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/merchants/${id}/reviews?${q}`);
    },
  },

  // 消息
  messages: {
    conversations: () => get("/messages/conversations"),
    messages: (convId, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/messages/conversations/${convId}/messages?${q}`);
    },
    send: (data) => post("/messages/send", data),
    friends: () => get("/messages/friends"),
    addFriend: (data) => post("/messages/friends", data),
    notifications: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/messages/notifications?${q}`);
    },
  },

  // 论坛
  forum: {
    posts: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/forum/posts?${q}`);
    },
    postDetail: (id) => get(`/forum/posts/${id}`),
    createPost: (data) => post("/forum/posts", data),
    like: (id) => post(`/forum/posts/${id}/like`),
    favorite: (id) => post(`/forum/posts/${id}/favorite`),
    comments: (id, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/forum/posts/${id}/comments?${q}`);
    },
    addComment: (id, data) => post(`/forum/posts/${id}/comments`, data),
    vote: (postId, optionId) => post(`/forum/posts/${postId}/vote?option_id=${optionId}`),
  },

  // SOS
  sos: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/sos?${q}`);
    },
    create: (data) => post("/sos", data),
    handle: (id) => post(`/sos/${id}/handle`),
    resolve: (id) => post(`/sos/${id}/resolve`),
  },

  // 设置
  settings: {
    boardSettings: () => get("/settings/board-settings"),
    memberCards: () => get("/settings/member-cards"),
    checkVersion: (currentVersion, platform) => get(`/settings/check-version?current_version=${currentVersion}&platform=${platform}`),
    preferences: () => get("/settings/preferences"),
    updatePreferences: (category, data) => put(`/settings/preferences/${category}`, data),
  },

  // 反馈
  feedback: {
    submit: (data) => post("/feedback/submit", data),
    my: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/feedback/my?${q}`);
    },
  },

  // 结算
  settlements: {
    taskDetail: (taskId) => get(`/settlements/task/${taskId}`),
    upsertTask: async (taskId, data) => {
      const q = new URLSearchParams();
      Object.entries(data).forEach(([k, v]) => { if (v != null) q.set(k, String(v)); });
      return post(`/settlements/task/${taskId}?${q.toString()}`, undefined);
    },
    balance: () => get('/settlements/balance'),
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/settlements?${q}`);
    },
  },

  // 评价
  reviews: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/reviews?${q}`);
    },
    mine: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/reviews/mine?${q}`);
    },
    create: (data) => post('/reviews', data),
    reply: (id, data) => post(`/reviews/${id}/reply`, data),
    delete: (id) => del(`/reviews/${id}`),
  },

  // 上传
  upload,

  /**
   * 跨系统操作同步中继（后端中继）
   * 跳过 token 注入，避免后端未启动时触发 401 重定向
   */
  ops: {
    poll: (since = 0) =>
      request(`/ops/poll?since=${since}`, {
        headers: { "Content-Type": "application/json" },
      }).catch(() => ({ data: { events: [], ts: Date.now(), fallback: true } })),
  },
};

export default api;
export { USE_MOCK, setToken, clearToken, getToken };
