import React, { useEffect, useRef } from 'react';

const CursorGlow = () => {
  const orbRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const orb = orbRef.current;
    const container = containerRef.current;
    if (!orb || !container) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    // Track mouse coordinate values
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    // Smooth lerp follow animation loop
    let frameId;
    const updatePosition = () => {
      // Lerp coefficient for smooth delay transition
      const ease = 0.08;
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      if (orb) {
        orb.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      frameId = requestAnimationFrame(updatePosition);
    };

    // Only apply on pointer-capable desktop screens
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMouseMove);
      frameId = requestAnimationFrame(updatePosition);
    } else {
      // Mobile fallback: slowly float in the background autonomously
      let angle = 0;
      const animateMobile = () => {
        angle += 0.005;
        const radiusX = 120;
        const radiusY = 80;
        const rect = container.getBoundingClientRect();
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        
        currentX = midX + Math.cos(angle) * radiusX;
        currentY = midY + Math.sin(angle) * radiusY;
        
        if (orb) {
          orb.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        }
        frameId = requestAnimationFrame(animateMobile);
      };
      frameId = requestAnimationFrame(animateMobile);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="cursor-glow-container">
      <div ref={orbRef} className="cursor-glow-orb" />
    </div>
  );
};

export default CursorGlow;
