import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

export type PresetValue = "30" | "60" | "180" | "365" | "custom";

export interface PresetOption {
  value: Exclude<PresetValue, "custom">;
  label: string;
  days: number;
}

interface TripDateFilterProps {
  label: string;
  selectedPreset: PresetValue;
  dateRange: DateRange | undefined;
  presets: PresetOption[];
  onPresetSelect: (value: Exclude<PresetValue, "custom">) => void;
  onRangeSelect: (range: DateRange | undefined) => void;
  onReset: () => void;
}

const isFutureDate = (value: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(value);
  candidate.setHours(0, 0, 0, 0);
  return candidate > today;
};

const TripDateFilter = ({
  label,
  selectedPreset,
  dateRange,
  presets,
  onPresetSelect,
  onRangeSelect,
  onReset,
}: TripDateFilterProps) => {
  const [open, setOpen] = useState(false);

  const handlePresetClick = (value: Exclude<PresetValue, "custom">) => {
    onPresetSelect(value);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    onRangeSelect(range);
  };

  const handleResetClick = () => {
    onReset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={selectedPreset === "custom" ? "default" : "outline"}
          className="justify-start gap-2"
          size="sm"
        >
          <CalendarIcon className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 w-[580px] max-w-none">
        <DialogHeader>
          <DialogTitle>Choose timeline</DialogTitle>
          <DialogDescription>
            Use a shortcut or pick a custom date range to filter dashboard insights.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              size="sm"
              variant={selectedPreset === preset.value ? "default" : "outline"}
              onClick={() => handlePresetClick(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleRangeSelect}
          defaultMonth={dateRange?.from ?? new Date()}
          numberOfMonths={2}
          captionLayout="dropdown"
          disabled={(date) => isFutureDate(date)}
        />

        <DialogFooter className="flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={handleResetClick}>
            Reset
          </Button>
          <DialogClose asChild>
            <Button size="sm">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TripDateFilter;
