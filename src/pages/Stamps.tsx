import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Plus, AlertCircle, ZoomIn, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { passportService } from "@/services/passport.service";
import { passportPagesService } from "@/services/passport-pages.service";
import { stampsService } from "@/services/stamps.service";
import { useToast } from "@/hooks/use-toast";
import type { Passport, PassportPage, Stamp, Direction } from "@/types/passport";
import { PassportPageStatus } from "@/types/passport";
import { getCountryName } from "@/lib/countries";
import StampCard from "@/components/StampCard";

interface PageStamps {
  page: PassportPage;
  stamps: Stamp[];
}

const Stamps = () => {
  const { passportId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const [passport, setPassport] = useState<Passport | null>(null);
  const [isLoadingPassport, setIsLoadingPassport] = useState(true);
  const [allPageStamps, setAllPageStamps] = useState<PageStamps[]>([]);
  const [isLoadingStamps, setIsLoadingStamps] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [modifiedStamps, setModifiedStamps] = useState<Map<string, Partial<Stamp>>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [newStamps, setNewStamps] = useState<Map<string, Partial<Stamp>>>(new Map());
  const [nextTempId, setNextTempId] = useState(1);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);

  // Fetch passport
  useEffect(() => {
    const loadPassport = async () => {
      if (!passportId) return;

      setIsLoadingPassport(true);
      try {
        const passportData = await passportService.getPassport(passportId);
        setPassport(passportData);
      } catch (error: any) {
        console.error('Failed to load passport:', error);
        toast({
          title: "Failed to load passport",
          description: getErrorMessage(error, "Could not load passport data"),
          variant: "destructive",
        });
      } finally {
        setIsLoadingPassport(false);
      }
    };

    loadPassport();
  }, [passportId]);

  // Poll for stamp extraction completion
  useEffect(() => {
    if (!passport || !passportId) return;

    if (passport.status === "stamps_pending") {
      const interval = setInterval(async () => {
        try {
          const updatedPassport = await passportService.getPassport(passportId);
          setPassport(updatedPassport);

          if (updatedPassport.status === "stamps_completed") {
            // Load stamps once completed
            await loadAllStamps();
            clearInterval(interval);
          } else if (updatedPassport.status === "stamps_failed") {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    } else if (passport.status === "stamps_completed") {
      // Load stamps immediately if already completed
      loadAllStamps();
    }
  }, [passport?.status, passportId]);

  // Poll for page status updates (analyzing -> analyzed)
  useEffect(() => {
    if (!passportId || passport?.status !== "stamps_completed") return;

    const pollPages = async () => {
      const hasAnalyzingPages = await loadAllStamps(false); // Don't show loading spinner

      // Continue polling if there are still analyzing pages
      if (!hasAnalyzingPages) {
        clearInterval(interval);
      }
    };

    // Start polling every 10 seconds
    const interval = setInterval(pollPages, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [passportId, passport?.status]);

  // Load all stamps for all pages (only unvalidated pages)
  const loadAllStamps = async (showLoadingSpinner = true) => {
    if (!passportId) return;

    if (showLoadingSpinner) {
      setIsLoadingStamps(true);
    }

    try {
      const pages = await passportPagesService.getPassportPages(passportId);

      // Filter to only show pages that are analyzed but not yet validated
      const unvalidatedPages = pages.filter(page =>
        page.status === PassportPageStatus.ANALYZED
      );

      const stampsPromises = unvalidatedPages.map(async (page) => ({
        page,
        stamps: await stampsService.getStampsByPage(page.id),
      }));

      const results = await Promise.all(stampsPromises);
      setAllPageStamps(results);

      // Return whether there are any analyzing pages (for polling decision)
      return pages.some(page => page.status === PassportPageStatus.ANALYZING);
    } catch (error: any) {
      console.error('Failed to load stamps:', error);
      toast({
        title: "Failed to load stamps",
        description: getErrorMessage(error, "Could not load stamp data"),
        variant: "destructive",
      });
      return false;
    } finally {
      if (showLoadingSpinner) {
        setIsLoadingStamps(false);
      }
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentPageIndex < allPageStamps.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      // All pages viewed, navigate to passport documents page
      navigate(`/documents/${passportId}`);
      toast({
        title: "All pages verified!",
        description: "You've reviewed all passport pages",
      });
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };


  const handleVerifyAndNext = async () => {
    const currentPageData = allPageStamps[currentPageIndex];

    if (!currentPageData?.page) return;

    setIsSaving(true);

    try {
      const currentPageStamps = currentPageData.stamps;

      // Create new stamps
      const newStampsToCreate = currentPageStamps
        .filter(stamp => newStamps.has(stamp.id))
        .map(stamp => {
          const stampData = newStamps.get(stamp.id)!;
          return stampsService.createStamp(currentPageData.page.id, {
            country_code: stampData.country_code || stamp.country_code || "",
            stamp_date: stampData.stamp_date || stamp.stamp_date || "",
            direction: (stampData.direction || stamp.direction || "entry") as Direction,
          });
        });

      // Update existing modified stamps
      const updatePromises = currentPageStamps
        .filter(stamp => !newStamps.has(stamp.id) && modifiedStamps.has(stamp.id))
        .map(stamp => {
          const updates = modifiedStamps.get(stamp.id)!;
          return stampsService.updateStamp(stamp.id, {
            country_code: updates.country_code ?? stamp.country_code,
            direction: updates.direction ?? stamp.direction,
            stamp_date: updates.stamp_date ?? stamp.stamp_date,
          });
        });

      const allSavePromises = [...newStampsToCreate, ...updatePromises];

      if (allSavePromises.length > 0) {
        await Promise.all(allSavePromises);

        // Reload stamps for the current page to get real IDs for new stamps
        const updatedStamps = await stampsService.getStampsByPage(currentPageData.page.id);

        setAllPageStamps(prev =>
          prev.map((ps, idx) =>
            idx === currentPageIndex
              ? { ...ps, stamps: updatedStamps }
              : ps
          )
        );

        // Clear modifications and new stamps for current page
        setModifiedStamps(prev => {
          const next = new Map(prev);
          currentPageStamps.forEach(stamp => next.delete(stamp.id));
          return next;
        });

        setNewStamps(prev => {
          const next = new Map(prev);
          currentPageStamps.forEach(stamp => next.delete(stamp.id));
          return next;
        });

        const createdCount = newStampsToCreate.length;
        const updatedCount = updatePromises.length;
        const message = [];
        if (createdCount > 0) message.push(`${createdCount} created`);
        if (updatedCount > 0) message.push(`${updatedCount} updated`);

        toast({
          title: "Changes saved",
          description: message.join(", "),
        });
      }

      // Mark current page as validated
      await passportPagesService.validatePassportPage(currentPageData.page.id);

      // Update local state
      setAllPageStamps(prev =>
        prev.map((ps, idx) =>
          idx === currentPageIndex
            ? { ...ps, page: { ...ps.page, status: PassportPageStatus.VALIDATED } }
            : ps
        )
      );

      toast({
        title: "Page verified",
        description: "Moving to next page",
      });

      handleNext();
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: getErrorMessage(error, "Failed to save changes"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetryExtraction = async () => {
    if (!passport) return;

    try {
      await passportService.extractStamps(passport.id);
      const updatedPassport = await passportService.getPassport(passport.id);
      setPassport(updatedPassport);

      toast({
        title: "Extraction restarted",
        description: "Attempting to extract stamps again",
      });
    } catch (error: any) {
      toast({
        title: "Failed to restart extraction",
        description: getErrorMessage(error, "Could not restart extraction"),
        variant: "destructive",
      });
    }
  };

  const handleAddStamp = () => {
    const currentPageData = allPageStamps[currentPageIndex];
    if (!currentPageData?.page) return;

    // Create a temporary ID for the new stamp
    const tempId = `temp-${nextTempId}`;
    setNextTempId(nextTempId + 1);

    // Create new stamp with default values
    const newStamp: Stamp = {
      id: tempId,
      passport_id: passportId!,
      passport_page_id: currentPageData.page.id,
      country_code: null,
      stamp_date: null,
      direction: "entry" as Direction,
      confidence: null,
    };

    // Add to new stamps map
    setNewStamps(prev => {
      const next = new Map(prev);
      next.set(tempId, newStamp);
      return next;
    });

    // Add to UI immediately
    setAllPageStamps(prev =>
      prev.map((ps, idx) =>
        idx === currentPageIndex
          ? { ...ps, stamps: [...ps.stamps, newStamp] }
          : ps
      )
    );
  };

  const handleStampChange = (stampId: string, updates: Partial<Stamp>) => {
    // Check if this is a new stamp
    if (newStamps.has(stampId)) {
      setNewStamps(prev => {
        const next = new Map(prev);
        const existing = next.get(stampId) || {};
        next.set(stampId, { ...existing, ...updates });
        return next;
      });
    } else {
      // Track changes for existing stamps
      setModifiedStamps(prev => {
        const next = new Map(prev);
        const existing = next.get(stampId) || {};
        next.set(stampId, { ...existing, ...updates });
        return next;
      });
    }

    // Update the UI immediately with the changes
    setAllPageStamps(prev =>
      prev.map(ps => ({
        ...ps,
        stamps: ps.stamps.map(stamp =>
          stamp.id === stampId ? { ...stamp, ...updates } : stamp
        )
      }))
    );
  };

  const handleDeleteStamp = async (stampId: string) => {
    // Check if this is a new stamp (not saved yet)
    if (newStamps.has(stampId)) {
      // Just remove from local state
      setNewStamps(prev => {
        const next = new Map(prev);
        next.delete(stampId);
        return next;
      });

      setAllPageStamps(prev =>
        prev.map(ps => ({
          ...ps,
          stamps: ps.stamps.filter(s => s.id !== stampId)
        }))
      );

      toast({
        title: "Stamp removed",
        description: "The unsaved stamp has been removed",
      });
      return;
    }

    // For existing stamps, delete from server
    try {
      await stampsService.deleteStamp(stampId);

      // Update local state
      setAllPageStamps(prev =>
        prev.map(ps => ({
          ...ps,
          stamps: ps.stamps.filter(s => s.id !== stampId)
        }))
      );

      // Also remove from modified stamps if it was modified
      setModifiedStamps(prev => {
        const next = new Map(prev);
        next.delete(stampId);
        return next;
      });

      toast({
        title: "Stamp deleted",
        description: "The stamp has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error, "Failed to delete stamp"),
        variant: "destructive",
      });
    }
  };

  // Redirect if no passportId
  if (!passportId) {
    return <Navigate to="/documents" replace />;
  }

  // Loading passport
  if (isLoadingPassport) {
    return (
      <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading passport...</p>
          </div>
        </div>
      </div>
    );
  }

  // Passport not found
  if (!passport) {
    return <Navigate to="/documents" replace />;
  }

  // Extraction pending
  if (passport.status === "stamps_pending") {
    return (
      <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-semibold mb-2">Extracting stamps...</h2>
                <p className="text-muted-foreground">
                  This may take a few moments. We're analyzing your passport pages.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extraction failed
  if (passport.status === "stamps_failed") {
    return (
      <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Extraction Failed</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't extract stamps from your passport. Please try again.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => navigate(`/documents/${passportId}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pages
                  </Button>
                  <Button onClick={handleRetryExtraction}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading stamps
  if (isLoadingStamps || allPageStamps.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading stamps...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPageData = allPageStamps[currentPageIndex];
  const totalPages = allPageStamps.length;

  // No unvalidated pages left, redirect back to passport documents
  if (!isLoadingStamps && totalPages === 0) {
    return <Navigate to={`/documents/${passportId}`} replace />;
  }

  // No stamps found on current page
  const hasNoStamps = !currentPageData || currentPageData.stamps.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Passport Page Image */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Passport Page {currentPageIndex + 1} of {totalPages}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {currentPageData?.page && (
                <div
                  className="aspect-[3/4] bg-muted rounded-lg overflow-hidden relative group cursor-pointer"
                  onClick={() => setImageZoomOpen(true)}
                >
                  <img
                    src={currentPageData.page.source_url}
                    alt={`Passport page ${currentPageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Stamps List - Scrollable */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detected Stamps</CardTitle>
                  <CardDescription>
                    {hasNoStamps
                      ? "No stamps detected on this page"
                      : `${currentPageData.stamps.length} stamp(s) found`}
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={handleAddStamp}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stamp
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              {hasNoStamps ? (
                <div className="text-center py-8 text-muted-foreground px-6">
                  <p className="mb-4">No stamps were detected on this page.</p>
                  <Button variant="outline" size="sm" onClick={handleAddStamp}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Manually
                  </Button>
                </div>
              ) : (
                <div className="h-[700px] overflow-y-auto px-6 py-2">
                  <div className="flex flex-col gap-3">
                    {currentPageData.stamps.map((stamp) => (
                      <StampCard
                        key={stamp.id}
                        stamp={stamp}
                        onChange={handleStampChange}
                        onDelete={handleDeleteStamp}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPageIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button onClick={handleVerifyAndNext} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {currentPageIndex === totalPages - 1 ? "Finish" : "Verify & Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-6">
          {currentPageData?.page && (
            <div className="relative max-h-[85vh] flex items-center justify-center">
              <img
                src={currentPageData.page.source_url}
                alt={`Passport page ${currentPageIndex + 1}`}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stamps;
