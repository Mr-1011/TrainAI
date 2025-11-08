import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { COUNTRIES } from "@/lib/countries";
import { getCountryName } from "@/lib/countries";
import { extractErrorMessage, formatApiErrorDetail, type ApiErrorDetail } from "@/lib/api-error";
import { useToast } from "@/hooks/use-toast";
import { tripsService } from "@/services/trips.service";
import { format, isBefore } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import type { CreateTripRequest } from "@/types/trip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePassport } from "@/contexts/PassportContext";
import type { Passport } from "@/types/passport";

interface AddTripDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddTripDialog({
  trigger,
  onSuccess,
}: AddTripDialogProps) {
  const { toast } = useToast();
  const {
    passports,
    currentPassport,
    selectPassport,
  } = usePassport();

  const [open, setOpen] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [entryDateOpen, setEntryDateOpen] = useState(false);
  const [exitDateOpen, setExitDateOpen] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("");
  const [entryDate, setEntryDate] = useState<Date | undefined>(undefined);
  const [exitDate, setExitDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPassportId, setSelectedPassportId] = useState<string>("");

  const selectedCountry = useMemo(
    () => COUNTRIES.find((country) => country.code === countryCode),
    [countryCode]
  );

  const resetForm = () => {
    setCountryCode("");
    setEntryDate(undefined);
    setExitDate(undefined);
  };

  useEffect(() => {
    if (open) {
      const initialPassport =
        currentPassport?.id || passports[0]?.id || "";
      setSelectedPassportId(initialPassport);
    }
  }, [open, currentPassport?.id, passports]);

  const handlePassportSelect = (value: string) => {
    setSelectedPassportId(value);
    const selected = passports.find((passport) => passport.id === value);
    if (selected) {
      selectPassport(selected);
    }
  };

  const handleEntryDateSelect = (date: Date | undefined) => {
    setEntryDate(date);
    if (date) {
      setEntryDateOpen(false);
      if (exitDate && isBefore(exitDate, date)) {
        setExitDate(undefined);
      }
    }
  };

  const handleExitDateSelect = (date: Date | undefined) => {
    setExitDate(date);
    if (date) {
      setExitDateOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPassportId) {
      toast({
        title: "Passport required",
        description: "Select which passport this trip belongs to.",
        variant: "destructive",
      });
      return;
    }

    const passport = passports.find(
      (candidate) => candidate.id === selectedPassportId
    );

    if (!passport) {
      toast({
        title: "Invalid passport",
        description: "Choose a valid passport before saving.",
        variant: "destructive",
      });
      return;
    }

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

    const payload: CreateTripRequest = {
      country_code: countryCode,
      entrance_date: format(entryDate, "yyyy-MM-dd"),
      exit_date: exitDate ? format(exitDate, "yyyy-MM-dd") : undefined,
    };

    setIsSubmitting(true);
    try {
      await tripsService.createTrip(passport.id, payload);
      toast({
        title: "Trip added",
        description: "The trip has been saved successfully.",
      });
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const detail =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { detail?: ApiErrorDetail } } }).response?.data?.detail
          : undefined;

      toast({
        title: "Failed to add trip",
        description:
          formatApiErrorDetail(detail) ||
          extractErrorMessage(error) ||
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
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Trip</DialogTitle>
          <DialogDescription>
            Save a manual trip entry for the selected passport.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Passport</Label>
            <Select
              value={selectedPassportId}
              onValueChange={handlePassportSelect}
              disabled={isSubmitting || passports.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    passports.length === 0
                      ? "No passports available"
                      : "Select a passport"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {passports.map((passport: Passport) => (
                  <SelectItem key={passport.id} value={passport.id}>
                    <span className="flex flex-col">
                      <span className="font-medium">
                        {passport.country_code
                          ? `${getCountryName(passport.country_code) || passport.country_code} passport`
                          : "Passport"}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                    onSelect={handleEntryDateSelect}
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
                    onSelect={handleExitDateSelect}
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
            Save Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
