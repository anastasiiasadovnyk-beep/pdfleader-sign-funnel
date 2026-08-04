import { type FC, useEffect, useRef } from 'react';

import lottie from 'lottie-web';

interface LottiePlayerProps {
  /** Parsed Lottie animation JSON. */
  animationData: unknown;
  className?: string;
  loop?: boolean;
  /** SVG preserveAspectRatio — e.g. 'xMidYMid meet' (fit) or '…slice' (cover). */
  preserveAspectRatio?: string;
}

/** Renders a Lottie animation (SVG) that fits its container, looping by default. */
export const LottiePlayer: FC<LottiePlayerProps> = ({
  animationData,
  className,
  loop = true,
  preserveAspectRatio = 'xMidYMid meet',
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const animation = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      autoplay: true,
      loop,
      animationData,
      rendererSettings: { preserveAspectRatio },
    });
    return () => animation.destroy();
  }, [animationData, loop, preserveAspectRatio]);

  return <div ref={container} aria-hidden="true" className={className} />;
};
