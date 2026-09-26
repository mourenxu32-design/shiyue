import { useEffect, useState, useMemo } from 'react'

const GOLD = '#D4A853'
const GOLD_DIM = '#A09060'
const BG_CENTER = '#1E2A3A'
const BG_EDGE = '#151D2B'

/* 生成随机光点粒子 */
function generateParticles(count = 7) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,       // 水平 15%-85%
    y: 8 + Math.random() * 35,        // 垂直 8%-43%（中上区域）
    size: 2 + Math.random() * 2.5,    // 2-4.5px
    dur: 3 + Math.random() * 3,       // 3-6s 浮动周期
    delay: Math.random() * 2,         // 随机延迟
    dx: -8 + Math.random() * 16,      // 水平漂移范围
    dy: -6 + Math.random() * 12,      // 垂直漂移范围
  }))
}

export default function SplashPage({ fading }) {
  const [phase, setPhase] = useState(0)
  const particles = useMemo(() => generateParticles(7), [])

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 50),     // 阶段一：背景入场
      setTimeout(() => setPhase(2), 650),    // 阶段二：徽章渐显
      setTimeout(() => setPhase(3), 1250),   // 阶段三：品牌名
      setTimeout(() => setPhase(4), 1850),   // 阶段四：Slogan
      setTimeout(() => setPhase(5), 2450),   // 阶段五：版本号
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      height: '100%', width: '100%', position: 'relative', overflow: 'hidden',
      background: `radial-gradient(ellipse at 50% 40%, ${BG_CENTER} 0%, ${BG_EDGE} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
    }}>
      {/* ===== CSS 动画关键帧 ===== */}
      <style>{`
        /* 阶段一：背景渐亮 */
        @keyframes splashBgFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* 光点粒子浮动 */
        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(var(--dx), var(--dy)); }
          66% { transform: translate(calc(var(--dx) * -0.6), calc(var(--dy) * -0.8)); }
        }
        /* 阶段二：徽章渐显 - 模糊到清晰 + 缩放 */
        @keyframes badgeReveal {
          0% { opacity: 0; filter: blur(8px); transform: scale(0.8); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
        /* 阶段二：圆环渐显 */
        @keyframes ringReveal {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        /* 徽章呼吸发光 */
        @keyframes breatheGlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.38; transform: scale(1.04); }
        }
        /* 阶段三：品牌名渐显 */
        @keyframes brandFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        /* 阶段四：Slogan渐显 */
        @keyframes sloganFade {
          0% { opacity: 0; }
          100% { opacity: 0.8; }
        }
        /* 阶段五：版本号渐显 */
        @keyframes versionFade {
          0% { opacity: 0; }
          100% { opacity: 0.6; }
        }
      `}</style>

      {/* ===== 背景遮罩层：模拟从纯黑到深蓝的过渡 ===== */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${BG_CENTER} 0%, ${BG_EDGE} 100%)`,
        animation: 'splashBgFade 0.6s ease-out forwards',
        opacity: 0,
      }} />

      {/* ===== 光点粒子层 ===== */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: GOLD,
          boxShadow: `0 0 ${p.size * 2}px ${GOLD}`,
          opacity: phase >= 1 ? 0.4 : 0,
          transition: 'opacity 0.8s ease-out',
          animation: phase >= 1
            ? `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`
            : 'none',
          ['--dx']: `${p.dx}px`,
          ['--dy']: `${p.dy}px`,
        }} />
      ))}

      {/* ===== 主内容容器（视觉重心在40%处） ===== */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginTop: '-8%',
        position: 'relative', zIndex: 1,
      }}>

        {/* ===== 阶段二：圆形徽章 ===== */}
        <div style={{
          position: 'relative',
          width: 110, height: 110,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 36,
        }}>
          {/* 呼吸外发光 */}
          {phase >= 2 && (
            <div style={{
              position: 'absolute',
              width: 130, height: 130,
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: `0 0 40px 12px rgba(212,168,83,0.3)`,
              animation: 'breatheGlow 2.5s ease-in-out infinite',
              opacity: 0,
              animationFillMode: 'forwards',
              animationDelay: '0.3s',
            }} />
          )}

          {/* SVG 不闭合圆环 */}
          <svg
            width="110" height="110" viewBox="0 0 110 110"
            style={{
              position: 'absolute',
              opacity: phase >= 2 ? 1 : 0,
              animation: phase >= 2 ? 'ringReveal 0.6s ease-out forwards' : 'none',
            }}
          >
            {/* 圆环：左上缺口(约250°→310°) + 右下缺口(约70°→130°) */}
            {/* 用两段弧线实现不闭合效果 */}
            <path
              d="M 29.6 16.5 A 50 50 0 0 1 93.5 80.4"
              fill="none"
              stroke={GOLD}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 80.4 93.5 A 50 50 0 0 1 16.5 29.6"
              fill="none"
              stroke={GOLD}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>

          {/* "莳"字 */}
          <div style={{
            position: 'relative', zIndex: 2,
            fontSize: 44,
            fontWeight: 700,
            color: GOLD,
            fontFamily: '"Noto Serif SC", "Source Han Serif SC", "STSong", "SimSun", serif',
            letterSpacing: 2,
            opacity: phase >= 2 ? 1 : 0,
            filter: phase >= 2 ? 'blur(0px)' : 'blur(8px)',
            transform: phase >= 2 ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.6s ease-out, filter 0.6s ease-out, transform 0.6s ease-out',
            textShadow: `0 0 12px rgba(212,168,83,0.25)`,
          }}>
            莳
          </div>
        </div>

        {/* ===== 阶段三：品牌名"莳约" ===== */}
        <div style={{
          fontSize: 28,
          fontWeight: 500,
          color: '#FFFFFF',
          letterSpacing: 8,
          marginBottom: 16,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          fontFamily: '-apple-system, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif',
        }}>
          莳约
        </div>

        {/* ===== 阶段四：Slogan ===== */}
        <div style={{
          fontSize: 12,
          fontWeight: 400,
          color: GOLD_DIM,
          letterSpacing: 2,
          opacity: phase >= 4 ? 0.8 : 0,
          transition: 'opacity 0.6s ease-out',
          fontFamily: '-apple-system, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif',
        }}>
          悬赏为约，揭榜来莳
        </div>
      </div>

      {/* ===== 阶段五：版本号 ===== */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        fontSize: 10,
        color: '#4A5568',
        opacity: phase >= 5 ? 0.6 : 0,
        transition: 'opacity 0.6s ease-out',
        letterSpacing: 1,
      }}>
        Version 1.0.0
      </div>
    </div>
  )
}

