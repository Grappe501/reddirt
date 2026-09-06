export function NestedInstrument() {
  return (
    <div className="ml-iris" aria-hidden>
      <svg viewBox="0 0 420 420" className="ml-iris-svg">
        <ellipse cx="210" cy="210" rx="196" ry="196" fill="none" stroke="#2c313a" />
        <ellipse cx="210" cy="210" rx="154" ry="132" fill="none" stroke="#3a4250" />
        <ellipse cx="210" cy="210" rx="108" ry="86" fill="none" stroke="#8d8678" />
        <ellipse cx="210" cy="210" rx="64" ry="48" fill="none" stroke="#e0b25a" />
        <rect x="178" y="186" width="36" height="28" fill="none" stroke="#f3ead8" />
        <path d="M14 210 H406 M210 14 V406" stroke="#1c2230" />
        <text x="210" y="28" textAnchor="middle" fill="#8d8678" fontSize="10">
          civilization
        </text>
        <text x="210" y="78" textAnchor="middle" fill="#8d8678" fontSize="10">
          organism
        </text>
        <text x="210" y="132" textAnchor="middle" fill="#8d8678" fontSize="10">
          tissue
        </text>
        <text x="196" y="178" fill="#f3ead8" fontSize="9">
          window
        </text>
      </svg>
      <span>limited window</span>
    </div>
  );
}
