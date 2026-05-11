const ITEMS = [
  "Read this page.",
  "Pick the role that feels easiest for you.",
  "Complete the volunteer signup form.",
  "Invite one friend to look at this page.",
  "Join or help start a 3-person team in your area.",
] as const;

export function OnboardingChecklist() {
  return (
    <ol className="list-decimal space-y-3 pl-6 font-body text-base leading-relaxed text-kelly-text/90">
      {ITEMS.map((item) => (
        <li key={item} className="pl-1">
          {item}
        </li>
      ))}
    </ol>
  );
}
