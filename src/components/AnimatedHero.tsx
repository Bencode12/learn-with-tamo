import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export const AnimatedHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Gradient mesh animation
    let time = 0;
    const gradientPoints = [
      { x: 0.2, y: 0.3, color: [16, 185, 129] }, // Emerald
      { x: 0.8, y: 0.2, color: [59, 130, 246] },  // Blue
      { x: 0.5, y: 0.8, color: [139, 92, 246] },  // Purple
    ];

    const animate = () => {
      time += 0.002;
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'hsl(220, 30%, 8%)');
      gradient.addColorStop(1, 'hsl(240, 25%, 12%)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated gradient orbs
      gradientPoints.forEach((point, i) => {
        const offsetX = Math.sin(time + i * 2) * 100;
        const offsetY = Math.cos(time + i * 1.5) * 80;
        
        const x = point.x * canvas.width + offsetX;
        const y = point.y * canvas.height + offsetY;
        const radius = Math.min(canvas.width, canvas.height) * 0.4;

        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grd.addColorStop(0, `rgba(${point.color.join(',')}, 0.15)`);
        grd.addColorStop(0.5, `rgba(${point.color.join(',')}, 0.05)`);
        grd.addColorStop(1, 'transparent');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Subtle grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SūdžiusAI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/gamemodes" className="text-sm text-white/70 hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/leaderboard" className="text-sm text-white/70 hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link to="/help" className="text-sm text-white/70 hover:text-white transition-colors">
            Resources
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm">
              Sign in
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-white text-gray-900 hover:bg-white/90 text-sm font-semibold px-5">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-6 text-center">
        {/* Announcement badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-sm mb-8 animate-fade-in">
          <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">NEW</span>
          <span className="text-white/80">AI-powered personalized learning paths</span>
          <ArrowRight className="h-4 w-4 text-white/60" />
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white max-w-5xl leading-[1.1] tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          The future of
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            learning is here
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Experience adaptive AI tutoring that understands how you learn. 
          Master any subject with personalized lessons, real-time feedback, and gamified progress tracking.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Link to="/signup">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5">
              Start learning for free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-base px-8 py-6 rounded-xl backdrop-blur-sm">
            <Play className="mr-2 h-4 w-4" />
            Watch demo
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">2M+</div>
            <div className="text-sm text-white/50">Active learners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
            <div className="text-sm text-white/50">Subjects available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">98%</div>
            <div className="text-sm text-white/50">Success rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
            <div className="text-sm text-white/50">User rating</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </div>
  );
};
