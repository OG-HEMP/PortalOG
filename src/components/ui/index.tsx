import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * GlassCard component with improved depth and transparency
 */
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export const GlassCard = ({ children, className, gradient = false, ...props }: GlassCardProps) => {
  return (
    <div 
      className={cn(
        "bg-white/[0.03] border border-white/[0.08] backdrop-blur-[32px] rounded-[32px] overflow-hidden transition-all duration-700",
        "shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]",
        "hover:border-primary/40 hover:bg-white/[0.06] hover:shadow-[0_30px_70px_-10px_rgba(0,132,255,0.15)] hover:-translate-y-1",
        gradient && "bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * PremiumButton component with refined glow and transition effects
 */
interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  glow?: boolean;
}

export const PremiumButton = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  glow = true,
  disabled,
  ...props 
}: PremiumButtonProps) => {
  const variants = {
    primary: "bg-primary text-white shadow-[0_10px_30px_-10px_rgba(0,132,255,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(0,132,255,0.6)] active:scale-95",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 hover:shadow-lg",
    ghost: "bg-transparent text-slate-500 hover:text-white hover:bg-white/5 active:scale-95",
    danger: "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-[10px] rounded-xl",
    md: "px-8 py-4 text-[11px] rounded-2xl",
    lg: "px-10 py-5 text-[13px] rounded-3xl",
    icon: "p-3.5 rounded-2xl",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center font-black uppercase tracking-[0.2em] transition-all duration-700 select-none border-none cursor-pointer",
        variants[variant],
        sizes[size],
        glow && variant === 'primary' && "hover:brightness-110",
        (disabled || loading) && "opacity-40 cursor-not-allowed grayscale scale-100 shadow-none",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-inherit" />
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="animate-pulse">Processing</span>
        </div>
      ) : children}
    </button>
  );
};

/**
 * StatusBadge component with refined holographic styling
 */
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const configs: Record<string, { bg: string; text: string; label: string; dot: string }> = {
    DISCOVERED: { bg: 'bg-white/5', text: 'text-slate-500', label: 'Discovered', dot: 'bg-slate-500' },
    HARDENED: { bg: 'bg-primary/10', text: 'text-primary', label: 'Hardened', dot: 'bg-primary' },
    RESEARCHED: { bg: 'bg-violet-400/10', text: 'text-violet-400', label: 'Intel Ready', dot: 'bg-violet-400' },
    ACTIONED: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', label: 'Synced', dot: 'bg-emerald-400' },
    CRITICAL_DUPLICATE: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'Duplicate', dot: 'bg-rose-500' },
  };

  const config = configs[status] || configs.DISCOVERED;

  return (
    <span className={cn(
      "px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] uppercase inline-flex items-center space-x-2 border border-white/5",
      config.bg,
      config.text,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-glow", config.dot)} />
      <span>{config.label}</span>
    </span>
  );
};

/**
 * Skeleton loader for premium components
 */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-white/5 animate-pulse rounded-2xl", className)} />
);
