import { LottiePlayer } from './LottiePlayer';
import desktopAnimation from '../assets/desktop-split-track.json';
import mobileAnimation from '../assets/mobile-split-track.json';

type AnimationPanelProps = { className?: string };

/** Lavender illustration panel that hosts the "splitting track" Lottie.
 * Desktop uses the tall 354×528 comp (left column); mobile uses the wide
 * 327×280 comp (top band). Only the active one is visible per breakpoint. */
export default function AnimationPanel({ className }: AnimationPanelProps) {
  return (
    <div
      data-ff="animation"
      className={`flex items-center justify-center overflow-hidden rounded-4 bg-primary-opacity-8 ${className ?? ''}`}
    >
      {/* mobile: wide comp */}
      <LottiePlayer
        animationData={mobileAnimation}
        className="h-full w-full md:hidden"
      />
      {/* desktop: tall comp */}
      <LottiePlayer
        animationData={desktopAnimation}
        className="hidden h-full w-full md:block"
      />
    </div>
  );
}
