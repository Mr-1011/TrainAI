import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePassport } from "@/contexts/PassportContext";
import { CreatePassportDialog } from "@/components/CreatePassportDialog";
import { getCountryName } from "@/lib/countries";
import * as flags from 'country-flag-icons/react/3x2';

const Documents = () => {
  const navigate = useNavigate();
  const { passports, fetchPassports, isLoading } = usePassport();

  const MAX_PASSPORTS = 2;
  const hasReachedLimit = passports.length >= MAX_PASSPORTS;

  useEffect(() => {
    fetchPassports();
  }, [fetchPassports]);

  const getFlagComponent = (countryCode: string | null) => {
    if (!countryCode) return null;
    const FlagComponent = (flags as any)[countryCode];
    return FlagComponent ? <FlagComponent className="h-8 w-12 rounded" /> : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8">
      <div className="space-y-6">

        {/* Passports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Passports</CardTitle>
                <CardDescription className="mt-1">Your registered travel documents</CardDescription>
              </div>
              <CreatePassportDialog
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hasReachedLimit}
                    title={hasReachedLimit ? `Maximum ${MAX_PASSPORTS} passports allowed` : "Add a new passport"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Passport
                  </Button>
                }
                onSuccess={() => fetchPassports()}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-12 w-16 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : passports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No passports yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add your first passport to start tracking your travels
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {passports.map((passport) => (
                  <div
                    key={passport.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/documents/${passport.id}`)}
                  >
                    <div className="h-12 w-16 flex items-center justify-center">
                      {passport.country_code && getFlagComponent(passport.country_code) ? (
                        getFlagComponent(passport.country_code)
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {passport.country_code ? getCountryName(passport.country_code) : "Unknown Country"} Passport
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visa Status */}
        <Card>
          <CardHeader>
            <CardTitle>Visa & Stay Status</CardTitle>
            <CardDescription>Current visa status and remaining allowances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Visa tracking and stay duration monitoring will be available in a future update.
                We'll help you track visa expiration dates and days remaining in each country.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
