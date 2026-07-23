export type QualitySliderProps = {
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
};

export default function QualitySlider({ value, onChange, ariaLabel }: QualitySliderProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="relative flex h-5 items-center">
      <div className="h-1 w-full rounded-full bg-os-divider" />
      <div
        className="absolute left-0 h-1 rounded-full bg-primary"
        style={{ width: `${clamped}%` }}
      />
      <div
        className="absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-primary bg-bg-white-bg shadow"
        style={{ left: `${clamped}%` }}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={clamped}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
