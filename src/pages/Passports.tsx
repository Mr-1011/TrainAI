import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Upload, X, ImageIcon, Loader2, Plus, Trash2, Globe, Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { format, parseISO } from "date-fns";
import { usePassport } from "@/contexts/PassportContext";
import { getCountryName } from "@/lib/countries";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { passportService } from "@/services/passport.service";
import { passportPagesService } from "@/services/passport-pages.service";
import { stampsService } from "@/services/stamps.service";
import { useToast } from "@/hooks/use-toast";
import type { PassportPage, Passport, Stamp } from "@/types/passport";
import { PassportPageStatus } from "@/types/passport";
import * as flags from 'country-flag-icons/react/3x2';
import { useConfirmDialog } from "@/components/confirm-dialog-provider";

const Passports = () => {
  const { fetchPassports } = usePassport();
  const { passportId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to extract error messages from API responses
  const getErrorMessage = (error: any, fallback: string): string => {
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;

      // If detail is an array of validation errors
      if (Array.isArray(detail)) {
        return detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
      } else if (typeof detail === "string") {
        return detail;
      } else {
        // If it's an object, try to extract the message
        return detail.msg || detail.message || JSON.stringify(detail);
      }
    }
    return fallback;
  };

  const [isUploading, setIsUploading] = useState(false);
  const [passportPages, setPassportPages] = useState<PassportPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isExtractingStamps, setIsExtractingStamps] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);
  const [isLoadingPassport, setIsLoadingPassport] = useState(true);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [isLoadingStamps, setIsLoadingStamps] = useState(false);

  const MAX_PAGES_PER_PASSPORT = 4;
  const hasReachedPageLimit = passportPages.length >= MAX_PAGES_PER_PASSPORT;

  // Fetch the specific passport by ID
  useEffect(() => {
    const loadPassport = async () => {
      if (!passportId) return;

      setIsLoadingPassport(true);
      try {
        const passport = await passportService.getPassport(passportId);
        setSelectedPassport(passport);
      } catch (error: any) {
        console.error('Failed to load passport:', error);
        // Only set null if it's a 404 or permission error
        if (error.response?.status === 404 || error.response?.status === 403) {
          setSelectedPassport(null);
        }
      } finally {
        setIsLoadingPassport(false);
      }
    };

    loadPassport();
  }, [passportId]);

  // Fetch passport pages when passportId is available or passport status changes
  useEffect(() => {
    const loadPassportPages = async () => {
      if (!passportId) return;

      setIsLoadingPages(true);
      try {
        const pages = await passportPagesService.getPassportPages(passportId);
        setPassportPages(pages);
      } catch (error: any) {
        console.error('Failed to load passport pages:', error);
        toast({
          title: "Failed to load pages",
          description: getErrorMessage(error, "Could not load passport pages"),
          variant: "destructive",
        });
      } finally {
        setIsLoadingPages(false);
      }
    };

    loadPassportPages();
  }, [passportId, selectedPassport?.status]);

  useEffect(() => {
    const loadStamps = async () => {
      if (!passportId) return;

      setIsLoadingStamps(true);
      try {
        if (passportPages.length === 0) {
          setStamps([]);
          return;
        }

        const results = await Promise.all(
          passportPages.map((page) => stampsService.getStampsByPage(page.id))
        );

        const flattened = results.flat();
        const sorted = flattened.sort((a, b) => {
          const aDate = a.stamp_date ? Date.parse(a.stamp_date) : 0;
          const bDate = b.stamp_date ? Date.parse(b.stamp_date) : 0;
          return bDate - aDate;
        });

        setStamps(sorted);
      } catch (error: any) {
        console.error("Failed to load stamps:", error);
        toast({
          title: "Failed to load stamps",
          description: getErrorMessage(error, "Could not load detected stamps"),
          variant: "destructive",
        });
        setStamps([]);
      } finally {
        setIsLoadingStamps(false);
      }
    };

    loadStamps();
  }, [passportId, passportPages, toast]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "secondary";
      case "stamps_pending":
        return "default";
      case "stamps_completed":
        return "default";
      case "stamps_failed":
        return "destructive";
      case "stamps_reviewed":
        return "default";
      default:
        return "secondary";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPageStatusConfig = (status: PassportPageStatus) => {
    switch (status) {
      case PassportPageStatus.UPLOADED:
        return {
          label: "Uploaded",
          className: "bg-gray-600 hover:bg-gray-700",
          icon: null,
        };
      case PassportPageStatus.ANALYZING:
        return {
          label: "Analyzing",
          className: "bg-yellow-600 hover:bg-yellow-700",
          icon: <Loader2 className="h-3 w-3 animate-spin mr-1" />,
        };
      case PassportPageStatus.ANALYZED:
        return {
          label: "Analyzed",
          className: "bg-blue-600 hover:bg-blue-700",
          icon: null,
        };
      case PassportPageStatus.VALIDATED:
        return {
          label: "Validated",
          className: "bg-green-600 hover:bg-green-700",
          icon: null,
        };
      case PassportPageStatus.FAILED:
        return {
          label: "Failed",
          className: "bg-red-600 hover:bg-red-700",
          icon: null,
        };
      default:
        return {
          label: "Unknown",
          className: "bg-gray-600 hover:bg-gray-700",
          icon: null,
        };
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Check page limit
    const remainingSlots = MAX_PAGES_PER_PASSPORT - passportPages.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Page limit reached",
        description: `You can only upload up to ${MAX_PAGES_PER_PASSPORT} pages per passport.`,
        variant: "destructive",
      });
      // Reset input
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    // If more files selected than remaining slots, warn user
    if (fileArray.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more page${remainingSlots === 1 ? '' : 's'}. Maximum ${MAX_PAGES_PER_PASSPORT} pages per passport.`,
        variant: "destructive",
      });
      // Reset input
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    // Validate file types
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });


    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }

    // Auto-upload immediately
    if (validFiles.length > 0 && selectedPassport) {
      await handleUpload(validFiles);
    }
  };

  const handleUpload = async (filesToUpload: File[]) => {
    if (!selectedPassport || filesToUpload.length === 0) return;

    setIsUploading(true);
    try {
      const result = await passportService.uploadPassportImages(
        selectedPassport.id,
        filesToUpload
      );

      // Show success message
      toast({
        title: "Upload successful",
        description: `${result.total_uploaded} image(s) uploaded successfully`,
      });

      // Show failed files if any
      if (result.failed_files.length > 0) {
        toast({
          title: "Some files failed",
          description: `Failed to upload: ${result.failed_files.join(", ")}`,
          variant: "destructive",
        });
      }

      // Reload passport data
      const updatedPassport = await passportService.getPassport(selectedPassport.id);
      setSelectedPassport(updatedPassport);

      // Reload passport pages
      const pages = await passportPagesService.getPassportPages(selectedPassport.id);
      setPassportPages(pages);

      // Also update context
      await fetchPassports();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: getErrorMessage(error, "Failed to upload images"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!selectedPassport) return;

    const confirmed = await confirm({
      title: "Delete this passport page?",
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;

    try {
      await passportPagesService.deletePassportPage(pageId);

      toast({
        title: "Page deleted",
        description: "Passport page has been removed",
      });

      // Remove from local state
      setPassportPages((prev) => prev.filter((p) => p.id !== pageId));
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error, "Failed to delete page"),
        variant: "destructive",
      });
    }
  };

  const handleExtractStamps = async () => {
    if (!selectedPassport) return;

    setIsExtractingStamps(true);
    try {
      await passportService.extractStamps(selectedPassport.id);

      // Navigate to stamps page immediately
      navigate(`/documents/${selectedPassport.id}/stamps`);
    } catch (error: any) {
      toast({
        title: "Extraction failed",
        description: getErrorMessage(error, "Failed to start stamp extraction"),
        variant: "destructive",
      });
      setIsExtractingStamps(false);
    }
  };

  const canExtractStamps = passportPages.length > 0 &&
    (selectedPassport?.status === "created" ||
      selectedPassport?.status === "stamps_failed" ||
      selectedPassport?.status === "stamps_completed");

  // Check if there are analyzed but unvalidated pages
  const hasUnvalidatedPages = passportPages.some(page =>
    page.status === PassportPageStatus.ANALYZED
  );

  const handleValidateStamps = () => {
    if (selectedPassport) {
      navigate(`/documents/${selectedPassport.id}/stamps`);
    }
  };

  const getFlagComponent = (countryCode: string | null | undefined, className = "h-6 w-9 rounded shadow-sm") => {
    if (!countryCode) return null;
    const FlagComponent = (flags as Record<string, ComponentType<{ className?: string }>>)[countryCode];
    return FlagComponent ? <FlagComponent className={className} /> : null;
  };

  const formatStampDate = (date: string | null) => {
    if (!date) return "—";
    try {
      return format(parseISO(date), "dd.MM.yyyy");
    } catch {
      return date;
    }
  };

  const formatDirection = (direction: string | null) => {
    if (!direction) return "Unknown";
    return direction.charAt(0).toUpperCase() + direction.slice(1);
  };

  const getDirectionVariant = (direction: string | null) => {
    switch (direction) {
      case "entry":
        return "secondary";
      case "exit":
        return "outline";
      default:
        return "default";
    }
  };

  const getDirectionIcon = (direction: string | null) => {
    if (direction === "entry") {
      return <Download className="h-3 w-3 rotate-90" />;
    }
    if (direction === "exit") {
      return <Upload className="h-3 w-3 rotate-90" />;
    }
    return null;
  };

  const stampsDisplay = useMemo(
    () =>
      stamps.map((stamp) => ({
        id: stamp.id,
        countryName: stamp.country_code ? getCountryName(stamp.country_code) : "Unknown country",
        countryCode: stamp.country_code,
        date: formatStampDate(stamp.stamp_date),
        direction: formatDirection(stamp.direction),
        directionRaw: stamp.direction,
      })),
    [stamps]
  );

  // Redirect to documents page if no passportId
  if (!passportId) {
    return <Navigate to="/documents" replace />;
  }

  if (isLoadingPassport || !selectedPassport) {
    return (
      <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading passport…</p>
          </div>
        </div>
      </div>
    );
  }
  // If passport not found after loading, redirect to documents
  if (!isLoadingPassport && !selectedPassport) {
    return <Navigate to="/documents" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
      <div className="space-y-6">

        {/* Passport Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Passport Information</CardTitle>
            <CardDescription>Basic details about this passport</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Country</p>
                <div className="flex items-center gap-3">
                  {getFlagComponent(selectedPassport.country_code)}
                  <p className="text-lg font-medium">
                    {selectedPassport.country_code
                      ? getCountryName(selectedPassport.country_code)
                      : "Unknown Country"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passport Pages Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Passport Pages</CardTitle>
                <CardDescription className="mt-1">
                  Upload your passport pages and extract travel stamps
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {hasUnvalidatedPages && (
                  <Button
                    onClick={handleValidateStamps}
                    variant="default"
                    className="hidden md:flex"
                  >
                    Validate Stamps
                  </Button>
                )}
                {canExtractStamps && (
                  <Button
                    onClick={handleExtractStamps}
                    disabled={isExtractingStamps}
                    variant={hasUnvalidatedPages ? "outline" : "default"}
                    className="hidden md:flex"
                  >
                    {isExtractingStamps ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      "Extract Stamps"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* File input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {isLoadingPages || isUploading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-3 text-muted-foreground">
                  {isUploading ? "Uploading..." : "Loading pages..."}
                </p>
              </div>
            ) : passportPages.length === 0 ? (
              // Empty state - show when no pages uploaded
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Select passport page images</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Upload clear images of your passport pages containing stamps. Supported
                  formats: JPG, PNG, HEIC. Maximum {MAX_PAGES_PER_PASSPORT} pages per passport.
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || hasReachedPageLimit}
                  title={hasReachedPageLimit ? `Maximum ${MAX_PAGES_PER_PASSPORT} pages allowed` : "Select images to upload"}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Images
                </Button>
              </div>
            ) : (
              // Show uploaded pages
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {passportPages.map((page, index) => (
                    <div
                      key={page.id}
                      className="relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="aspect-[3/4] bg-muted relative">
                        <img
                          src={page.source_url}
                          alt={`Passport page ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-sm font-medium">
                              Page {index + 1}
                            </p>
                            {/* Status Badge */}
                            {(() => {
                              const statusConfig = getPageStatusConfig(page.status);
                              return (
                                <Badge className={`${statusConfig.className} text-xs flex items-center`}>
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || hasReachedPageLimit}
                    variant="outline"
                    className="w-full"
                    title={hasReachedPageLimit ? `Maximum ${MAX_PAGES_PER_PASSPORT} pages allowed` : "Add more pages"}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {hasReachedPageLimit ? `Maximum ${MAX_PAGES_PER_PASSPORT} Pages Reached` : "Add More Pages"}
                  </Button>
                  {hasUnvalidatedPages && (
                    <Button
                      onClick={handleValidateStamps}
                      className="w-full md:hidden"
                    >
                      Validate Stamps
                    </Button>
                  )}
                  {canExtractStamps && (
                    <Button
                      onClick={handleExtractStamps}
                      disabled={isExtractingStamps}
                      variant={hasUnvalidatedPages ? "outline" : "default"}
                      className="w-full md:hidden"
                    >
                      {isExtractingStamps ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        "Extract Stamps"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Detected Stamps Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detected Stamps</CardTitle>
            <CardDescription>Review all entry and exit stamps linked to this passport</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStamps ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex gap-3 p-3 border rounded-lg animate-pulse">
                    <div className="h-10 w-12 rounded bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="h-3 w-32 rounded bg-muted" />
                      <div className="h-6 w-20 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stampsDisplay.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No stamps detected yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Run stamp extraction or add trips manually to populate this list.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableCaption>Detected stamps ordered by most recent date.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[220px]">Country</TableHead>
                        <TableHead className="w-[160px]">Direction</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stampsDisplay.map((stamp) => (
                        <TableRow key={stamp.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-9 flex items-center justify-center">
                                {getFlagComponent(stamp.countryCode, "h-6 w-9 rounded border")}
                              </div>
                              <div>
                                <p className="font-medium">{stamp.countryName}</p>
                                <p className="text-xs text-muted-foreground">{stamp.countryCode ?? "N/A"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[160px]">
                            <Badge
                              variant={getDirectionVariant(stamp.directionRaw)}
                              className="uppercase flex items-center gap-1 w-fit"
                            >
                              {getDirectionIcon(stamp.directionRaw)}
                              {stamp.direction}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{stamp.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden space-y-4">
                  {stampsDisplay.map((stamp) => (
                    <div key={stamp.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-9 flex items-center justify-center">
                            {getFlagComponent(stamp.countryCode, "h-6 w-9 rounded border")}
                          </div>
                          <div>
                            <p className="font-semibold text-base">{stamp.countryName}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              {stamp.countryCode ?? "N/A"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={getDirectionVariant(stamp.directionRaw)}
                          className="uppercase flex items-center gap-1"
                        >
                          {getDirectionIcon(stamp.directionRaw)}
                          {stamp.direction}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{stamp.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Passports;
