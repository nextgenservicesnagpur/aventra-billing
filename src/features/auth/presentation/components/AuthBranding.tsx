import Image from "next/image";

/**
 * Aventra brand lockup: logo mark, wordmark, and tagline.
 * Static presentational content; intro motion is owned by the page shell.
 *
 * The logo lives in a stable box (controlled responsive width, intrinsic
 * 6/5 aspect, shrink-proof) that is identical in the centered and settled
 * intro states, so the layout transition only ever moves it.
 */
export const AuthBranding = () => (
  <div className="flex flex-col items-center text-center">
    <div className="aspect-[6/5] w-32 shrink-0 overflow-visible md:w-40">
      <Image
        src="/images/aventra-logo.png"
        alt="Aventra logo"
        width={192}
        height={160}
        priority
        className="h-auto w-full"
      />
    </div>
    <p className="mt-10 pl-[0.35em] font-heading text-xl font-semibold tracking-[0.35em] text-text-primary md:text-2xl">
      AVENTRA
    </p>
    <p className="mt-4 pl-[0.25em] text-[11px] font-medium tracking-[0.25em] text-text-muted md:text-xs">
      ERP FOR A MORE ORGANIZED TOMORROW
    </p>
  </div>
);
