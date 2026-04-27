import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface FloatingButtonProps {
  onClick: () => void;
}

export default function FloatingButton({ onClick }: FloatingButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      gsap.fromTo(buttonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)', delay: 1.0 }
      );
    }
  }, []);

  const handleClick = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
        onComplete: onClick,
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
      style={{
        background: '#1E293B',
        border: '3px solid #FAF8F5',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 0 20px rgba(245, 158, 11, 0.3)',
        opacity: 0,
      }}
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2, ease: 'power2.out' });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'power2.out' });
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round">
        <path d="M12 5V19M5 12H19" />
      </svg>
    </button>
  );
}
