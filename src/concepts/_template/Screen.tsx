import type { TemplateProps } from './types';
import ExampleRow from './components/ExampleRow';

export default function Screen({ title }: TemplateProps) {
  return (
    <div className="p-8">
      <h1 className="text-desktop-title-3">{title}</h1>
      <ExampleRow label="Example decomposed row" />
    </div>
  );
}
