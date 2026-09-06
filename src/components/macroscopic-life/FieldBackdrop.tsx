export function FieldBackdrop() {
  return (
    <div className="ml-field" aria-hidden>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor">
          <ellipse cx="860" cy="220" rx="70" ry="54" />
          <ellipse cx="860" cy="220" rx="160" ry="118" />
          <ellipse cx="860" cy="220" rx="280" ry="200" />
          <ellipse cx="860" cy="220" rx="440" ry="310" />
          <ellipse cx="860" cy="220" rx="620" ry="430" />
          <path d="M40 220 H1160 M860 20 V760" />
          <rect x="820" y="196" width="44" height="32" />
        </g>
      </svg>
    </div>
  );
}
