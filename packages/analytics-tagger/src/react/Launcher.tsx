import { useRef, useState } from 'react';

export function Launcher({ count, onToggle }: { count: number; onToggle: () => void }) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const dragRef = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    drag.moved = true;
    setPos({ left: e.clientX - drag.dx, top: e.clientY - drag.dy });
  };
  const onPointerUp = () => {
    const moved = dragRef.current?.moved ?? false;
    dragRef.current = null;
    if (!moved) onToggle();
  };

  return (
    <button
      type="button"
      className="aftag-launcher"
      style={pos ? { left: pos.left, top: pos.top, right: 'auto', bottom: 'auto' } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      Tag &bull;{count}
    </button>
  );
}
