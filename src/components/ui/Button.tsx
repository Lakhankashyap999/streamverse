import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/misc';
import { safeExternalUrl } from '../../utils/links';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide select-none whitespace-nowrap transition-[transform,background,box-shadow,color,opacity] duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

const variants: Record<Variant, string> = {
  primary:
    'clip-angle-sm text-white bg-[linear-gradient(110deg,#db2777_0%,#c026d3_45%,#8b5cf6_100%)] hover:brightness-110 hover:shadow-[0_10px_30px_-10px_rgba(192,38,211,0.7)]',
  gold: 'clip-angle-sm text-base bg-[linear-gradient(110deg,#fde68a,#fbbf24_45%,#fb923c)] hover:brightness-105 hover:shadow-[0_10px_30px_-10px_rgba(251,191,36,0.6)]',
  secondary: 'clip-angle-sm glass text-ink hover:bg-white/10 hover:border-white/25',
  ghost: 'rounded-xl text-mute hover:text-ink hover:bg-white/5',
  danger: 'rounded-xl bg-bad/15 text-red-300 border border-bad/40 hover:bg-bad/25',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 px-7 text-base min-h-[3.25rem]',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, icon, iconRight, loading, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  iconRight,
}: CommonProps & { to: string }) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

/** External link button — renders nothing if the URL fails validation. */
export function ExternalButton({
  href,
  hosts,
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  iconRight,
  label,
}: CommonProps & { href: string | null | undefined; hosts?: readonly string[]; label?: string }) {
  const safe = safeExternalUrl(href, hosts ? [...hosts] : undefined);
  if (!safe) return null;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {icon}
      {children}
      {iconRight}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
