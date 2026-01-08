import { LucideIcon } from "lucide-react";
import { TiltCard } from "./TiltCard";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) => {
  return (
    <TiltCard tiltAmount={8} className="h-full">
      <div 
        className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 h-full transition-all duration-500 hover:border-slate-600 hover:shadow-2xl hover:shadow-emerald-500/10"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
        
        {/* Gradient glow on hover */}
        <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
        
        {/* Icon with bounce animation */}
        <div className={`relative w-14 h-14 ${gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
          <Icon className="h-7 w-7 text-white" />
          {/* Pulse ring */}
          <div className={`absolute inset-0 ${gradient} rounded-xl animate-ping opacity-20`} />
        </div>
        
        {/* Content with slide-up effect */}
        <h3 className="relative text-xl font-semibold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
        <p className="relative text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{description}</p>
        
        {/* Arrow indicator */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </TiltCard>
  );
};
