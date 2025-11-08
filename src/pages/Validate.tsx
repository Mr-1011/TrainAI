import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ZoomIn, ZoomOut, RotateCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Validate = () => {
  const { passportId, pageIndex } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(pageIndex || "0");
  const totalPages = 5; // Mock total pages

  const [stamps, setStamps] = useState([
    {
      id: 1,
      country: "",
      confidence: 82,
      direction: "entry",
      date: undefined as Date | undefined,
      saved: false,
    },
  ]);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      navigate(`/validate/${passportId}/${currentPage - 1}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      navigate(`/validate/${passportId}/${currentPage + 1}`);
    }
  };

  const handleRemoveStamp = (id: number) => {
    setStamps(stamps.filter((stamp) => stamp.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-2 -ml-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
          <h1 className="text-3xl font-semibold">Validate stamps</h1>
          <p className="text-muted-foreground">Page {currentPage + 1}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 0}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Image Viewer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Page {currentPage + 1} of {totalPages}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Passport page image</p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Editable Stamps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detected stamps</CardTitle>
              <Button variant="outline" size="sm">
                Mark all as correct
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {stamps.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No stamps detected on this page</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stamps.map((stamp) => (
                    <Card key={stamp.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏴</span>
                            <span className="font-medium">
                              {stamp.country || "Unknown country"}
                            </span>
                            <Badge variant="secondary">{stamp.confidence}%</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStamp(stamp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`country-${stamp.id}`}>Country *</Label>
                          <Input
                            id={`country-${stamp.id}`}
                            placeholder="Search country..."
                            value={stamp.country}
                            onChange={(e) => {
                              const updated = stamps.map((s) =>
                                s.id === stamp.id ? { ...s, country: e.target.value } : s
                              );
                              setStamps(updated);
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Direction *</Label>
                          <RadioGroup
                            value={stamp.direction}
                            onValueChange={(value) => {
                              const updated = stamps.map((s) =>
                                s.id === stamp.id ? { ...s, direction: value } : s
                              );
                              setStamps(updated);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="entry" id={`entry-${stamp.id}`} />
                              <Label htmlFor={`entry-${stamp.id}`}>Entry</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="exit" id={`exit-${stamp.id}`} />
                              <Label htmlFor={`exit-${stamp.id}`}>Exit</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !stamp.date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {stamp.date ? format(stamp.date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={stamp.date}
                                onSelect={(date) => {
                                  const updated = stamps.map((s) =>
                                    s.id === stamp.id ? { ...s, date } : s
                                  );
                                  setStamps(updated);
                                }}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" className="flex-1">
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="mt-4 flex gap-2">
              <Button onClick={handleNextPage} className="flex-1">
                Save and next page
              </Button>
              <Button variant="outline">Save draft</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Validate;
