# 📱 ShiYue Android - 纯本地 Gradle 构建指南 (无需 Docker)

## 🎯 为什么选择本地构建？

- ✅ **离线可用** - 不需要互联网连接
- ✅ **完全控制** - 自己掌控构建环境
- ✅ **速度更快** - 第二次构建只需 1-2 分钟
- ✅ **无需注册** - 不需要第三方服务账号
- ✅ **数据隐私** - APK 构建结果完全在本地

---

## 📦 前提条件

### 必需软件：

| 软件 | 版本要求 | 下载地址 |
|------|---------|---------|
| **JDK 17** | LTS 版本 | https://adoptium.net/ |
| **Android Studio** | 最新版 | https://developer.android.com/studio |
| **Gradle** | 8.14+ | 已集成在 Android Studio 中 |

---

## 🔧 步骤 1: 安装 JDK 17

### Windows 用户:

```powershell
# 下载并安装 Temurin JDK 17
# https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.msi

# 安装后验证
java -version
javac -version
```

### 设置环境变量:

**方法 A: PowerShell (临时)**
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

**方法 B: 系统属性 (永久)**
1. 右键 "此电脑" → "属性" → "高级系统设置"
2. "环境变量" → "新建"
3. 变量名：`JAVA_HOME`
4. 变量值：`C:\Program Files\Eclipse Adoptium\jdk-17`
5. 编辑 Path，添加：`%JAVA_HOME%\bin`

---

## 🔧 步骤 2: 安装 Android Studio

### 下载 & 安装:
1. 访问 https://developer.android.com/studio
2. 下载 **Standalone Installer** (非 Bundle)
3. 安装时勾选 **Android SDK**

### 配置 SDK:
打开 Android Studio:
1. Tools → SDK Manager
2. SDK Platforms → 勾选 "Android API 34"
3. SDK Tools → 勾选 "Android SDK Build-tools 34.0.0"
4. Apply → OK

---

## 🔧 步骤 3: 配置环境变量

### Windows 环境变量设置:

```powershell
# 添加到您的 PATH
$androidSdk = "C:\Users\Administrator\AppData\Local\Android\Sdk"
$gradleHome = "C:\Users\Administrator\.gradle\net"

[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdk, "User")
[System.Environment]::SetEnvironmentVariable("PATH", "$androidSdk\platform-tools;$androidSdk\emulator;" + [System.Environment]::GetEnvironmentVariable("PATH","User"), "User")
```

### 或者手动编辑:

**系统变量 → 新建:**
- `ANDROID_HOME` = `C:\Users\Administrator\AppData\Local\Android\Sdk`
- `ANDROID_SDK_ROOT` = `C:\Users\Administrator\AppData\Local\Android\Sdk`

**编辑 Path → 添加:**
- `%ANDROID_HOME%\platform-tools`
- `%ANDROID_HOME%\tools`
- `%ANDROID_HOME%\build-tools\34.0.0`

---

## 🔧 步骤 4: 接受 Android SDK 许可证

命令行执行:

```bash
cd %ANDROID_HOME%\licenses
echo y | sdkmanager --licenses
```

或者使用 gradle 命令自动接受:

```bash
cd shiyue_app\android
./gradlew -Dfile.encoding=UTF-8 assembleDebug
```

---

## 🚀 步骤 5: 开始构建！

### 方法 A: 使用 Gradle Wrapper (推荐)

**Windows PowerShell:**
```powershell
cd C:\Users\Administrator\Desktop\计划\shiyue_app\android
.\gradlew.bat assembleDebug
```

**或者直接使用 Gradle:**
```powershell
gradle clean assembleDebug
```

### 方法 B: 使用 Android Studio

1. 打开 `shiyue_app/android` 文件夹
2. File → Open → 选择 android 目录
3. 等待 Gradle 同步完成
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. 等待构建完成 ✓

### 方法 C: 一键构建脚本

创建 `build-apk.ps1`:

```powershell
cd "C:\Users\Administrator\Desktop\计划\shiyue_app\android"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   ShiYue - Local Gradle Build" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Cleaning..." -ForegroundColor Yellow
gradlew.bat clean

Write-Host "Step 2: Building APK..." -ForegroundColor Yellow
gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "            ✅ BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    
    # 查找最新 APK
    $apkFiles = Get-ChildItem "app\build\outputs\apk\debug\*.apk"
    foreach ($apk in $apkFiles) {
        Write-Host ""
        Write-Host "📦 APK found:" -ForegroundColor Cyan
        Write-Host "  $($apk.FullName)" -ForegroundColor White
        
        # 复制到输出目录
        Copy-Item $apk.FullName "..\..\android\" -Force
    }
    
    # 打开资源管理器
    Start-Process explorer.exe -ArgumentList "/select," + (Get-ChildItem "..\..\android\*.apk" | Select-Object -First 1).FullName
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}
```

---

## ⏱️ 构建时间参考

| 阶段 | 时间 | 说明 |
|------|------|------|
| 首次构建 | 2-5 分钟 | 下载 Gradle 依赖 |
| 二次构建 | 1-2 分钟 | 增量编译，非常快 |
| Clean build | 3-4 分钟 | 清理缓存后的完整构建 |

---

## 🔍 常见问题排查

### 问题 1: "Java compilation initialization error: 无效源代码版本：21"

**原因**: AGP 版本与 JDK 不兼容

**解决**: 
1. 确保 JDK 是 17 版本
2. 检查 `android/app/build.gradle` 中的 Java version
3. AGP 应该使用 8.6.1 版本

### 问题 2: "Could not resolve all files for configuration '...'"

**原因**: Maven 仓库网络连接慢或超时

**解决**:
修改 `shiyue_app/android/build.gradle`:

```groovy
repositories {
    google()
    maven { url 'https://maven.aliyun.com/repository/public' }
    maven { url 'https://maven.aliyun.com/repository/central' }
    maven { url 'https://repo.huaweicloud.com/repository/maven/' }
    jcenter()
    mavenCentral()
}
```

### 问题 3: "sdkmanager: command not found"

**原因**: Android SDK 路径未配置

**解决**:
```powershell
# 验证 ANDROID_HOME
$env:ANDROID_HOME
# 如果没有值，设置它
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\Administrator\AppData\Local\Android\Sdk", "User")
```

### 问题 4: Gradle 下载很慢

**优化方法**:
编辑 `gradle-wrapper.properties`:

```properties
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.14-all.zip
```

或者配置代理:

编辑 `gradle.properties` 添加:
```properties
systemProp.http.proxyHost=your-proxy-server
systemProp.http.proxyPort=8080
systemProp.https.proxyHost=your-proxy-server
systemProp.https.proxyPort=8080
```

---

## 💾 构建产物位置

成功构建后，APK 文件位于：

```
shiyue_app\android\app\build\outputs\apk\debug\app-debug.apk
```

建议复制到统一目录便于管理:

```powershell
Copy-Item "android\app\build\outputs\apk\debug\*.apk" "C:\Users\Administrator\Desktop\计划\android\" -Force
```

---

## 🔧 高级配置优化

### 1. 增加 Gradle 内存分配

编辑 `gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.daemon=true
```

### 2. 启用配置缓存 (加速构建)

```properties
org.gradle.configuration-cache=true
```

### 3. 禁用 R8 混淆 (调试版本)

编辑 `android/app/build.gradle`:
```groovy
buildTypes {
    release {
        minifyEnabled false // 保持为 false 用于调试
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4. 自定义签名配置 (生产环境)

创建 `android/app/release.keystore`,然后:

```groovy
android {
    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword 'your-store-password'
            keyAlias 'your-key-alias'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## 📊 监控构建进度

### 查看详细日志:

```bash
gradlew assembleDebug --info > build.log 2>&1
```

### 实时监控控制台输出:

```powershell
cd android
gradlew.bat assembleDebug -s
```

---

## 🆘 技术支持

### 文档资源:
- [Android 官方构建指南](https://developer.android.com/studio/build)
- [Gradle 中文文档](https://docs.gradle.cn/)
- [Capacitor 官方文档](https://capacitorjs.com/docs/android)

### 社区支持:
- [Stack Overflow](https://stackoverflow.com/questions/tagged/android-gradle)
- [GitHub Issues](https://github.com/ionic-team/capacitor/issues)

---

## ✨ 总结

通过本地构建方式，您现在拥有：
- ✅ **完全离线能力** - 不依赖任何云服务
- ✅ **快速迭代** - 1-2 分钟即可看到变化
- ✅ **灵活控制** - 可定制每个构建细节
- ✅ **数据安全** - APK 完全在本地管理

下一步可以探索：
- 集成单元测试
- 性能基准测试
- 自动化测试流程

需要更多帮助？查看上面的常见问题部分！
