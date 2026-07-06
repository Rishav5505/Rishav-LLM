import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// CountUp hook: animates 0 to 20 over 2s with easeOutCubic, starts after 1.2s delay
export const useCountUp = (target = 20, duration = 2000, delay = 1200) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    const timer = setTimeout(() => {
      frameId = window.requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [target, duration, delay]);

  return count;
};

// TypewriterHeading component: types char by char at configurable speed
const TypewriterHeading = ({ text, speed = 35, startDelay = 400 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let currentIdx = 0;
    let timer;

    const type = () => {
      if (currentIdx <= text.length) {
        setDisplayedText(text.slice(0, currentIdx));
        currentIdx++;
        timer = setTimeout(type, speed);
      } else {
        setIsFinished(true);
      }
    };

    const delayTimer = setTimeout(type, startDelay);

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay]);

  // Split displayed text into black (#000000) and white (#ffffff)
  const firstPart = displayedText.slice(0, 67);
  const secondPart = displayedText.slice(67);

  return (
    <h1 className="font-urbanist text-[36px] md:text-[64px] font-bold leading-[44px] md:leading-[64px] tracking-[-1.5px] select-none text-left relative">
      <span style={{ color: '#000000' }}>{firstPart}</span>
      <span style={{ color: '#ffffff' }}>{secondPart}</span>
      {/* Blinking purple cursor */}
      <span 
        className="inline-block w-[3px] h-[32px] md:h-[52px] align-middle ml-1 bg-[#A068FF] cursor-blink-anim"
        style={{ verticalAlign: 'middle' }}
      />
    </h1>
  );
};

const MarketeamBackground = ({ children, showLeftHero = true, isFormOverlay = false }) => {
  const specialistsCount = useCountUp(20, 2000, 1200);

  // partner SVGs
  const partnerLogos = [
    'https://polo-pecan-73837341.figma.site/_assets/v11/1e7b0e6fcc016cd28aec5c68990118b8c54c35a5.svg',
    'https://polo-pecan-73837341.figma.site/_assets/v11/3eac03c183db2ae080d910159211c14843398b61.svg',
    'https://polo-pecan-73837341.figma.site/_assets/v11/17705a4c0023a0e5a99154dfb10582adbbf4260b.svg',
    'https://polo-pecan-73837341.figma.site/_assets/v11/0e5f442b09dc5c248e3e60d40a65505fb1887228.svg',
    'https://polo-pecan-73837341.figma.site/_assets/v11/63f99030ceb459e3c9ab9e429cfa2353491d3816.svg',
  ];

  // Repeated 4x to ensure smooth loop transitions
  const repeatedLogos = [...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos];

  // Avatars positioning specifications
  const avatars = [
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/aa51718fb3af3637e6d666b6543fc27a175fada6.png',
      orbit: 1,
      deg: 270,
      radius: 177,
      sizeClass: 'w-[58px] h-[58px]',
      shapeClass: 'rounded-[20px]',
      glowClass: 'shadow-[0_0_20px_rgba(160,104,255,0.65)]',
      delay: 0.6,
      counterSpin: 'spin-cw 30s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/ca755f7f93c1126fb8bdbf99ab364a33aa9ab272.png',
      orbit: 2,
      deg: 60,
      radius: 251,
      sizeClass: 'w-[58px] h-[58px]',
      shapeClass: 'rounded-full',
      glowClass: 'shadow-[0_0_20px_rgba(234,179,8,0.65)]',
      delay: 0.8,
      counterSpin: 'spin-ccw 40s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/dc01064c7093dcc32674876ee3cf5e41c4a485c6.png',
      orbit: 2,
      deg: 180,
      radius: 251,
      sizeClass: 'w-[78px] h-[78px]',
      shapeClass: 'rounded-full',
      glowClass: 'shadow-[0_0_20px_rgba(236,72,153,0.65)]',
      delay: 1.0,
      counterSpin: 'spin-ccw 40s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/d5470a58b02388336141575048720f19a50de832.png',
      orbit: 2,
      deg: 300,
      radius: 251,
      sizeClass: 'w-[58px] h-[58px]',
      shapeClass: 'rounded-[20px]',
      glowClass: 'shadow-[0_0_20px_rgba(59,130,246,0.65)]',
      delay: 1.2,
      counterSpin: 'spin-ccw 40s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/018736aa5d0275c4ce56cfebaf2ae3007d81ca1e.png',
      orbit: 3,
      deg: 130,
      radius: 325,
      sizeClass: 'w-[88px] h-[88px]',
      shapeClass: 'rounded-full',
      glowClass: 'shadow-[0_0_20px_rgba(236,72,153,0.65)]',
      delay: 1.4,
      counterSpin: 'spin-ccw 50s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/c76d8a0b99676de31c014344bfaf75bad090758d.png',
      orbit: 4,
      deg: 30,
      radius: 399,
      sizeClass: 'w-[58px] h-[58px]',
      shapeClass: 'rounded-full',
      glowClass: 'shadow-[0_0_20px_rgba(160,104,255,0.65)]',
      delay: 1.6,
      counterSpin: 'spin-cw 60s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/7b1b5f039de7b54cc9913e96c1923c3b15a157fa.png',
      orbit: 4,
      deg: 95,
      radius: 399,
      sizeClass: 'w-[88px] h-[88px]',
      shapeClass: 'rounded-[24px]',
      glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.65)]',
      delay: 1.8,
      counterSpin: 'spin-cw 60s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/9ae171d8895199349755c43fbff00e122221a027.png',
      orbit: 4,
      deg: 220,
      radius: 399,
      sizeClass: 'w-[88px] h-[88px]',
      shapeClass: 'rounded-[24px]',
      glowClass: 'shadow-[0_0_20px_rgba(236,72,153,0.65)]',
      delay: 2.1,
      counterSpin: 'spin-cw 60s'
    },
    {
      img: 'https://polo-pecan-73837341.figma.site/_assets/v11/926c9eb7b4bc1df846fa0e39f0b0dc3fefd80671.png',
      orbit: 4,
      deg: 320,
      radius: 399,
      sizeClass: 'w-[58px] h-[58px]',
      shapeClass: 'rounded-full',
      glowClass: 'shadow-[0_0_20px_rgba(160,104,255,0.65)]',
      delay: 2.3,
      counterSpin: 'spin-cw 60s'
    }
  ];

  return (
    <div 
      className="app relative min-h-screen text-black overflow-x-hidden flex flex-col justify-between"
      style={{
        backgroundColor: '#000000'
      }}
    >
      {/* Full-screen Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark tint backing to ensure full-bleed image blends perfectly */}
      <div className="absolute inset-0 bg-[#060218]/15 pointer-events-none z-0" />

      {/* Header Area */}
      {!isFormOverlay && (
        <header className="page-fade-down relative z-50 w-full max-w-[1920px] mx-auto flex items-center justify-between px-6 md:px-[64px] py-6 select-none shrink-0">
          
          {/* Left Nav */}
          <div className="flex items-center gap-6 lg:gap-12">
            <Link to="/">
              <img 
                src="https://polo-pecan-73837341.figma.site/_assets/v11/17ae538989a509947a8de3892c644664895e69b1.png" 
                alt="Marketeam Logo" 
                className="h-8 object-contain"
              />
            </Link>
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <span className="nav-link-underline text-[15px] font-normal text-black font-sans">Your Team</span>
              <span className="nav-link-underline text-[15px] font-normal text-black font-sans">Solutions</span>
              <span className="nav-link-underline text-[15px] font-normal text-black font-sans">Blog</span>
              <span className="nav-link-underline text-[15px] font-normal text-black font-sans">Pricing</span>
            </div>
          </div>

          {/* Right Nav */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link 
              to="/login" 
              className="nav-link-underline text-[15px] font-medium text-white font-sans no-underline"
            >
              Log In
            </Link>
            
            <div className="btn-border-wrap">
              <Link to="/register" className="no-underline">
                <button className="btn-hover-slide-left relative overflow-hidden bg-black text-white px-[26px] py-[12px] text-[15px] font-medium rounded-[50px] border-none cursor-pointer flex items-center justify-center">
                  Join Now
                </button>
              </Link>
            </div>
          </div>

        </header>
      )}

      {/* Main Grid Viewport */}
      <main className="relative z-10 w-full max-w-[1920px] mx-auto px-6 md:px-[64px] flex-1 flex flex-col justify-center">
        <div className={`w-full flex flex-col ${isFormOverlay ? 'items-center justify-center py-8' : 'lg:flex-row items-center justify-between py-4'}`}>
          
          {/* Overlay Login/Signup card centered */}
          {isFormOverlay ? (
            <div className="w-full flex items-center justify-center min-h-[500px]">
              {children}
            </div>
          ) : (
            <>
              {/* Left Column (Hero Text content) */}
              {showLeftHero && (
                <div className="page-fade-up w-full lg:w-[600px] shrink-0 text-left">
                  {children}
                </div>
              )}

              {/* Right Column (Concentric Circles visualization) */}
              <div className="page-scale-in flex items-center justify-center select-none w-full lg:w-auto mt-12 lg:mt-0" style={{ animationDelay: '0.3s' }}>
                <div className="circles-viz-container w-[720px] h-[720px] relative flex items-center justify-center origin-center transition-transform">
                  
                  {/* Orbit 1: Innermost (353px) spins CCW */}
                  <div className="orbit-circle-base orbit-border-mask orbit-1-spin" />
                  
                  {/* Innermost static Counter center circle */}
                  <div className="absolute w-[353px] h-[353px] flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="flex flex-col items-center justify-center select-none">
                      <span className="font-urbanist text-[54px] md:text-[64px] font-medium text-white leading-none tracking-tight">
                        {specialistsCount}k+
                      </span>
                      <span className="font-urbanist text-[13px] md:text-[16px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Specialists
                      </span>
                    </div>
                  </div>

                  {/* Orbit 2: (501px) spins CW */}
                  <div className="orbit-circle-base orbit-border-mask orbit-2-spin" />

                  {/* Orbit 3: (649px) spins CW */}
                  <div className="orbit-circle-base orbit-border-mask orbit-3-spin" />

                  {/* Orbit 4: Outermost (797px) spins CCW */}
                  <div className="orbit-circle-base orbit-border-mask orbit-4-spin" />

                  {/* Staggered flying-in avatar cards positioned along orbits */}
                  {avatars.map((avatar, idx) => {
                    const rotationClass = 
                      avatar.orbit === 1 ? 'orbit-1-spin' :
                      avatar.orbit === 2 ? 'orbit-2-spin' :
                      avatar.orbit === 3 ? 'orbit-3-spin' :
                      'orbit-4-spin';

                    const sizePx = avatar.sizeClass.includes('w-[88px]') ? 88 : avatar.sizeClass.includes('w-[78px]') ? 78 : 58;

                    return (
                      <div 
                        key={idx}
                        className={`absolute top-1/2 left-1/2 ${rotationClass}`}
                        style={{
                          width: '0px',
                          height: '0px'
                        }}
                      >
                        {/* Wrapper that translates matching angle & radius coordinates */}
                        <div 
                          style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) rotate(${avatar.deg}deg) translate(${avatar.radius}px) rotate(${-avatar.deg}deg)`,
                            width: `${sizePx}px`,
                            height: `${sizePx}px`
                          }}
                        >
                          <div 
                            className="avatar-fly-in-inner"
                            style={{ 
                              animationDelay: `${avatar.delay}s`,
                              width: `${sizePx}px`,
                              height: `${sizePx}px`
                            }}
                          >
                            {/* Inner counter rotation keeps image upright */}
                            <div 
                              style={{ 
                                animation: `${avatar.counterSpin} linear infinite`,
                                width: `${sizePx}px`,
                                height: `${sizePx}px`
                              }}
                              className="flex items-center justify-center"
                            >
                              <img
                                src={avatar.img}
                                alt={`Partner Specialist ${idx + 1}`}
                                className={`${avatar.sizeClass} ${avatar.shapeClass} ${avatar.glowClass} border border-white/10 object-cover bg-[#0a0a0a] shrink-0`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Infinite Logo Ticker bottom strip */}
      <footer className="page-fade-up relative z-30 w-full bg-transparent py-8 select-none overflow-hidden shrink-0" style={{ animationDelay: '0.6s' }}>
        <div className="logo-ticker-container w-full overflow-hidden">
          <div className="partner-ticker-track flex items-center">
            {repeatedLogos.map((logoUrl, index) => (
              <img
                key={index}
                src={logoUrl}
                alt="Brand Partner Logo"
                className="w-[137px] h-10 object-contain"
              />
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MarketeamBackground;
export { TypewriterHeading };
