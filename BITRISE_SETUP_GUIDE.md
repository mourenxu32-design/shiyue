# 🍫 ShiYue Android APK - Bitrise.io CI/CD 配置指南

## 🎯 为什么选择 Bitrise？

- ✅ **专为移动应用设计**：原生支持 iOS/Android
- ✅ **完全免费**: [免费计划](https://www.bitrise.io/pricing/)
  - 每月 200 分钟构建时间（足够个人项目）
  - 无限成员
  - 私有仓库支持
- ✅ **无需自己维护服务器**
- ✅ **可视化构建历史**和日志
- ✅ **自动测试集成**
- ✅ **部署到 Google Play / TestFlight**

---

## 📋 完整配置步骤

### 第 1 步：注册 Bitrise 账号

1. 访问 https://www.bitrise.io/
2. 点击 "Sign up with GitHub"
3. 授权 GitHub 访问权限
4. 创建团队空间（可选）

---

### 第 2 步：添加你的项目

#### Windows PowerShell:

```powershell
cd C:\Users\Administrator\Desktop\计划\shiyue_app

# 初始化 Git 仓库（如果还没有）
git init

# 检查远程仓库地址
git remote -v

# 如果没有远程仓库，添加你的 GitHub 地址
# git remote add origin git@github.com:yourusername/shiyue-app.git

# 提交所有更改
git add .
git commit -m "Add Bitrise CI/CD configuration"

# Push 到 GitHub（如果是第一次 push）
git push -u origin main --force
```

**或者手动操作：**

1. 在 GitHub 上确保 `bitrise.yml` 文件已提交
2. 回到 Bitrise.io
3. 点击 **"Start a new project"**
4. 选择 **GitHub Repository**
5. 搜索并选中 **shiyue-app** 仓库
6. 点击 **"Deploy"**

---

### 第 3 步：配置 Bitrise App

#### A. 选择 Stack（推荐）

- **Stack**: Ubuntu 22.04 (Generic) 
- **Docker**: Enable（如果项目需要容器化）
- **Buildpack**: Generic Docker Image

#### B. 配置 Build Triggers（触发器）

在 Bitrise dashboard 中：
1. 进入 **Workflow Editor**
2. 找到 **Triggers** 部分
3. 设置:
   ```yaml
   Main workflow (build-android):
   - On push to branch: main or develop
   - On tag: v*
   ```

---

### 第 4 步：自定义 Workflows（可选）

默认工作流已经包含基本构建步骤，但你可以根据需求添加更多：

#### 常见增强项:

**1. 添加代码覆盖率报告**
```yaml
- code-coverage-retrieval@1:
    inputs:
      - artifacts-to-retrieve: "*jacoco*.xml"
```

**2. 发送通知**
```yaml
- slack-message@1:
    settings:
        webhook-url: "${SLACK_WEBHOOK_URL}"
        message: "Build #{BITRISE_BUILD_NUMBER} completed!"
```

**3. 发布到 Google Play Store**
```yaml
- google-play-deploy@1:
    settings:
      service-account-key-file-path: "${GOOGLE_SERVICE_ACCOUNT_KEY}"
      package-name: "com.shiyue.app"
      track: "alpha"
```

---

## 🔧 Bitrise.io 平台配置清单

### 环境变量设置（Bitrise Dashboard → App Settings → Environment variables）

| 变量名 | 值/说明 | 是否必需 |
|--------|---------|----------|
| JAVA_VERSION | 17 | ✅ 是 |
| GRADLE_USER_HOME | ~/.gradle | ❌ 否 |
| ANDROID_API_LEVEL | 34 | ❌ 否 |

### 密钥设置（Bitrise Dashboard → Security & Secrets → Keys）

如果需要访问私有仓库或上传服务，可以设置这些密钥：

- **SSH Private Key** - 用于私有 Git 仓库访问
- **Google Service Account Key** - 如需自动发布到 Play Store

---

## 🚀 开始构建

一旦配置完成，Bitrise 会自动：

1. **代码推送时** → 自动启动构建流程
2. **标签推送时** → 自动启动构建流程  
3. **手动触发** → 在 Dashboard 点击 **"Start Build"**

### 查看构建结果

- **构建状态**: Dashboard 会显示绿色（成功）/红色（失败）
- **下载 APK**: 
  - 进入 **Builds** 标签
  - 找到对应的构建记录
  - 点击 **Artifacts** 下载 `.apk` 文件
  - 或直接使用 **Direct Link**

---

## 💡 常见问题解答

### Q: 首次构建失败怎么办？

A: 首先检查以下日志：

1. 进入 Build logs
2. 查找错误信息（通常是红色文字）
3. 常见错误：
   - **Gradle 缓存问题** → 添加 step `clean-up-disk-space`
   - **缺少依赖包** → 在 `npm-install@3` 前添加 `npm-install@2`
   - **Java 版本冲突** → 确保 `JAVA_VERSION: "17"` 正确设置

### Q: 如何加速构建？

A: Bitrise 提供自动缓存，但你可以进一步优化：
```yaml
steps:
  - restore-cache@1: {}
  # ... 其他步骤 ...
  - save-cache@1:
      paths: "~/.gradle/caches"
```

### Q: 免费额度够用吗？

A: 对大多数开发阶段足够：
- **每月 200 分钟 = 约每天 6-7 分钟**
- **一次 debug build ≈ 8-15 分钟**
- **一次 release build ≈ 15-25 分钟**

建议只在主要代码合并后手动触发 Release 构建

### Q: 如何测试本地修改？

A: 使用 Bitrise CLI 测试：
```bash
# 安装 Bitrise CLI
brew install bitrise-cli

# 本地预览 workflow
bitrise run android-debug-build
```

---

## 📊 监控与优化

### 每日监控清单

- [ ] Check yesterday's builds (Dashboard)
- [ ] Review error logs if any failures
- [ ] Check disk usage
- [ ] Update dependencies quarterly

### 月度优化建议

- [ ] Review unused steps in workflows
- [ ] Clean up old build artifacts
- [ ] Update stack version
- [ ] Check for newer versions of custom steps

---

## 🎉 后续步骤

### Step 1: 配置自动发布（可选）

当 APK 成功构建后，自动上传到：
- **Firebase App Distribution** - 内部测试
- **Google Play Console** - Alpha/Beta/Production 渠道

### Step 2: 设置 Slack 通知

将重要事件发送到团队聊天：
- Builds start
- Builds succeed  
- Builds fail

### Step 3: 自动化测试集成

```yaml
- gradle-runner@6:
    inputs:
      - command: testDebugUnitTest
        path: ./android/app/build.gradle
    outputs:
      - name: unit_test_results
        value: android/app/build/outputs/reports/tests/testDebugUnitTest/
```

---

## 📝 总结

您已经完成了：

✅ **配置 Bitrise.io CI/CD**
✅ **准备 build.gradle 和 manifest.xml**
✅ **定义 Workflow 和触发条件**

下一步：
1. 访问 [Bitrise.io](https://www.bitrise.io/)
2. 连接您的 GitHub 仓库
3. 选择 Android app
4. 等待首次自动构建成功！

---

## 🔗 相关链接

- **Bitrise 官方文档**: https://devcenter.bitrise.io/
- **CI/CD 最佳实践**: https://www.bitrise.io/blog/tagged/cicd
- **Android 专用教程**: https://www.bitrise.io/platform/android/
- **Community Forum**: https://community.bitrise.io/

---

## 🆘 需要帮助？

如果在配置过程中遇到任何问题：
1. 查看 Bitrise 官方文档
2. 联系 Bitrise 支持（有免费 Plan）
3. 查看社区讨论
4. 提供错误截图给我分析
