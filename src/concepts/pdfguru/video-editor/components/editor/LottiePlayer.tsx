import { type FC, useEffect, useRef } from 'react';

import lottie from 'lottie-web';

interface LottiePlayerProps {
  /** Parsed Lottie animation JSON. */
  animationData: unknown;
  className?: string;
  loop?: boolean;
}

/** Renders a Lottie animation (SVG) that fits its container, looping by default. */
export const LottiePlayer: FC<LottiePlayerProps> = ({ animationData, className, loop = true }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const animation = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      autoplay: true,
      loop,
      animationData
    });
    return () => animation.destroy();
  }, [animationData, loop]);

  return (
    <div
      ref={container}
      aria-hidden='true'
      className={className}
    />
  );
};
