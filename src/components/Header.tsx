import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface HeaderProps {
  progress: number;
}

export default function Header({ progress }: HeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, []);

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, [progress]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div ref={headerRef} className="glass-panel p-5 mb-4 opacity-0">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1
            className="text-2xl font-bold text-dark"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            星·语
          </h1>
          <p className="text-sm text-muted-light mt-0.5">{dateStr}</p>
        </div>
        <div className="text-right">
          <span
            className="mono text-3xl font-bold"
            style={{ color: '#10B981', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {progress}%
          </span>
          <p className="text-xs text-muted-light mt-0.5">今日完成度</p>
        </div>
      </div>
      
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.08)' }}>
        <div
          ref={progressRef}
          className="h-full rounded-full"
          style={{
            width: '0%',
            background: 'linear-gradient(90deg, #10B981, #06B6D4)',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
          }}
        />
      </div>
    </div>
  );
}
