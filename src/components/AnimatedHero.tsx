import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Trophy, Brain, Users, Zap } from "lucide-react";

// Mascot component - Duolingo-style owl character
const Mascot = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-32 h-32 relative animate-bounce-slow">
      {/* Owl body */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-xl" />
      {/* Eyes */}
      <div className="absolute top-6 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <div className="w-5 h-5 bg-gray-900 rounded-full animate-look" />
      </div>
      <div className="absolute top-6 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <div className="w-5 h-5 bg-gray-900 rounded-full animate-look" />
      </div>
      {/* Beak */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-orange-400" />
      {/* Wings */}
      <div className="absolute -left-3 top-12 w-8 h-16 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full animate-wave" />
      <div className="absolute -right-3 top-12 w-8 h-16 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full animate-wave-reverse" />
      {/* Graduation cap */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <div className="w-16 h-4 bg-gray-800 rounded" />
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-800 rotate-45" />
        <div className="absolute -top-3 left-1/2 translate-x-4 w-8 h-1 bg-yellow-400" />
        <div className="absolute -top-2 left-1/2 translate-x-8 w-3 h-3 bg-yellow-400 rounded-full" />
      </div>
    </div>
  </div>
);

// Floating card component
const FloatingCard = ({ 
  icon: Icon, 
  label, 
  color, 
  delay = 0,
  position 
}: { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  delay?: number;
  position: string;
}) => (
  <div 
    className={`absolute ${position} bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl animate-float`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-2`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <span className="text-sm font-semibold text-gray-800">{label}</span>
  </div>
);

// Stats counter component
const StatCounter = ({ value, label }: { value: string; label: string }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  
  useEffect(() => {
    let start = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white mb-2">
        {count.toLocaleString()}{value.includes('+') ? '+' : ''}{value.includes('M') ? 'M' : ''}
      </div>
      <div className="text-blue-100 text-sm md:text-base">{label}</div>
    </div>
  );
};

export const AnimatedHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      originalX: number;
      originalY: number;
    }> = [];

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        originalX: x,
        originalY: y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx -= (dx / distance) * force * 0.5;
          particle.vy -= (dy / distance) * force * 0.5;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        // Friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Return to original position
        particle.vx += (particle.originalX - particle.x) * 0.001;
        particle.vy += (particle.originalY - particle.y) * 0.001;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 120) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePosition]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-yellow-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-15 animate-blob animation-delay-6000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl shadow-lg">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-black text-white">SūdžiusAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Floating cards - interactive elements */}
      <FloatingCard icon={Trophy} label="+500 XP" color="bg-yellow-500" position="top-32 left-[10%] hidden lg:block" delay={0} />
      <FloatingCard icon={Sparkles} label="AI Powered" color="bg-purple-500" position="top-48 right-[12%] hidden lg:block" delay={0.5} />
      <FloatingCard icon={Users} label="2M+ Users" color="bg-blue-500" position="bottom-48 left-[8%] hidden lg:block" delay={1} />
      <FloatingCard icon={Zap} label="Fast Learning" color="bg-emerald-500" position="bottom-32 right-[10%] hidden lg:block" delay={1.5} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
          {/* Text content */}
          <div className="flex-1 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm text-white mb-6">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>The #1 AI Learning Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
              Learn anything,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                master everything
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              Personalized AI tutoring that adapts to your learning style. Interactive lessons, gamified progress, and real results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-10 py-7 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-2xl shadow-emerald-500/30 transform hover:scale-105 transition-all group">
                  Start Learning Free
                  <Sparkles className="ml-2 h-5 w-5 group-hover:animate-spin" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50">
                  I have an account
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <StatCounter value="2M+" label="Active Learners" />
              <StatCounter value="50+" label="Subjects" />
              <StatCounter value="98%" label="Success Rate" />
            </div>
          </div>

          {/* Mascot section */}
          <div className="flex-shrink-0 relative hidden lg:block">
            <div className="relative w-80 h-80">
              {/* Glow behind mascot */}
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-30 animate-pulse" />
              
              {/* Mascot */}
              <div className="relative z-10 flex items-center justify-center h-full">
                <Mascot />
              </div>
              
              {/* Orbiting elements */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
              </div>
              <div className="absolute inset-0 animate-spin-slow-reverse">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-purple-400 rounded-full shadow-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-2 h-2 bg-white rounded-full animate-scroll-down" />
        </div>
      </div>
    </div>
  );
};