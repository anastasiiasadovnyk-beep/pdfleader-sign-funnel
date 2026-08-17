import type { DashboardNavCopy } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';

/** Marketing-site header the dashboard sits under: logo, nav, account link. */
export function DashHeader({ nav, onHome }: { nav: DashboardNavCopy; onHome?: () => void }) {
  return (
    <header
      data-ff="dash-header"
      className="border-os-divider flex w-full items-center justify-between border-b px-28 py-5 max-md:px-4"
    >
      <button
        type="button"
        data-ff="dash-home"
        aria-label="PDFLeader — start over"
        onClick={onHome}
        className="cursor-pointer disabled:cursor-not-allowed"
      >
        <Logo className="w-[150px]" />
      </button>
      <nav className="flex items-center gap-8 max-md:hidden">
        {nav.items.map((item, index) => (
          <span key={item} className="text-subtitle flex items-center gap-1 text-text-primary">
            {item}
            {/* Only the grouped nav entries carry a chevron in the reference. */}
            {index < nav.items.length - 1 && (
              <Icon name="keyboard_arrow_down" size={16} className="text-text-primary" />
            )}
          </span>
        ))}
      </nav>
      <span className="text-subtitle-emph flex items-center gap-2 text-primary">
        <Icon name="account_circle" size={20} className="text-primary" />
        {nav.accountLabel}
      </span>
    </header>
  );
}
