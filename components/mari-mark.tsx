import Image from "next/image";
import face from "@/public/brand/mari-face.png";
import logo from "@/public/brand/mari-logo.png";

/**
 * Mari's face in a navy ring — used wherever the brand appears small
 * (header, chat avatar). The full illustration turns to mush below ~80px,
 * so small spots use this crop instead.
 */
export function MariMark({
  size = 56,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={face}
      alt="Mari"
      width={size}
      height={size}
      priority={priority}
      style={{ width: size, height: size }}
      className={`shrink-0 self-start rounded-full ${className}`}
    />
  );
}

/** The full logo — illustration plus "MARI CONCIERGE" wordmark. */
export function MariLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="Mari Concierge"
      priority
      sizes="(min-width: 640px) 260px, 150px"
      // Sized by screen height (short:/tiny: in globals.css) so the first screen
      // always shows the instructions and both starter buttons.
      className={`h-auto w-[150px] tiny:w-[112px] sm:w-[260px] sm:short:w-[180px] sm:tiny:w-[100px] ${className}`}
    />
  );
}
