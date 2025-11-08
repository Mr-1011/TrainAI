import { useMemo, type ComponentType } from "react";
import { DateRange } from "react-day-picker";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import * as flags from "country-flag-icons/react/3x2";

import type { CountryStay } from "@/types/passport";
import { getCountryName } from "@/lib/countries";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CountryTimelineProps {
  stays: CountryStay[];
  dateRange?: DateRange;
  isLoading?: boolean;
}

interface TimelineSegment {
  id: string;
  left: number;
  width: number;
  label: string;
  startDate: Date;
  endDate: Date | null;
  dayCount: number;
  hasEnter: boolean;
  hasExit: boolean;
  isOngoing: boolean;
  visibleStart: Date;
  visibleEnd: Date;
}

interface TimelineRow {
  key: string;
  countryCode: string;
  countryName: string;
  flag: JSX.Element | null;
  color: string;
  segments: TimelineSegment[];
  totalDays: number;
}

const MIN_WIDTH_PERCENT = 3;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

const generateColor = (index: number) => `hsl(${(index * 53) % 360} 70% 45%)`;

const getFlagComponent = (countryCode: string | null | undefined) => {
  if (!countryCode) return null;
  const FlagComponent = (flags as Record<string, ComponentType<{ className?: string }>>)[countryCode];
  return FlagComponent ? <FlagComponent className="h-5 w-7 rounded border" /> : null;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const CountryTimeline = ({ stays, dateRange, isLoading }: CountryTimelineProps) => {
  const timeline = useMemo(() => {
    const fallbackStart = dateRange?.from ? startOfDay(dateRange.from) : startOfDay(new Date());
    const fallbackEnd = dateRange?.to ? endOfDay(dateRange.to) : fallbackStart;

    if (stays.length === 0) {
      return {
        start: fallbackStart,
        end: fallbackEnd,
        rows: [] as TimelineRow[],
      };
    }

    const allStartDates: Date[] = [];
    const allEndDates: Date[] = [];

    stays.forEach((stay) => {
      stay.entry_exit_pairs.forEach((pair) => {
        if (pair.enter) {
          allStartDates.push(startOfDay(parseISO(pair.enter)));
        }
        if (pair.exit) {
          allEndDates.push(endOfDay(parseISO(pair.exit)));
        }
      });
    });

    const start =
      dateRange?.from && !Number.isNaN(dateRange.from.getTime())
        ? startOfDay(dateRange.from)
        : allStartDates.length > 0
          ? allStartDates.reduce((min, current) => (current < min ? current : min), allStartDates[0])
          : fallbackStart;

    let end =
      dateRange?.to && !Number.isNaN(dateRange.to.getTime())
        ? endOfDay(dateRange.to)
        : allEndDates.length > 0
          ? allEndDates.reduce((max, current) => (current > max ? current : max), allEndDates[0])
          : fallbackEnd;

    if (end < start) {
      end = start;
    }

    const totalRangeMs = Math.max(end.getTime() - start.getTime(), 1);

    const rows: TimelineRow[] = stays
      .map((stay, index) => {
        const countryCode = stay.country_code ?? "—";
        const countryName = getCountryName(countryCode) ?? countryCode;
        const color = generateColor(index);
        const flag = getFlagComponent(countryCode);

        const segments: TimelineSegment[] = stay.entry_exit_pairs
          .map((pair, pairIndex) => {
            const hasEnter = Boolean(pair.enter);
            const hasExit = Boolean(pair.exit);
            const actualStart = hasEnter ? startOfDay(parseISO(pair.enter!)) : start;
            const actualEnd = hasExit ? endOfDay(parseISO(pair.exit!)) : null;

            const rawStart = actualStart;
            const rawEnd = actualEnd ?? end;

            // Ignore segments completely outside of the visible window
            if (rawEnd < start || rawStart > end) {
              return null;
            }

            const effectiveStart = rawStart < start ? start : rawStart;
            const effectiveEnd = rawEnd > end ? end : rawEnd;

            if (effectiveEnd < effectiveStart) {
              return null;
            }

            const durationMs = (actualEnd ?? effectiveEnd).getTime() - actualStart.getTime();
            const fallbackDays = Math.max(1, Math.round(durationMs / MS_IN_DAY) || 0);
            const dayCount =
              typeof pair.days_total === "number" && pair.days_total > 0
                ? pair.days_total
                : fallbackDays;

            const leftPercent =
              ((effectiveStart.getTime() - start.getTime()) / totalRangeMs) * 100;

            let widthPercent =
              ((effectiveEnd.getTime() - effectiveStart.getTime()) / totalRangeMs) * 100;

            if (widthPercent <= 0) {
              widthPercent = MIN_WIDTH_PERCENT;
            } else {
              widthPercent = Math.max(widthPercent, MIN_WIDTH_PERCENT);
            }

            const safeLeft = clamp(leftPercent, 0, 100);
            const safeWidth = clamp(widthPercent, MIN_WIDTH_PERCENT, 100 - safeLeft);

            const label = hasExit
              ? `${format(effectiveStart, "dd MMM")} – ${format(effectiveEnd, "dd MMM")}`
              : `${format(effectiveStart, "dd MMM")} – ongoing`;

            return {
              id: `${countryCode}-${pairIndex}-${pair.enter ?? "open"}`,
              left: safeLeft,
              width: safeWidth,
              label,
              startDate: actualStart,
              endDate: actualEnd,
              dayCount,
              hasEnter,
              hasExit,
              isOngoing: !hasExit,
              visibleStart: effectiveStart,
              visibleEnd: effectiveEnd,
            };
          })
          .filter((segment): segment is TimelineSegment => segment !== null);

        // Calculate total days from all segments
        const totalDays = segments.reduce((sum, segment) => sum + segment.dayCount, 0);

        return {
          key: `${countryCode}-${index}`,
          countryCode,
          countryName,
          flag,
          color,
          segments,
          totalDays,
        };
      })
      .filter((row) => row.segments.length > 0);

    return { start, end, rows };
  }, [stays, dateRange]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[220px,1fr] items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-7 rounded" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (timeline.rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
        No stays available for the selected range.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[220px,1fr] items-center gap-4 text-xs uppercase text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Country</span>
          <span>Total</span>
        </div>
        <div className="flex justify-between">
          <span>{format(timeline.start, "dd MMM yyyy")}</span>
          <span>{format(timeline.end, "dd MMM yyyy")}</span>
        </div>
      </div>

      <div className="space-y-2">
        {timeline.rows.map((row) => (
          <div
            key={row.key}
            className="grid grid-cols-[220px,1fr] items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-9 items-center justify-center shrink-0">
                {row.flag ?? <span className="text-lg">🌍</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight truncate">{row.countryName}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {row.totalDays} {row.totalDays === 1 ? 'day' : 'days'}
              </Badge>
            </div>

            <div className="relative h-11 overflow-visible">
              <div className="absolute inset-y-2 left-0 right-0 rounded-md border border-dashed border-muted-foreground/40 bg-background" />
              {row.segments.map((segment) => {
                const startLabel = segment.hasEnter
                  ? format(segment.startDate, "dd MMM yyyy")
                  : "Unknown start";
                const endLabel = segment.hasExit && segment.endDate
                  ? format(segment.endDate, "dd MMM yyyy")
                  : "Ongoing";
                const clippedStart =
                  segment.hasEnter &&
                  segment.visibleStart.getTime() > segment.startDate.getTime();
                const clippedEnd =
                  segment.hasExit &&
                  segment.endDate &&
                  segment.visibleEnd.getTime() < segment.endDate.getTime();
                const clippedOngoing =
                  !segment.hasExit &&
                  segment.visibleEnd.getTime() < timeline.end.getTime();

                const visibleLabel = segment.isOngoing
                  ? `${format(segment.visibleStart, "dd MMM")} – in progress`
                  : `${format(segment.visibleStart, "dd MMM")} – ${format(segment.visibleEnd, "dd MMM")}`;

                return (
                  <Tooltip key={segment.id} delayDuration={150}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute top-2 flex h-7 items-center overflow-hidden rounded-md px-2 text-xs font-medium text-white shadow-sm group"
                        style={{
                          left: `${segment.left}%`,
                          width: `${segment.width}%`,
                          backgroundColor: row.color,
                        }}
                      >
                        <span className="truncate" style={{
                          display: segment.width < 15 ? 'none' : 'block'
                        }}>{segment.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="max-w-xs">
                      <div className="space-y-1 text-xs">
                        <p className="font-medium">{row.countryName}</p>
                        <p>
                          {startLabel} – {endLabel}
                        </p>
                        <p className="text-muted-foreground">
                          {segment.dayCount} day{segment.dayCount === 1 ? "" : "s"} total
                        </p>
                        {(clippedStart || clippedEnd || clippedOngoing) && (
                          <p className="text-muted-foreground">
                            Visible portion: {visibleLabel}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryTimeline;
