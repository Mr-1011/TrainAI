import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { stampsService } from "@/services/stamps.service";
import type { Stamp, Direction } from "@/types/passport";

interface EditStampDialogProps {
  stamp: Stamp | null;
  passportPageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditStampDialog({ stamp, passportPageId, open, onOpenChange, onSuccess }: EditStampDialogProps) {
  const { toast } = useToast();
  const [countryCode, setCountryCode] = useState<string>("");
  const [direction, setDirection] = useState<Direction | "">("");
  const [stampDate, setStampDate] = useState<Date | undefined>();
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isCreating = !stamp;

  // Update form when stamp changes or reset when creating
  useEffect(() => {
    if (stamp) {
      setCountryCode(stamp.country_code || "");
      setDirection(stamp.direction || "");
      setStampDate(stamp.stamp_date ? new Date(stamp.stamp_date) : undefined);
    } else {
      // Reset form for creating new stamp
      setCountryCode("");
      setDirection("");
      setStampDate(undefined);
    }
  }, [stamp, open]);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((country) => country.code === countryCode),
    [countryCode]
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (isCreating) {
        // Create new stamp
        if (!passportPageId) {
          toast({
            title: "Error",
            description: "Passport page is required to create a stamp",
            variant: "destructive",
          });
          return;
        }

        await stampsService.createStamp(passportPageId, {
          country_code: countryCode || "",
          direction: (direction || "entry") as Direction,
          stamp_date: stampDate ? format(stampDate, "yyyy-MM-dd") : "",
        });

        toast({
          title: "Stamp created",
          description: "The stamp has been created successfully",
        });
      } else {
        // Update existing stamp
        if (!stamp) return;

        await stampsService.updateStamp(stamp.id, {
          country_code: countryCode || null,
          direction: direction || null,
          stamp_date: stampDate ? format(stampDate, "yyyy-MM-dd") : null,
        });

        toast({
          title: "Stamp updated",
          description: "The stamp has been updated successfully",
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: isCreating ? "Creation failed" : "Update failed",
        description: error.response?.data?.detail || `Failed to ${isCreating ? "create" : "update"} stamp`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Add Stamp" : "Edit Stamp"}</DialogTitle>
          <DialogDescription>
            {isCreating ? "Add a new stamp to this passport page" : "Update the stamp details below"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countrySearchOpen}
                  className="w-full justify-between"
                >
                  {selectedCountry ? selectedCountry.name : "Select country..."}
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
                          onSelect={() => {
                            setCountryCode(country.code);
                            setCountrySearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              countryCode === country.code ? "opacity-100" : "opacity-0"
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

          {/* Direction Selection */}
          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select value={direction} onValueChange={(value) => setDirection(value as Direction)}>
              <SelectTrigger>
                <SelectValue placeholder="Select direction..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry</SelectItem>
                <SelectItem value="exit">Exit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !stampDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {stampDate ? format(stampDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={stampDate}
                  onSelect={(date) => {
                    setStampDate(date);
                    setDatePickerOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreating ? "Creating..." : "Saving..."}
              </>
            ) : (
              isCreating ? "Create Stamp" : "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditStampDialog;
