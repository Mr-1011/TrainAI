import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { EllipsisVertical, Globe, Loader2, Plus, Search, Check, ChevronsUpDown, X, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import * as flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";

import { AddTripDialog } from "@/components/AddTripDialog";
import { EditTripDialog } from "@/components/EditTripDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePassport } from "@/contexts/PassportContext";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { getCountryName } from "@/lib/countries";
import { tripsService } from "@/services/trips.service";
import type { Trip } from "@/types/trip";

type FlagProps = { className?: string };

const Trips = () => {
  const { passports, fetchPassports, currentPassport, selectPassport } = usePassport();
  const { toast } = useToast();
  const confirm = useConfirmDialog();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<string[]>([]);
  const [countryFilterOpen, setCountryFilterOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<"entry" | "exit" | "duration" | null>("entry");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const loadTrips = useCallback(
    async (passportId: string) => {
      setIsLoadingTrips(true);
      try {
        const data = await tripsService.getTripsByPassport(passportId);
        setTrips(data);
      } catch (error: unknown) {
        console.error("Failed to load trips:", error);
        let detail: string | undefined;
        if (typeof error === "object" && error !== null && "response" in error) {
          const maybeError = error as {
            response?: { data?: { detail?: string } };
          };
          detail = maybeError.response?.data?.detail;
        }

        toast({
          title: "Failed to load trips",
          description: detail || "Could not fetch trip history",
          variant: "destructive",
        });
        setTrips([]);
      } finally {
        setIsLoadingTrips(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (passports.length === 0) {
      fetchPassports();
    }
  }, [fetchPassports, passports.length]);

  useEffect(() => {
    if (passports.length > 0 && !currentPassport) {
      selectPassport(passports[0]);
    }
  }, [currentPassport, passports, selectPassport]);

  useEffect(() => {
    if (currentPassport) {
      loadTrips(currentPassport.id);
    } else {
      setTrips([]);
    }
  }, [currentPassport, loadTrips]);

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    try {
      return format(parseISO(date), "dd.MM.yyyy");
    } catch {
      return date;
    }
  };

  const calculateDurationDays = (entry: string | null, exit: string | null): number => {
    if (!entry || !exit) return 0;
    try {
      const entryDate = parseISO(entry);
      const exitDate = parseISO(exit);
      const days = differenceInCalendarDays(exitDate, entryDate) + 1;
      return days > 0 ? days : 0;
    } catch {
      return 0;
    }
  };

  const calculateDuration = (entry: string | null, exit: string | null) => {
    if (!entry && !exit) {
      return "—";
    }

    if (entry && !exit) {
      return "In progress";
    }

    if (!entry || !exit) {
      return "—";
    }

    const days = calculateDurationDays(entry, exit);
    if (days === 0) {
      return "—";
    }
    return `${days} day${days === 1 ? "" : "s"}`;
  };

  const getFlagComponent = (countryCode: string | null) => {
    if (!countryCode) return null;
    const FlagComponent = (flags as Record<string, ComponentType<FlagProps>>)[
      countryCode
    ];
    return FlagComponent ? <FlagComponent className="h-6 w-8 rounded border" /> : null;
  };

  const filteredTrips = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // First apply filters
    let filtered = [...trips];

    // Apply search filter
    if (query) {
      filtered = filtered.filter((trip) => {
        const countryName = trip.country_code
          ? getCountryName(trip.country_code).toLowerCase()
          : "";
        return countryName.includes(query);
      });
    }

    // Apply country filter (multiple countries)
    if (selectedCountryCodes.length > 0) {
      filtered = filtered.filter((trip) =>
        trip.country_code && selectedCountryCodes.includes(trip.country_code)
      );
    }

    // Then apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortColumn === "entry") {
        const aDate = a.entrance_date || "";
        const bDate = b.entrance_date || "";
        comparison = aDate.localeCompare(bDate);
      } else if (sortColumn === "exit") {
        const aDate = a.exit_date || "";
        const bDate = b.exit_date || "";
        comparison = aDate.localeCompare(bDate);
      } else if (sortColumn === "duration") {
        const aDuration = calculateDurationDays(a.entrance_date, a.exit_date);
        const bDuration = calculateDurationDays(b.entrance_date, b.exit_date);
        comparison = aDuration - bDuration;
      } else {
        // Default sort by entry date descending
        const aDate = a.entrance_date || "";
        const bDate = b.entrance_date || "";
        comparison = bDate.localeCompare(aDate);
        return comparison;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [searchQuery, selectedCountryCodes, trips, sortColumn, sortDirection]);

  // Calculate total days from filtered trips
  const totalDays = useMemo(() => {
    return filteredTrips.reduce((sum, trip) => {
      if (!trip.entrance_date || !trip.exit_date) return sum;
      try {
        const entryDate = parseISO(trip.entrance_date);
        const exitDate = parseISO(trip.exit_date);
        const days = differenceInCalendarDays(exitDate, entryDate) + 1;
        return sum + (days > 0 ? days : 0);
      } catch {
        return sum;
      }
    }, 0);
  }, [filteredTrips]);

  const selectedCountries = useMemo(
    () => COUNTRIES.filter((country) => selectedCountryCodes.includes(country.code)),
    [selectedCountryCodes]
  );

  const handleToggleCountry = (countryCode: string) => {
    setSelectedCountryCodes((prev) =>
      prev.includes(countryCode)
        ? prev.filter((code) => code !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleRemoveCountry = (countryCode: string) => {
    setSelectedCountryCodes((prev) => prev.filter((code) => code !== countryCode));
  };

  const handleClearAllFilters = () => {
    setSelectedCountryCodes([]);
  };

  const handleSort = (column: "entry" | "exit" | "duration") => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column with descending as default
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: "entry" | "exit" | "duration") => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const getTripStatusLabel = (trip: Trip) =>
    trip.exit_date ? "Completed" : "In progress";

  const getTripStatusVariant = (trip: Trip) =>
    trip.exit_date ? "secondary" : "outline";

  const makeTableCaption = () => {
    if (!currentPassport) {
      return "Select a passport to view its recorded trips.";
    }

    return `Showing ${filteredTrips.length} trip${filteredTrips.length === 1 ? "" : "s"
      } for this passport.`;
  };

  const hasCurrentPassport = Boolean(currentPassport);

  const handleTripSelect = (trip: Trip) => {
    setEditingTrip(trip);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingTrip(null);
    }
  };

  const handleDeleteTrip = async (trip: Trip) => {
    if (deletingTripId) return;

    const confirmed = await confirm({
      title: "Delete this trip?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;

    setDeletingTripId(trip.id);
    try {
      await tripsService.deleteTrip(trip.id);
      toast({
        title: "Trip deleted",
        description: "The trip has been removed successfully.",
      });

      if (editingTrip?.id === trip.id) {
        setIsEditDialogOpen(false);
        setEditingTrip(null);
      }

      await loadTrips(trip.passport_id);
    } catch (error: unknown) {
      console.error("Failed to delete trip:", error);
      let detail: string | undefined;
      if (typeof error === "object" && error !== null && "response" in error) {
        const maybeError = error as {
          response?: { data?: { detail?: string } };
        };
        detail = maybeError.response?.data?.detail;
      }
      toast({
        title: "Failed to delete trip",
        description: detail || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDeletingTripId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
      <div className="space-y-6">

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search trips by country..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                  disabled={isLoadingTrips}
                />
              </div>

              {/* Filter Button */}
              <Popover open={countryFilterOpen} onOpenChange={setCountryFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-10 w-10 shrink-0",
                      selectedCountryCodes.length > 0 && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    disabled={isLoadingTrips}
                  >
                    <Filter className="h-4 w-4" />
                    {selectedCountryCodes.length > 0 && (
                      <span className="sr-only">{selectedCountryCodes.length} filters active</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="start">
                  <div className="border-b p-3 flex items-center justify-between">
                    <span className="font-semibold text-sm">Filter by Countries</span>
                    {selectedCountryCodes.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="h-auto p-1 text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {COUNTRIES.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={country.name}
                            keywords={[country.code.toLowerCase()]}
                            onSelect={() => handleToggleCountry(country.code)}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                selectedCountryCodes.includes(country.code)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                            <span className="flex items-center gap-2">
                              {getFlagComponent(country.code)}
                              {country.name}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <AddTripDialog
              onSuccess={() => currentPassport && loadTrips(currentPassport.id)}
              trigger={
                <Button
                  className="w-full sm:w-auto"
                  disabled={!hasCurrentPassport}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trip
                </Button>
              }
            />
          </div>

          {/* Selected Country Pills */}
          {selectedCountryCodes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {selectedCountries.map((country) => (
                <Badge
                  key={country.code}
                  variant="secondary"
                  className="gap-1 pr-1 pl-2"
                >
                  <span className="flex items-center gap-1.5">
                    {getFlagComponent(country.code)}
                    {country.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveCountry(country.code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardContent>
            {isLoadingTrips ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                Loading trips...
              </div>
            ) : !currentPassport ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Globe className="h-12 w-12 mb-4" />
                <h3 className="font-medium mb-2">No passport selected</h3>
                <p className="text-sm max-w-sm">
                  Choose a passport to view and manage trips associated with it.
                </p>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Globe className="h-12 w-12 mb-4" />
                <h3 className="font-medium mb-2">No trips yet</h3>
                <p className="text-sm max-w-sm">
                  Start tracking your travels by adding your first trip for this
                  passport.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[220px]">Country</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => handleSort("entry")}
                          >
                            Entry
                            {getSortIcon("entry")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => handleSort("exit")}
                          >
                            Exit
                            {getSortIcon("exit")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => handleSort("duration")}
                          >
                            Duration
                            {getSortIcon("duration")}
                          </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[60px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-8 flex items-center justify-center">
                                {getFlagComponent(trip.country_code)}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {trip.country_code
                                    ? getCountryName(trip.country_code)
                                    : "Unknown"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {trip.country_code || "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(trip.entrance_date)}</TableCell>
                          <TableCell>{formatDate(trip.exit_date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {calculateDuration(
                                trip.entrance_date,
                                trip.exit_date
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getTripStatusVariant(trip)}>
                              {getTripStatusLabel(trip)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label="Open trip actions"
                                  disabled={deletingTripId === trip.id}
                                  onClick={(event) => event.stopPropagation()}
                                  onKeyDown={(event) => event.stopPropagation()}
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onCloseAutoFocus={(event) => event.preventDefault()}>
                                <DropdownMenuItem
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    handleTripSelect(trip);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={Boolean(deletingTripId)}
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    handleDeleteTrip(trip);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-semibold">
                          Total
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="font-semibold">
                            {totalDays} day{totalDays === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>

                <div className="md:hidden space-y-4">
                  {filteredTrips.map((trip) => {
                    const countryName = trip.country_code
                      ? getCountryName(trip.country_code)
                      : "Unknown country";
                    const statusLabel = getTripStatusLabel(trip);
                    const statusVariant = getTripStatusVariant(trip);
                    return (
                      <Card key={trip.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <span className="h-5 w-7 flex items-center justify-center">
                                {getFlagComponent(trip.country_code)}
                              </span>
                              {countryName}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                              <Badge variant={statusVariant}>{statusLabel}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Open trip actions"
                                    disabled={deletingTripId === trip.id}
                                    onClick={(event) => event.stopPropagation()}
                                    onKeyDown={(event) => event.stopPropagation()}
                                  >
                                    <EllipsisVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onCloseAutoFocus={(event) => event.preventDefault()}>
                                  <DropdownMenuItem
                                    onSelect={(event) => {
                                      event.preventDefault();
                                      handleTripSelect(trip);
                                    }}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={Boolean(deletingTripId)}
                                    onSelect={(event) => {
                                      event.preventDefault();
                                      handleDeleteTrip(trip);
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <span className="text-xs uppercase tracking-wide">
                              {trip.country_code || "N/A"}
                            </span>
                            •
                            <span className="text-xs">
                              {calculateDuration(
                                trip.entrance_date,
                                trip.exit_date
                              )}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Entry</span>
                            <span className="font-medium">
                              {formatDate(trip.entrance_date)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exit</span>
                            <span className="font-medium">
                              {formatDate(trip.exit_date)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">
                              Duration
                            </span>
                            <span className="font-semibold">
                              {calculateDuration(
                                trip.entrance_date,
                                trip.exit_date
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Mobile Summary */}
                  {filteredTrips.length > 0 && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Total Days</span>
                          <Badge variant="default" className="text-base font-semibold px-4 py-1">
                            {totalDays} day{totalDays === 1 ? "" : "s"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditTripDialog
        trip={editingTrip}
        open={isEditDialogOpen && Boolean(editingTrip)}
        onOpenChange={handleEditDialogOpenChange}
        onSuccess={() => {
          if (currentPassport) {
            loadTrips(currentPassport.id);
          }
        }}
      />
    </div>
  );
};

export default Trips;
