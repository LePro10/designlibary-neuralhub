/**
 * Full-bleed ambient light at the top of a page: a soft mesh gradient that
 * sinks into the background and fades out as you scroll. It lives inside the
 * scroll content, so it scrolls away naturally.
 *
 * Banding: an 8-bit display shows a long, dark, soft ramp as stripes. So the
 * buffer is a bit larger than it needs to be, the shader dithers, and a faint
 * static dither tile covers the light down to where it has become the page.
 */
import { motion, useTransform, type MotionValue, useMotionValue } from 'motion/react';
import { AMBIENT, type AmbientName } from '../../lib/tokens';
import { cn } from '../../lib/cn';
import { MeshGradient } from './MeshGradient';

export function Ambient({ name = 'home', colors, scrollY, seed = 1, intensity = 0.55, height = 'min(60dvh, 520px)', grain = true, className }: {
  name?: AmbientName;
  /** Five stops, dark → mid → dark. Overrides `name`. */
  colors?: readonly string[];
  /** Scroll position of the page; the light fades out over 360px. */
  scrollY?: MotionValue<number>;
  seed?: number;
  intensity?: number;
  height?: string;
  grain?: boolean;
  className?: string;
}) {
  const still = useMotionValue(0);
  const opacity = useTransform(scrollY ?? still, [0, 360], [1, 0]);
  return (
    <motion.div aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 top-0 overflow-hidden', className)} style={{ opacity, height }}>
      <MeshGradient colors={[...(colors ?? AMBIENT[name])]} intensity={intensity} falloff={0.32} warp={0.35} grain={0} seed={seed} speed={0.35} resolution={0.34} />
      {/* Darken towards the content and into the page colour. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(8_9_9/.2),rgb(8_9_9/.62)_45%,rgb(8_9_9/.93)_78%,var(--color-bg))]" />
      {grain && <div className="grain-tile absolute inset-0 opacity-[.35] [mask-image:linear-gradient(180deg,#000_30%,transparent_92%)]" />}
      <div className="dither absolute inset-0 [mask-image:linear-gradient(180deg,#000_84%,transparent)]" />
    </motion.div>
  );
}
