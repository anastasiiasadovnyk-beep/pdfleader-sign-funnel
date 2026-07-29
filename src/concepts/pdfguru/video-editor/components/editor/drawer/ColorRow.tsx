import { type FC, useState } from 'react';

import { cn } from '@universe-forma/ui-pes';

import { ColorPickerSwatch } from './ColorPickerSwatch';

interface ColorRowProps {
  value: string;
  /** Preset palette; the first 4 that differ from the initial value seed the row. */
  palette: string[];
  onChange: (color: string) => void;
}

const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Color picker laid out as a wrapping row. It starts with 6 slots — the current
 * color, 4 other presets and the "choose color" button. Picking a custom color
 * appends it as a new swatch (before the button), which pushes the button onto a
 * new row underneath. The selected swatch keeps a ring wherever it sits.
 */
export const ColorRow: FC<ColorRowProps> = ({ value, palette, onChange }) => {
  // Fixed base swatches: the current color first, then 4 other presets. The
  // selection ring moves between them; picked colors accumulate after them.
  const [swatches, setSwatches] = useState<string[]>(() => [
    value,
    ...palette.filter((c) => !eq(c, value)).slice(0, 4)
  ]);

  // Always show the active value (e.g. when a different clip is selected).
  const list = swatches.some((c) => eq(c, value)) ? swatches : [value, ...swatches];

  const handlePick = (color: string) => {
    setSwatches((prev) => (prev.some((c) => eq(c, color)) ? prev : [...prev, color]));
    onChange(color);
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {list.map((color, index) => (
        <button
          key={`${color}-${index}`}
          type='button'
          aria-label={`Color ${color}`}
          onClick={() => onChange(color)}
          style={{ backgroundColor: color }}
          className={cn(
            'size-9 rounded-2 border border-os-divider transition-transform hover:scale-105',
            eq(color, value) && 'ring-2 ring-primary ring-offset-2'
          )}
        />
      ))}
      <ColorPickerSwatch
        value={value}
        onChange={handlePick}
      />
    </div>
  );
};
