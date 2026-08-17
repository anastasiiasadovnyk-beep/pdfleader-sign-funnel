import type { ContactCopy, ContactItem } from '../types';
import { Icon } from './Icon';

const CONTACT_GLYPHS: Record<ContactItem['icon'], string> = {
  phone: 'call',
  email: 'mail',
  address: 'location_on',
};

export function ContactBlock({ copy }: { copy: ContactCopy }) {
  return (
    <div className="flex w-[560px] flex-col items-center gap-4 max-md:w-full">
      <h2 data-ff="ty-contact-heading" className="text-mobile-title-3 text-center text-text-primary">
        {copy.heading}
      </h2>
      <ul className="flex flex-col items-center gap-4">
        {copy.items.map((item) => (
          <li
            key={item.text}
            className="border-os-divider flex items-center gap-2 border-b px-4 py-3"
          >
            <Icon name={CONTACT_GLYPHS[item.icon]} className="text-text-primary" />
            <span className="text-subtitle text-text-primary">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
