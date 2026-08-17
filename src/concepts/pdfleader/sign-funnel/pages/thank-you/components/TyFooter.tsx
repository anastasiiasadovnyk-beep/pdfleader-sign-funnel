import type { FooterCopy } from '../types';
import { Icon } from './Icon';
import { Logo } from './Logo';

/** Marketing footer (below the fold in the reference frames). */
export function TyFooter({ copy }: { copy: FooterCopy }) {
  return (
    <footer className="bg-bg-white-bg w-full">
      <div className="flex gap-25 px-28 pb-8 pt-6 max-md:flex-col max-md:gap-8 max-md:px-4">
        <Logo className="w-[215px] shrink-0 self-start" />
        <div className="flex flex-1 gap-8 max-md:flex-col">
          {copy.columns.map((column) => (
            <div key={column.heading} className="flex flex-1 flex-col gap-6 pt-5">
              <h3 className="text-mobile-title-3 text-text-primary">{column.heading}</h3>
              <ul className="flex flex-col gap-3">
                {column.items.map((item) => (
                  <li key={item} className="text-subtitle flex items-center gap-1 text-text-primary">
                    {item}
                    {column.heading === 'Tools' && (
                      <Icon name="keyboard_arrow_down" size={16} className="text-text-primary" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-1 flex-col gap-6 pt-5">
            <h3 className="text-mobile-title-3 text-text-primary">Language</h3>
            <button type="button" disabled className="flex items-center gap-2">
              <span className="border-os-divider flex h-[15px] w-5 flex-col overflow-hidden rounded-[1.5px] border">
                <span className="bg-material-red-700 h-1/3 w-full" />
                <span className="bg-bg-white-bg h-1/3 w-full" />
                <span className="bg-material-blue-700 h-1/3 w-full" />
              </span>
              <span className="text-subtitle text-text-primary">{copy.languageLabel}</span>
              <Icon name="keyboard_arrow_down" size={16} className="text-text-primary" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 px-28 pb-4 pt-0.5 max-md:px-4">
        <p className="text-body-2 text-material-grey-600 max-w-[1136px] text-center font-medium">
          {copy.terms}
        </p>
        <ul className="flex flex-wrap justify-center gap-6">
          {copy.links.map((link) => (
            <li key={link} className="text-body-2 text-primary font-medium">
              {link}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
