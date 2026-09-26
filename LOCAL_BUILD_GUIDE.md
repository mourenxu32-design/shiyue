# 🏗️ ShiYue Android - 本地构建完整指南

## 📋 概览

本指南提供两种本地 APK 构建方案：
1. **一键脚本构建**（推荐）- `build-apk.ps1`
2. **手动构建** - 逐步指导

---

## 🚀 方案 A: 一键脚本构建（最简单）

### ✅ 系统要求

| 软件 | 版本要求 | 下载地址 | 说明 |
|------|---------|---------|------|
| **Node.js** | v16+ | https://nodejs.org/ | 用于安装前端依赖 |
| **JDK 17** | LTS | https://adoptium.net/ | Java 编译环境 |
| **Android SDK** | API 34+ | https://developer.android.com/studio | 通过 Android Studio 安装 |
| **PowerShell** | v5.1+ | Windows 默认自带 | 运行构建脚本 |

---

### 🔧 第一步：安装依赖

#### 1. 安装 Node.js

```powershell
# 方式 1: Winget (Windows 11+)
winget install OpenJS.NodeJS.LTS

# 方式 2: 手动安装
# 访问 https://nodejs.org/ 下载 LTS 版本安装
```

验证安装：
```powershell
node --version  # 应该输出 v18.x.x 或更高
npm --version   # 应该输出 9.x.x 或更高
```

#### 2. 安装 JDK 17

```powershell
# 方式 1: Winget
winget install EclipseAdoptium.Temurin.17.JDK

# 方式 2: 手动安装
# 访问 https://adoptium.net/ 下载 Windows x64 installer
```

验证安装并设置环境变量：
```powershell
java -version  # 应该输出 openjdk version "17.x.x"

# 设置 JAVA_HOME（在 PowerShell 中添加）
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.bin"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# 永久设置（管理员 PowerShell）
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.bin", "Machine")
```

#### 3. 安装 Android SDK

**推荐方式：使用 Android Studio**

1. 下载 Android Studio: https://developer.android.com/studio
2. 安装时勾选 "Android SDK"
3. 打开 SDK Manager，安装以下组件：
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android Emulator (可选)
   - Intel x86 Atom Debugger (可选)

设置环境变量：
```powershell
# 添加至系统环境变量
ANDROID_HOME = C:\Users\Administrator\AppData\Local\Android\Sdk
PATH = %ANDROID_HOME%\tools; %ANDROID_HOME%\platform-tools
```

验证：
```powershell
adb version  # 应该显示 Android Debug Bridge 版本
```

---

### ⚡ 第二步：运行构建脚本

#### 基本用法

```powershell
cd C:\Users\Administrator\Desktop\计划\shiyue_app
.\build-apk.ps1
```

#### 常用选项

| 参数 | 说明 | 示例 |
|------|------|------|
| `-Clean` | 清理旧构建后再构建 | `.\build-apk.ps1 -Clean` |
| `-FrontendOnly` | 仅构建前端（不生成 APK） | `.\build-apk.ps1 -FrontendOnly` |
| `-AndroidOnly` | 仅构建 Android APK | `.\build-apk.ps1 -AndroidOnly` |
| `-Help` | 显示帮助信息 | `.\build-apk.ps1 -Help` |

#### 完整工作流程

```powershell
# 首次构建（完整流程）
.\build-apk.ps1
# 步骤：
# ① 检查 Node.js 环境
# ② npm install (安装前端依赖)
# ③ npm run build (生成 dist/)
# ④ gradlew assembleDebug (打包 APK)
# ⑤ 自动复制 APK 到 ..\..\android\

# 增量构建（后续快速构建）
.\build-apk.ps1 -AndroidOnly
# 跳过前端构建，直接打包 APK

# 干净构建
.\build-apk.ps1 -Clean
# 先清理所有临时文件，再完整构建
```

---

### 📦 第三步：获取 APK

构建成功后，APK 会自动保存到：

```
C:\Users\Administrator\Desktop\计划\android\
├── shiyue_app-debug_v20260620_143025.apk  (带时间戳的版本)
└── ... (其他历史版本)
```

**注意**: 
- 每次构建会生成带时间戳的副本
- APK 文件名格式：`{app_name}_debug_v{YYYYMMDD_HHMMSS}.apk`
- 文件夹会自动打开

---

### ⏱️ 预计构建时间

| 场景 | 首次构建 | 增量构建 |
|------|---------|---------|
| **前端依赖安装** | 2-5 分钟 | 0 分钟 |
| **前端编译** | 1-2 分钟 | 0.5-1 分钟 |
| **Gradle 初始化** | 1-2 分钟 | 0 分钟 |
| **APK 打包** | 2-3 分钟 | 1-2 分钟 |
| **总计** | **6-12 分钟** | **1.5-3 分钟** |

---

## 🔧 方案 B: 手动构建（分步执行）

如果您想手动控制每个步骤，可以按以下顺序执行：

### Step 1: 安装 Node 依赖

```powershell
cd C:\Users\Administrator\Desktop\计划\shiyue_app
npm install
```

### Step 2: 构建前端 Web 应用

```powershell
npm run build
```

这会生成 `dist/` 目录，包含编译后的静态资源。

### Step 3: 进入 Android 目录

```powershell
cd android
```

### Step 4: 清理旧构建（可选）

```powershell
.\gradlew.bat clean
```

### Step 5: 构建 Debug APK

```powershell
.\gradlew.bat assembleDebug
```

这会：
- 编译 Java/Kotlin 代码
- 合并资源文件
- 打包成 APK
- 输出到 `app/build/outputs/apk/debug/`

### Step 6: 复制 APK

```powershell
cd app\build\outputs\apk\debug
copy *.apk ..\..\..\..\android\
```

---

## 🐛 常见问题排查

### 问题 1: `npm install` 失败

**症状**: 错误提示依赖安装失败

**解决方案**:
```powershell
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
Remove-Item -Recurse -Force node_modules
npm install
```

### 问题 2: `java -version` 无反应

**症状**: PowerShell 找不到 java 命令

**解决方案**:
```powershell
# 检查 JDK 是否已安装
cd "C:\Program Files"
dir jdk* -Depth 0

# 如果找到，设置 JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# 测试
java -version
```

### 问题 3: Gradle 构建失败

**症状**: `BUILD FAILED` 或 `Could not resolve dependencies`

**解决方案**:

1. **检查网络** (Gradle 需要从互联网下载依赖):
   ```powershell
   # 使用国内镜像加速（已在项目中配置）
   # 见 android/gradle/wrapper/gradle-wrapper.properties
   ```

2. **清理 Gradle 缓存**:
   ```powershell
   cd android
   Remove-Item -Recurse -Force .gradle
   Remove-Item -Recurse -Force app\.gradle
   .\gradlew.bat clean
   .\gradlew.bat assembleDebug
   ```

3. **检查 SDK 路径**:
   ```powershell
   # 创建或更新 local.properties
   echo "sdk.dir=C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk" > android\local.properties
   ```

### 问题 4: APK 构建成功但体积异常大

**可能原因**:
- 未启用 ProGuard 混淆
- 包含了不必要的资源文件

**解决方案**:
```gradle
// 编辑 android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true      // 启用代码压缩
        shrinkResources true    // 压缩资源
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

然后重新构建：
```powershell
.\gradlew.bat assembleRelease
```

---

## 🆚 本地构建 vs CI/CD 对比

| 特性 | 本地构建 | Bitrise CI/CD |
|------|---------|--------------|
| **首次设置** | 需要安装所有工具 | 只需推送代码 |
| **构建时间** | 6-12 分钟 | 8-15 分钟 |
| **网络要求** | 需要（下载依赖） | 需要 |
| **成本** | 免费 | 每月 200 分钟免费 |
| **自动化** | 手动触发 | 自动推送构建 |
| **调试便利性** | ✅ 立即可见日志 | 需查看在线日志 |
| **环境一致性** | ⚠️ 依赖本地配置 | ✅ 固定环境 |
| **适合场景** | 开发阶段频繁构建 | 生产版本发布 |

---

## 🎯 最佳实践建议

### 日常开发

1. **频繁小改动**: 使用增量构建
   ```powershell
   .\build-apk.ps1 -AndroidOnly
   ```

2. **修改 UI/逻辑**: 完整构建一次确保无问题
   ```powershell
   .\build-apk.ps1
   ```

3. ** nightly builds**: 每天凌晨自动构建
   ```powershell
   # 创建定时任务（PowerShell）
   $trigger = New-ScheduledTaskTrigger -Daily -At 2am
   $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File ""C:\path\to\build-apk.ps1"" -Clean"
   $task = New-ScheduledTask -Trigger $trigger -Action $action
   Register-ScheduledTask -Name "ShiYueNightlyBuild" -Task $task
   ```

### 准备 Release 版本

```powershell
# 1. 更新版本号
cd android/app
notepad build.gradle  # 修改 versionCode 和 versionName

# 2. 生成 Release APK
.\gradlew.bat assembleRelease

# 3. 签名配置（需要 keystore 文件）
# 见 LOCAL_BUILD_GUIDE.md 的"Release 构建"部分
```

---

## 📞 获取更多帮助

### 文档位置

| 文档 | 用途 |
|------|------|
| `LOCAL_BUILD_GUIDE.md` | 详细配置教程 |
| `BITRISE_SETUP_GUIDE.md` | CI/CD配置指南 |
| `build-apk.ps1` | 一键构建脚本 |
| `BITRISE.yml` | CI/CD 工作流定义 |

### 在线资源

- [Gradle 官方文档](https://docs.gradle.org/)
- [Capacitor 官方文档](https://capacitorjs.com/)
- [Bitrise 支持中心](https://support.bitrise.io/)

---

## ✅ 快速检查清单

部署前确认以下项目已完成：

- [ ] Node.js v16+ 已安装
- [ ] JDK 17 已安装并设置 JAVA_HOME
- [ ] Android SDK 已安装并通过 Android Studio 配置
- [ ] `git clone` 或下载项目代码到本地
- [ ] 运行 `.\build-apk.ps1` 成功完成首次构建
- [ ] APK 文件出现在 `C:\Users\Administrator\Desktop\计划\android\` 目录
- [ ] 在真机上测试 APK 可正常安装和运行

---

**祝您构建顺利！** 🎉

如有任何问题，请查看本文档中的"常见问题排查"部分或联系技术支持。