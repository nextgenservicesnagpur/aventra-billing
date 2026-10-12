import type { SVGProps } from "react";
import { cn } from "@/shared/utils/cn";

export type NotFoundGraphicProps = SVGProps<SVGSVGElement>;

/**
 * 404 Not Found central metallic bronze graphic.
 *
 * Reproduces the visual source of truth:
 * - 3D extruded metallic numerals with restrained bronze materials and lighting
 * - Hollow central circular numeral (strictly preserving void inside the zero)
 * - Warm backlight halo focused behind the central zero
 * - Horizontal floor illumination plane with contact shadows
 * - Crisp specular rim highlights across upper bevels and inner lower rim
 */
export const NotFoundGraphic = ({ className, ...props }: NotFoundGraphicProps) => (
  <svg
    viewBox="0 0 900 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="404 numeral illustration in bronze metallic finish"
    className={cn("w-full max-w-2xl select-none overflow-visible", className)}
    {...props}
  >
    <defs>
      {/* Front numeral surface gradient */}
      <linearGradient id="nf-metal-front" x1="450" y1="50" x2="450" y2="250" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--notfound-metal-light)" />
        <stop offset="25%" stopColor="var(--notfound-metal-base)" />
        <stop offset="70%" stopColor="var(--notfound-metal-dark)" />
        <stop offset="100%" stopColor="var(--notfound-metal-deep)" />
      </linearGradient>

      {/* Front edge highlight gradient */}
      <linearGradient id="nf-rim-stroke" x1="200" y1="50" x2="700" y2="250" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--notfound-metal-highlight)" />
        <stop offset="50%" stopColor="var(--notfound-metal-light)" />
        <stop offset="100%" stopColor="var(--notfound-metal-base)" />
      </linearGradient>

      {/* Inner lower rim illumination on the zero (catches warm back-light) */}
      <linearGradient id="nf-inner-rim" x1="450" y1="230" x2="450" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--notfound-metal-highlight)" />
        <stop offset="35%" stopColor="var(--notfound-metal-light)" />
        <stop offset="75%" stopColor="var(--notfound-metal-dark)" />
        <stop offset="100%" stopColor="var(--notfound-metal-deep)" />
      </linearGradient>

      {/* 3D depth side extrusion gradient */}
      <linearGradient id="nf-bevel-side" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="var(--notfound-metal-dark)" />
        <stop offset="100%" stopColor="var(--notfound-metal-deep)" />
      </linearGradient>

      {/* 3D depth top bevel highlight */}
      <linearGradient id="nf-bevel-top" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="var(--notfound-metal-highlight)" />
        <stop offset="100%" stopColor="var(--notfound-metal-base)" />
      </linearGradient>

      {/* Atmospheric backlight halo centered behind the zero */}
      <radialGradient id="nf-halo" cx="450" cy="150" r="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--notfound-glow-core)" stopOpacity="0.45" />
        <stop offset="25%" stopColor="var(--notfound-glow-halo)" stopOpacity="0.28" />
        <stop offset="60%" stopColor="var(--notfound-glow-ambient)" stopOpacity="0.1" />
        <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
      </radialGradient>

      {/* Floor reflection light pool */}
      <radialGradient id="nf-floor-light" cx="450" cy="254" r="260" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--notfound-glow-halo)" stopOpacity="0.36" />
        <stop offset="20%" stopColor="var(--notfound-glow-ambient)" stopOpacity="0.18" />
        <stop offset="65%" stopColor="var(--notfound-glow-ambient)" stopOpacity="0.04" />
        <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
      </radialGradient>

      {/* Floor blur filters */}
      <filter id="nf-filter-halo" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="28" />
      </filter>
      <filter id="nf-filter-floor" x="-30%" y="-40%" width="160%" height="180%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
      <filter id="nf-filter-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
    </defs>

    {/* LAYER 1: Atmospheric backlight glow behind the hollow zero */}
    <ellipse cx="450" cy="150" rx="190" ry="150" fill="url(#nf-halo)" filter="url(#nf-filter-halo)" />

    {/* LAYER 2: Ground plane illumination pool */}
    <ellipse cx="450" cy="256" rx="280" ry="24" fill="url(#nf-floor-light)" filter="url(#nf-filter-floor)" />

    {/* LAYER 3: Floor contact shadows under the bases */}
    <ellipse cx="281" cy="251" rx="26" ry="3.5" fill="var(--background)" opacity="0.9" filter="url(#nf-filter-shadow)" />
    <ellipse cx="450" cy="251" rx="34" ry="4" fill="var(--background)" opacity="0.9" filter="url(#nf-filter-shadow)" />
    <ellipse cx="698" cy="251" rx="26" ry="3.5" fill="var(--background)" opacity="0.9" filter="url(#nf-filter-shadow)" />

    {/* LAYER 4: 3D Extrusion facets (depth) */}
    {/* Left 4 depth extrusion */}
    <g fill="url(#nf-bevel-side)">
      {/* Right side facet of vertical stem */}
      <polygon points="292,50 297,46 297,246 292,250" />
      {/* Right side facet of crossbar */}
      <polygon points="318,174 323,170 323,192 318,196" />
      {/* Bottom facet of crossbar */}
      <polygon points="165,196 170,199 323,199 318,196" />
      {/* Inner cutout right vertical facet */}
      <polygon points="270,84 274,81 274,171 270,174" />
    </g>
    {/* Left 4 top bevel highlights */}
    <g fill="url(#nf-bevel-top)">
      {/* Top bevel of stem */}
      <polygon points="270,50 274,46 297,46 292,50" />
      {/* Top bevel of crossbar right projection */}
      <polygon points="292,174 297,170 323,170 318,174" />
      {/* Cutout bottom horizontal top edge */}
      <polygon points="194,174 198,171 274,171 270,174" />
    </g>

    {/* Middle 0: 3D depth facets */}
    {/* Inner bottom cylinder wall (catches luminous warm back-light) */}
    <path
      d="M 372 150 A 78 78 0 0 0 528 150 A 78 68 0 0 1 372 150 Z"
      fill="url(#nf-inner-rim)"
    />
    {/* Inner top cylinder wall (recessed in shadow) */}
    <path
      d="M 372 150 A 78 78 0 0 1 528 150 A 78 68 0 0 0 372 150 Z"
      fill="var(--notfound-metal-deep)"
      opacity="0.85"
    />
    {/* Outer top rim depth arc */}
    <path
      d="M 370 120 A 100 100 0 0 1 530 120 L 534 116 A 104 104 0 0 0 366 116 Z"
      fill="url(#nf-bevel-top)"
      opacity="0.8"
    />

    {/* Right 4 depth extrusion */}
    <g fill="url(#nf-bevel-side)">
      {/* Right side facet of vertical stem */}
      <polygon points="709,50 714,46 714,246 709,250" />
      {/* Right side facet of crossbar */}
      <polygon points="735,174 740,170 740,192 735,196" />
      {/* Bottom facet of crossbar */}
      <polygon points="582,196 587,199 740,199 735,196" />
      {/* Inner cutout right vertical facet */}
      <polygon points="687,84 691,81 691,171 687,174" />
    </g>
    {/* Right 4 top bevel highlights */}
    <g fill="url(#nf-bevel-top)">
      {/* Top bevel of stem */}
      <polygon points="687,50 691,46 714,46 709,50" />
      {/* Top bevel of crossbar right projection */}
      <polygon points="709,174 714,170 740,170 735,174" />
      {/* Cutout bottom horizontal top edge */}
      <polygon points="611,174 615,171 691,171 687,174" />
    </g>

    {/* LAYER 5: Front Numeral Faces */}
    {/* Left 4 Front Face */}
    <path
      d="M 270 50 L 292 50 L 292 174 L 318 174 L 318 196 L 292 196 L 292 250 L 270 250 L 270 196 L 165 196 L 165 174 L 270 50 Z M 270 84 L 270 174 L 194 174 Z"
      fillRule="evenodd"
      fill="url(#nf-metal-front)"
      stroke="url(#nf-rim-stroke)"
      strokeWidth="1"
    />

    {/* Middle 0 Front Face (hollow ring: strictly no interior objects) */}
    <path
      d="M 450 50 A 100 100 0 1 0 450 250 A 100 100 0 1 0 450 50 Z M 450 72 A 78 78 0 1 1 450 228 A 78 78 0 1 1 450 72 Z"
      fillRule="evenodd"
      fill="url(#nf-metal-front)"
      stroke="url(#nf-rim-stroke)"
      strokeWidth="1"
    />

    {/* Right 4 Front Face */}
    <path
      d="M 687 50 L 709 50 L 709 174 L 735 174 L 735 196 L 709 196 L 709 250 L 687 250 L 687 196 L 582 196 L 582 174 L 687 50 Z M 687 84 L 687 174 L 611 174 Z"
      fillRule="evenodd"
      fill="url(#nf-metal-front)"
      stroke="url(#nf-rim-stroke)"
      strokeWidth="1"
    />

    {/* LAYER 6: Specular Rim Highlights */}
    {/* Left 4 diagonal top edge glint */}
    <line
      x1="165"
      y1="174"
      x2="270"
      y2="50"
      stroke="var(--notfound-metal-highlight)"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.9"
    />
    {/* Center 0 top outer arc rim light */}
    <path
      d="M 390 78 A 100 100 0 0 1 510 78"
      stroke="var(--notfound-metal-highlight)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.85"
    />
    {/* Center 0 bottom inner arc specular reflection */}
    <path
      d="M 395 208 A 78 78 0 0 0 505 208"
      stroke="var(--notfound-metal-highlight)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.95"
    />
    {/* Right 4 diagonal top edge glint */}
    <line
      x1="582"
      y1="174"
      x2="687"
      y2="50"
      stroke="var(--notfound-metal-highlight)"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.9"
    />
  </svg>
);
