import { useEffect, useState, useCallback } from "react";

interface TrailDot {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export const CursorTrail = () => {
  const [dots, setDots] = useState<TrailDot[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setIsVisible(true);
    const newDot: TrailDot = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      opacity: 1
    };

    setDots(prev => [...prev.slice(-15), newDot]);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Fade out dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => 
        prev
          .map(dot => ({ ...dot, opacity: dot.opacity - 0.1 }))
          .filter(dot => dot.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {dots.map((dot, index) => (
        <div
          key={dot.id}
          className="absolute w-2 h-2 rounded-full bg-emerald-400 blur-sm"
          style={{
            left: dot.x - 4,
            top: dot.y - 4,
            opacity: dot.opacity * 0.6,
            transform: `scale(${1 - index * 0.05})`,
            transition: 'opacity 0.1s ease-out'
          }}
        />
      ))}
    </div>
  );
};
