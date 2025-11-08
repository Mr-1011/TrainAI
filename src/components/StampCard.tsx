import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Download, Upload, ChevronDownIcon } from "lucide-react";
import { getCountryName, COUNTRIES } from "@/lib/countries";
import type { Stamp, Direction } from "@/types/passport";
import * as flags from 'country-flag-icons/react/3x2';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface StampCardProps {
  stamp: Stamp;
  onChange: (stampId: string, updates: Partial<Stamp>) => void;
  onDelete: (stampId: string) => void;
}

export const StampCard = ({ stamp, onChange, onDelete }: StampCardProps) => {
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const getFlagComponent = (countryCode: string | null) => {
    if (!countryCode) return null;
    const FlagComponent = (flags as any)[countryCode];
    return FlagComponent ? <FlagComponent className="h-5 w-8 rounded shadow-sm" /> : null;
  };

  const handleCountryChange = (value: string) => {
    onChange(stamp.id, { country_code: value });
    setCountrySearchOpen(false);
  };

  const handleDirectionChange = (value: string) => {
    onChange(stamp.id, { direction: value as Direction });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onChange(stamp.id, { stamp_date: format(date, "yyyy-MM-dd") });
      setDatePickerOpen(false);
    }
  };

  const stampDate = stamp.stamp_date ? new Date(stamp.stamp_date) : undefined;
  const selectedCountry = COUNTRIES.find(c => c.code === stamp.country_code);

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "Select date";
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header with confidence badge and delete button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {stamp.confidence !== null && stamp.confidence !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {(stamp.confidence * 100).toFixed(0)}% confidence
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(stamp.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Direction Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Direction</label>
            <Select value={stamp.direction || ""} onValueChange={handleDirectionChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select direction">
                  {stamp.direction && (
                    <div className="flex items-center gap-2">
                      {stamp.direction === "entry" ? (
                        <Download className="h-3 w-3 rotate-90" />
                      ) : (
                        <Upload className="h-3 w-3 rotate-90" />
                      )}
                      <span className="capitalize">{stamp.direction}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">
                  <div className="flex items-center gap-2">
                    <Download className="h-3 w-3 rotate-90" />
                    Entry
                  </div>
                </SelectItem>
                <SelectItem value="exit">
                  <div className="flex items-center gap-2">
                    <Upload className="h-3 w-3 rotate-90" />
                    Exit
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country Dropdown with Search */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Country</label>
            <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countrySearchOpen}
                  className="w-full justify-between"
                >
                  {selectedCountry ? (
                    <div className="flex items-center gap-2">
                      {getFlagComponent(selectedCountry.code)}
                      <span>{selectedCountry.name}</span>
                    </div>
                  ) : (
                    "Select country"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {COUNTRIES.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.name}
                          onSelect={() => handleCountryChange(country.code)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              stamp.country_code === country.code ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            {getFlagComponent(country.code)}
                            {country.name}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Date</label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {formatDisplayDate(stampDate)}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={stampDate}
                  captionLayout="dropdown"
                  onSelect={handleDateChange}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StampCard;
