import type { SVGProps } from "react";

/**
 * Circular "The People Rule" campaign mark for the header.
 * Original civic roundel — not the official Arkansas state seal.
 */
export function HeaderRoundLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx={64} cy={64} r={63.5} fill="var(--kelly-official-navy)" />
      <circle cx={64} cy={64} r={61.2} stroke="var(--kelly-official-gold)" strokeWidth={2.4} />
      <circle cx={64} cy={64} r={55.4} stroke="var(--kelly-official-gold)" strokeWidth={0.95} />
      <circle cx={28.5} cy={46.2} r={0.85} fill="var(--kelly-official-gold)" />
      <circle cx={99.5} cy={46.2} r={0.85} fill="var(--kelly-official-gold)" />
      <text
        x={64}
        y={50}
        textAnchor="middle"
        fill="var(--kelly-official-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={13.25}
        fontWeight={700}
        letterSpacing={3.6}
      >
        THE
      </text>
      <line x1={30} y1={56.2} x2={98} y2={56.2} stroke="var(--kelly-official-gold)" strokeWidth={0.85} />
      <text
        x={64}
        y={75.2}
        textAnchor="middle"
        fill="var(--kelly-official-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={16.4}
        fontWeight={700}
        letterSpacing={0.4}
      >
        PEOPLE
      </text>
      <line x1={30} y1={82} x2={98} y2={82} stroke="var(--kelly-official-gold)" strokeWidth={0.85} />
      <text
        x={64}
        y={100}
        textAnchor="middle"
        fill="var(--kelly-official-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={13.25}
        fontWeight={700}
        letterSpacing={2.7}
      >
        RULE
      </text>
    </svg>
  );
}
