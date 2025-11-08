import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { Loader2, Plus, BookOpen, Check, ChevronsUpDown } from "lucide-react";
import { usePassport } from "@/contexts/PassportContext";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CreatePassportDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreatePassportDialog({ trigger, onSuccess }: CreatePassportDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("");
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createPassport, passports } = usePassport();
  const { toast } = useToast();

  const MAX_PASSPORTS = 2;

  const selectedCountry = useMemo(
    () => COUNTRIES.find((country) => country.code === countryCode),
    [countryCode]
  );

  const handleCreate = async () => {
    // Check passport limit
    if (passports.length >= MAX_PASSPORTS) {
      toast({
        title: "Passport limit reached",
        description: `You can only create up to ${MAX_PASSPORTS} passports.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const passport = await createPassport({
        country_code: countryCode || undefined,
      });

      toast({
        title: "Passport created",
        description: "Your passport has been created successfully.",
      });

      setOpen(false);
      setCountryCode("");
      onSuccess?.();

      // Navigate to documents page
      navigate("/documents");
    } catch (error: any) {
      console.error("Create passport error:", error);
      const errorMessage =
        error.response?.data?.detail || "Failed to create passport. Please try again.";
      toast({
        title: "Failed to create passport",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Passport
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Add New Passport</DialogTitle>
          <DialogDescription>
            Create a new passport to start tracking your travel stamps. You can optionally select
            your passport's country of origin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="country">Passport Country (Optional)</Label>
            <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countrySearchOpen}
                  className="w-full justify-between"
                >
                  {selectedCountry ? selectedCountry.name : "Select a country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0">
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
            <p className="text-xs text-muted-foreground">
              Select the country that issued your passport. This is optional and can be changed
              later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Passport"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
