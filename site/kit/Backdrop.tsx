/** A busy, colourful scene to judge glass, blur and contrast on. Pure CSS, no image. */
import { cn } from '@ui/lib/cn';
import { Ambient } from '@ui/components/effects/Ambient';

export function Backdrop({ className, variant = 'scene' }: { className?: string; variant?: 'scene' | 'ambient' | 'grid' | 'checker' | 'plain' }) {
  if (variant === 'plain') return <div className={cn('absolute inset-0 bg-bg', className)} />;
  if (variant === 'grid') return <div className={cn('dot-grid absolute inset-0 bg-chrome', className)} />;
  if (variant === 'checker') return <div className={cn('checker absolute inset-0', className)} />;
  if (variant === 'ambient') return (
    <div className={cn('absolute inset-0 overflow-hidden bg-bg', className)}>
      <Ambient name="luna" height="100%" />
    </div>
  );
  return (
    <div className={cn('absolute inset-0 overflow-hidden bg-[#0b0d16]', className)} aria-hidden="true">
      <div className="absolute top-[-20%] left-[-10%] h-[70%] w-[55%] rounded-full bg-[#3b5bff] opacity-70 blur-3xl" />
      <div className="absolute top-[10%] right-[-10%] h-[60%] w-[45%] rounded-full bg-[#ff8a5c] opacity-55 blur-3xl" />
      <div className="absolute bottom-[-25%] left-[25%] h-[60%] w-[50%] rounded-full bg-[#9fe7c8] opacity-40 blur-3xl" />
      <div className="absolute inset-0 grid grid-cols-6 gap-3 p-6 opacity-60">
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/15" style={{ background: `hsl(${(i * 47) % 360} 70% ${i % 3 ? 55 : 72}% / .35)` }} />
        ))}
      </div>
      <p className="absolute inset-x-6 bottom-6 text-[44px] leading-none font-light tracking-[-.04em] text-white/80">Light is content.</p>
    </div>
  );
}
