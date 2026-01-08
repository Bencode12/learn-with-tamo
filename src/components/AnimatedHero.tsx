import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import { CursorTrail } from "./CursorTrail";

// Eraser reveal effect hook
const useEraserReveal = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const revealPercentage = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Fill with dark overlay
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resize();

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    const eraserSize = 120;

    const erase = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      
      // Create soft eraser brush
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, eraserSize);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.8)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw line between points for smooth erasing
      if (isDrawing) {
        ctx.lineWidth = eraserSize * 1.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      lastX = x;
      lastY = y;

      // Calculate reveal percentage
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentPixels = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 128) transparentPixels++;
      }
      revealPercentage.current = (transparentPixels / (canvas.width * canvas.height)) * 100;
      
      if (revealPercentage.current > 30 && !isRevealed) {
        setIsRevealed(true);
        // Auto-reveal rest
        autoReveal();
      }
    };

    const autoReveal = () => {
      let opacity = 1;
      const fade = () => {
        opacity -= 0.05;
        if (opacity > 0) {
          ctx.globalAlpha = opacity;
          ctx.fillStyle = '#0a0a0f';
          ctx.globalCompositeOperation = 'source-over';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = opacity;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          requestAnimationFrame(fade);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      fade();
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing = true;
      lastX = e.clientX;
      lastY = e.clientY;
      erase(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) {
        // Light erase on hover
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, 60, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      erase(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      isDrawing = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDrawing = true;
      const touch = e.touches[0];
      lastX = touch.clientX;
      lastY = touch.clientY;
      erase(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const touch = e.touches[0];
      erase(touch.clientX, touch.clientY);
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, [canvasRef, isRevealed]);

  return isRevealed;
};

// Animated counter
const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = value / 40;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 40);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Floating orb component
const FloatingOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <div 
    className={`absolute rounded-full blur-[100px] animate-float-slow ${className}`}
    style={{ animationDelay: `${delay}s` }}
  />
);

// Revolut-style button
const RevolutButton = ({ children, variant = "primary", className = "", ...props }: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  [key: string]: any;
}) => {
  const baseStyles = "relative overflow-hidden font-semibold transition-all duration-300 transform";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:scale-105 active:scale-95",
    secondary: "bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:scale-105 active:scale-95"
  };

  return (
    <Button 
      size="lg" 
      className={`${baseStyles} ${variants[variant]} btn-revolut ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export const AnimatedHero = () => {
  const eraserCanvasRef = useRef<HTMLCanvasElement>(null);
  const isRevealed = useEraserReveal(eraserCanvasRef);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cursor trail effect */}
      <CursorTrail />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Animated particle network background */}
      <AnimatedBackground />
      
      {/* Animated mesh gradient - Revolut style */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-emerald-500/20 via-transparent to-transparent animate-spin-slow opacity-30" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-conic from-indigo-500/20 via-transparent to-transparent animate-spin-slow-reverse opacity-30" />
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating morphing orbs */}
      <FloatingOrb className="top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 animate-morph" delay={0} />
      <FloatingOrb className="bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 animate-morph" delay={2} />
      <FloatingOrb className="top-1/2 left-1/2 w-64 h-64 bg-violet-500/15 animate-morph" delay={4} />
      <FloatingOrb className="bottom-1/3 left-1/3 w-48 h-48 bg-blue-500/15 animate-morph" delay={6} />

      {/* Eraser overlay canvas */}
      <canvas 
        ref={eraserCanvasRef} 
        className="absolute inset-0 z-30 cursor-crosshair"
        style={{ touchAction: 'none' }}
      />

      {/* Navigation */}
      <nav className="relative z-40 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-all duration-300" />
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl transform group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SūdžiusAI</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Leaderboard', 'Help'].map((item, i) => (
            <Link 
              key={item}
              to={item === 'Features' ? '/gamemodes' : `/${item.toLowerCase()}`} 
              className="relative text-slate-300 hover:text-white transition-colors text-sm font-medium group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 hidden sm:inline-flex transition-all duration-300 hover:scale-105"
            >
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <RevolutButton variant="primary" className="text-base px-6 py-5">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </RevolutButton>
          </Link>
        </div>
      </nav>

      {/* Eraser hint */}
      {!isRevealed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-center pointer-events-none animate-pulse">
          <div className="glass rounded-2xl px-8 py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center animate-glow-pulse">
              <div className="w-8 h-8 border-2 border-white/60 rounded-full" />
            </div>
            <p className="text-white/90 text-lg font-medium">Drag to reveal</p>
            <p className="text-white/50 text-sm mt-1">Erase the darkness</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 transition-all duration-1000 ${isRevealed ? 'opacity-100' : 'opacity-50'}`}>
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-8 animate-fade-in-up">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-medium">AI-Powered Learning Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[0.95] tracking-tight animate-fade-in-up animation-delay-200">
            Master any skill
            <br />
            <span className="text-gradient-animate">
              10x faster
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-400">
            Personalized AI tutoring that adapts to how you learn. 
            Interactive lessons, real-time feedback, and gamified progress.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-600">
            <Link to="/signup">
              <RevolutButton variant="primary" className="text-base px-8 py-6">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </RevolutButton>
            </Link>
            <RevolutButton variant="secondary" className="text-base px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </RevolutButton>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 animate-fade-in-up animation-delay-800">
            {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((text, i) => (
              <div key={i} className="flex items-center gap-2 hover:text-slate-300 transition-colors cursor-default">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 md:gap-16 animate-fade-in-up animation-delay-1000">
          {[
            { value: 2, suffix: 'M+', label: 'Active Learners' },
            { value: 50, suffix: '+', label: 'Subjects' },
            { value: 98, suffix: '%', label: 'Success Rate' }
          ].map((stat, i) => (
            <div key={i} className="text-center group cursor-default">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors duration-300">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5 hover:border-emerald-400/50 transition-colors cursor-pointer">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-scroll-down" />
        </div>
      </div>
    </div>
  );
};
