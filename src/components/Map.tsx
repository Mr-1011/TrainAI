import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MapProps {
  visitedCountries?: string[]; // UN M49 numeric country codes (e.g., "840" for USA, "124" for Canada)
  className?: string;
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const Map = ({ visitedCountries = [], className = "" }: MapProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 0],
    zoom: 1,
  });

  const handleZoomIn = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.5, 4)
    }));
  };

  const handleZoomOut = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.5, 1)
    }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  };

  const handleMoveEnd = (newPosition: { coordinates: [number, number]; zoom: number }) => {
    setPosition(newPosition);
  };

  const renderGeographies = () => (
    <Geographies geography={geoUrl}>
      {({ geographies }) =>
        geographies.map((geo) => {
          // geo.id contains the UN M49 numeric code
          const isVisited = visitedCountries.includes(geo.id);

          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={isVisited ? "hsl(20, 95%, 54%)" : "hsl(0, 0%, 85%)"}
              stroke="hsl(0, 0%, 70%)"
              strokeWidth={0.5}
              style={{
                default: {
                  outline: "none",
                },
                hover: {
                  fill: isVisited ? "hsl(20, 95%, 45%)" : "hsl(0, 0%, 75%)",
                  outline: "none",
                  cursor: "pointer",
                },
                pressed: {
                  outline: "none",
                },
              }}
            />
          );
        })
      }
    </Geographies>
  );

  const renderMap = (isFullscreen = false) => {
    if (isFullscreen) {
      return (
        <ComposableMap projection="geoMercator" className="w-full h-full">
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            translateExtent={[
              [-200, -100],
              [800, 600]
            ]}
            minZoom={1}
            maxZoom={4}
          >
            {renderGeographies()}
          </ZoomableGroup>
        </ComposableMap>
      );
    }

    return (
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 147 * zoom }}
        className="w-full h-full"
      >
        {renderGeographies()}
      </ComposableMap>
    );
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {renderMap()}

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 z-10"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>World Map - Visited Countries</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[calc(90vh-5rem)] overflow-hidden px-6 pb-6">
            <div className="w-full h-full">
              {renderMap(true)}
            </div>
            <div className="absolute top-2 right-8 flex flex-col gap-2 z-50">
              <Button variant="secondary" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={handleResetZoom}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Map;
