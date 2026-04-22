import { toggleExecutionChecklistItemAction } from "@/app/admin/calendar-hq-actions";
import type { ChecklistItem, ChecklistSection } from "@/lib/calendar/event-intelligence";

export function ChecklistItemForm({
  eventId,
  section,
  item,
}: {
  eventId: string;
  section: ChecklistSection;
  item: ChecklistItem;
}) {
  return (
    <form action={toggleExecutionChecklistItemAction} className="flex items-start gap-1.5">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="itemId" value={item.id} />
      <button
        type="submit"
        className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded border ${
          item.done ? "border-field-green bg-field-green" : "border-deep-soil/25 bg-white"
        }`}
        aria-pressed={item.done}
        title="Mark done / undo"
      />
      <span className={item.done ? "text-deep-soil/50 line-through" : "text-deep-soil/90"}>{item.label}</span>
    </form>
  );
}
