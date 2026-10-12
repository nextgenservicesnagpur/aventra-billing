import Image from "next/image";
import { cn } from "../utils/cn";

export type AventraBrandProps = {
  className?: string;
};

/**
 * Compact Aventra identity lockup for application chrome (dashboard
 * header, future navigation shells). Feature-agnostic: the large centered
 * auth intro branding stays in the auth feature. The wordmark text is the
 * accessible name; the logo is decorative alongside it.
 */
export const AventraBrand = ({ className }: AventraBrandProps) => (
  <span className={cn("flex items-center gap-2.5", className)}>
    <span className="aspect-[6/5] w-6 shrink-0 md:w-7">
      <Image
        src="/images/aventra-logo.png"
        alt=""
        width={192}
        height={160}
        className="h-auto w-full"
      />
    </span>
    <span className="font-heading text-xs font-semibold tracking-[0.3em] text-text-primary md:text-sm">
      AVENTRA
    </span>
  </span>
);
