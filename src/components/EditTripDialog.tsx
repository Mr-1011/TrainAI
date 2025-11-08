import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { extractErrorMessage, formatApiErrorDetail, type ApiErrorDetail } from "@/lib/api-error";
import { COUNTRIES } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";
import { tripsService } from "@/services/trips.service";
import { format, isBefore, parseISO } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import type { Trip } from "@/types/trip";

interface EditTripDialogProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditTripDialog({
  trip,
  open,
  onOpenChange,
  onSuccess,
}: EditTripDialogProps) {
  const { toast } = useToast();

  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [entryDateOpen, setEntryDateOpen] = useState(false);
  const [exitDateOpen, setExitDateOpen] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("");
  const [entryDate, setEntryDate] = useState<Date | undefined>(undefined);
  const [exitDate, setExitDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((country) => country.code === countryCode),
    [countryCode]
  );

  // Populate form when trip changes
  useEffect(() => {
    if (trip && open) {
      setCountryCode(trip.country_code || "");
      setEntryDate(trip.entrance_date ? parseISO(trip.entrance_date) : undefined);
      setExitDate(trip.exit_date ? parseISO(trip.exit_date) : undefined);
    }
  }, [trip, open]);

  const resetForm = () => {
    setCountryCode("");
    setEntryDate(undefined);
    setExitDate(undefined);
  };

  const handleSubmit = async () => {
    if (!trip) return;

    if (!countryCode) {
      toast({
        title: "Country required",
        description: "Choose the destination country for this trip.",
        variant: "destructive",
      });
      return;
    }

    if (!entryDate) {
      toast({
        title: "Entry date required",
        description: "Specify when the trip started.",
        variant: "destructive",
      });
      return;
    }

    if (exitDate && isBefore(exitDate, entryDate)) {
      toast({
        title: "Invalid date range",
        description: "Exit date cannot be earlier than the entry date.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      country_code: countryCode,
      entrance_date: format(entryDate, "yyyy-MM-dd"),
      exit_date: exitDate ? format(exitDate, "yyyy-MM-dd") : null,
    };

    setIsSubmitting(true);
    try {
      await tripsService.updateTrip(trip.id, payload);
      toast({
        title: "Trip updated",
        description: "The trip has been updated successfully.",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const detail =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { detail?: ApiErrorDetail } } }).response?.data?.detail
          : undefined;

      const fallbackMessage = extractErrorMessage(error);

      toast({
        title: "Failed to update trip",
        description:
          formatApiErrorDetail(detail) ||
          fallbackMessage ||
          "Please double-check the form fields and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Trip</DialogTitle>
          <DialogDescription>
            Update this trip entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Destination country</Label>
            <Popover
              open={countrySearchOpen}
              onOpenChange={setCountrySearchOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  id="country"
                  variant="outline"
                  role="combobox"
                  aria-expanded={countrySearchOpen}
                  className="w-full justify-between"
                  disabled={isSubmitting}
                >
                  {selectedCountry ? selectedCountry.name : "Select a country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] p-0">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {COUNTRIES.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.name}
                          onSelect={() => {
                            setCountryCode(country.code);
                            setCountrySearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              countryCode === country.code
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Entry date</Label>
              <Popover open={entryDateOpen} onOpenChange={setEntryDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !entryDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={entryDate}
                    selected={entryDate}
                    onSelect={setEntryDate}
                    captionLayout="dropdown"
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Exit date</Label>
              <Popover open={exitDateOpen} onOpenChange={setExitDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exitDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting || !entryDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exitDate ? format(exitDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={exitDate}
                    selected={exitDate}
                    captionLayout="dropdown"
                    onSelect={setExitDate}
                    className="w-full"
                    disabled={(date) =>
                      entryDate ? isBefore(date, entryDate) : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
