import type { TemplateProps } from './types';

export default function Screen({ title }: TemplateProps) {
  return <h1 className="text-desktop-title-3 p-8">{title}</h1>;
}
