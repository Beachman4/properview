"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { tsr } from "@/utils/tsr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDebouncedCallback } from "use-debounce";
import { ClientInferResponses } from "@ts-rest/core";
import { contract } from "@properview/api-contract";
import { List, Map, MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  addressLatitude: number;
  addressLongitude: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  createdAt: Date;
}

interface Filters {
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  bathroomsMax?: number;
  location?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

type ViewMode = "list" | "map";

export default function Listings() {
  const observerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // View mode state (default to list view)
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "list",
  );

  // Initialize filters from URL
  const [filters, setFilters] = useState<Filters>({
    priceMin: searchParams.get("priceMin")
      ? Number(searchParams.get("priceMin"))
      : undefined,
    priceMax: searchParams.get("priceMax")
      ? Number(searchParams.get("priceMax"))
      : undefined,
    bedroomsMin: searchParams.get("bedroomsMin")
      ? Number(searchParams.get("bedroomsMin"))
      : undefined,
    bedroomsMax: searchParams.get("bedroomsMax")
      ? Number(searchParams.get("bedroomsMax"))
      : undefined,
    bathroomsMin: searchParams.get("bathroomsMin")
      ? Number(searchParams.get("bathroomsMin"))
      : undefined,
    bathroomsMax: searchParams.get("bathroomsMax")
      ? Number(searchParams.get("bathroomsMax"))
      : undefined,
    location: searchParams.get("location") || undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  });

  // Update URL when filters or view mode change
  const debouncedUpdateURL = useDebouncedCallback(
    (newFilters: Filters, newViewMode: ViewMode) => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== 0) {
          params.set(key, String(value));
        }
      });

      // Add view mode to URL
      if (newViewMode !== "list") {
        params.set("view", newViewMode);
      }

      router.push(`?${params.toString()}`);
    },
    300,
  );

  useEffect(() => {
    debouncedUpdateURL(filters, viewMode);
  }, [filters, viewMode, debouncedUpdateURL]);

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = tsr.public.properties.list.useInfiniteQuery({
    queryKey: ["properties", filters],
    initialPageParam: { page: 1, limit: 20 },
    getNextPageParam: (
      lastPage: ClientInferResponses<
        typeof contract.public.properties.list,
        200
      >,
      allPages: ClientInferResponses<
        typeof contract.public.properties.list,
        200
      >["body"]["data"][],
    ) => {
      return lastPage.body.data.length >= 20
        ? { limit: 20, page: allPages.length + 1 }
        : undefined;
    },
    queryData: ({ pageParam }: { pageParam: { page: number } }) => ({
      query: {
        page: pageParam?.page ?? 1,
        limit: 20,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        bedroomsMin: filters.bedroomsMin,
        bedroomsMax: filters.bedroomsMax,
        bathroomsMin: filters.bathroomsMin,
        bathroomsMax: filters.bathroomsMax,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        location: filters.location,
      },
    }),
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "100px",
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Error loading properties
          </h3>
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  const allProperties = data?.pages.flatMap((page) => page.body.data) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* E-commerce Style Sidebar */}
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          totalProperties={data?.pages[0]?.body.meta.total || 0}
        />

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Properties</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {data?.pages[0]?.body.meta.total || 0} properties found
              </span>

              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("list")}
                  className="px-3"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("map")}
                  className="px-3"
                >
                  <Map className="w-4 h-4 mr-1" />
                  Map
                </Button>
              </div>

              <SortSelector filters={filters} setFilters={setFilters} />
            </div>
          </div>

          {/* Conditional Content Based on View Mode */}
          {viewMode === "list" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allProperties.map((property: Property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}

                {/* Loading skeletons for next page */}
                {isFetchingNextPage && (
                  <>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <PropertyCardSkeleton key={`skeleton-${index}`} />
                    ))}
                  </>
                )}

                {/* Observer element for infinite scroll */}
                <div ref={observerRef} className="col-span-full h-4" />
              </div>

              {/* Loading state for initial load */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <PropertyCardSkeleton key={`initial-skeleton-${index}`} />
                  ))}
                </div>
              )}

              {/* No more properties message */}
              {!hasNextPage && allProperties.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No more properties to load
                  </p>
                </div>
              )}
            </>
          ) : (
            <MapView properties={allProperties} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {property.title}
            </CardTitle>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              ${property.price.toLocaleString()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {property.address}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{property.bedrooms}</span>
              <span className="text-xs text-muted-foreground">bed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{property.bathrooms}</span>
              <span className="text-xs text-muted-foreground">bath</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {property.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSidebar({
  filters,
  setFilters,
  totalProperties,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  totalProperties: number;
}) {
  const [locationValue, setLocationValue] = useState(filters.location || "");
  const [priceRange, setPriceRange] = useState([
    filters.priceMin || 0,
    filters.priceMax || 1000000,
  ]);

  const debouncedLocationChange = useDebouncedCallback((location: string) => {
    setFilters((prev) => ({ ...prev, location: location || undefined }));
  }, 500);

  const debouncedPriceChange = useDebouncedCallback((range: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceMin: range[0] > 0 ? range[0] : undefined,
      priceMax: range[1] < 1000000 ? range[1] : undefined,
    }));
  }, 300);

  useEffect(() => {
    debouncedLocationChange(locationValue);
  }, [locationValue, debouncedLocationChange]);

  useEffect(() => {
    debouncedPriceChange(priceRange);
  }, [priceRange, debouncedPriceChange]);

  const handleFilterChange = (
    key: keyof Filters,
    value: string | number | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setLocationValue("");
    setPriceRange([0, 1000000]);
    setFilters({
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const bedroomOptions = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
    { value: "5", label: "5+" },
  ];

  const bathroomOptions = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ];

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white border rounded-lg p-6 sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>

        {/* Location Search */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Location</Label>
          <Input
            placeholder="Enter city, zip, or address"
            value={locationValue}
            onChange={(e) => setLocationValue(e.target.value)}
          />
        </div>

        <Separator className="my-6" />

        {/* Price Range */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1000000}
              min={0}
              step={10000}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bedrooms */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Bedrooms</Label>
          <div className="grid grid-cols-3 gap-2">
            {bedroomOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  String(filters.bedroomsMin || "") === option.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  handleFilterChange(
                    "bedroomsMin",
                    option.value ? Number(option.value) : undefined,
                  )
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bathrooms */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Bathrooms</Label>
          <div className="grid grid-cols-3 gap-2">
            {bathroomOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  String(filters.bathroomsMin || "") === option.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  handleFilterChange(
                    "bathroomsMin",
                    option.value ? Number(option.value) : undefined,
                  )
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Results count */}
        <div className="text-center text-sm text-muted-foreground">
          {totalProperties} properties found
        </div>
      </div>
    </div>
  );
}

function SortSelector({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    }));
  };

  const currentSort = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="createdAt-desc">Newest First</SelectItem>
        <SelectItem value="createdAt-asc">Oldest First</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="bedrooms-desc">Most Bedrooms</SelectItem>
        <SelectItem value="bedrooms-asc">Fewest Bedrooms</SelectItem>
      </SelectContent>
    </Select>
  );
}

function MapView({
  properties,
  isLoading,
}: {
  properties: Property[];
  isLoading: boolean;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || properties.length === 0)
      return;

    // Calculate center point from all properties
    const centerLat =
      properties.reduce((sum, p) => sum + p.addressLatitude, 0) /
      properties.length;
    const centerLng =
      properties.reduce((sum, p) => sum + p.addressLongitude, 0) /
      properties.length;

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: 12,
      attributionControl: false,
    });

    // Add markers for each property
    properties.forEach((property) => {
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `
        <div class="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
          $${(property.price / 1000).toFixed(0)}K
        </div>
      `;

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([property.addressLongitude, property.addressLatitude])
        .addTo(mapRef.current!);

      // Create popup with property info
      const popup = new mapboxgl.Popup({
        offset: 25,
        className: "property-popup",
      }).setHTML(`
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-sm mb-1 line-clamp-2">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-2 line-clamp-1">${property.address}</p>
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-primary">$${property.price.toLocaleString()}</span>
            <div class="flex gap-2 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                ${property.bedrooms}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                ${property.bathrooms}
              </span>
            </div>
          </div>
          <a href="/properties/${property.id}" class="inline-block w-full text-center bg-primary text-primary-foreground text-xs py-1 px-2 rounded hover:bg-primary/90 transition-colors">
            View Details
          </a>
        </div>
      `);

      marker.setPopup(popup);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (properties.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach((property) => {
        bounds.extend([property.addressLongitude, property.addressLatitude]);
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [properties]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            No properties to display on map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="w-full h-[600px] rounded-lg overflow-hidden border"
      />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
        <p className="text-sm font-medium">
          {properties.length} properties shown
        </p>
      </div>
    </div>
  );
}
