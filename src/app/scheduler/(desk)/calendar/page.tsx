import { SchedulerCalendarBoard } from "@/components/scheduler/SchedulerCalendarBoard";
import {
  chicagoTodayYmd,
  parseSchedulerCalendarView,
  parseSchedulerCalendarYmd,
  resolveCalendarLoadRange,
} from "@/lib/scheduler/calendar-range";
import { loadSchedulerCalendarRows } from "@/lib/scheduler/load-calendar";

export const dynamic = "force-dynamic";

export default async function SchedulerCalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string; date?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const todayYmd = chicagoTodayYmd();
  const view = parseSchedulerCalendarView(sp.view);
  const dateYmd = parseSchedulerCalendarYmd(sp.date, todayYmd);
  const range = resolveCalendarLoadRange(view, dateYmd, todayYmd);
  const rows = range ? await loadSchedulerCalendarRows(range.from, range.to) : [];

  return <SchedulerCalendarBoard view={view} dateYmd={dateYmd} todayYmd={todayYmd} rows={rows} />;
}
