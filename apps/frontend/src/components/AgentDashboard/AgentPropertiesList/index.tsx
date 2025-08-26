"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { tsr } from "@/utils/tsr";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function AgentPropertiesList() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
  );
  const router = useRouter();

  // Update URL when page changes
  const updatePage = (newPage: number) => {
    setCurrentPage(newPage);

    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.push(`/agent/properties${newUrl}`, { scroll: false });
  };
  const {
    data: propertiesData,
    isLoading,
    refetch,
  } = tsr.agent.properties.list.useQuery({
    queryKey: ["agent-properties", currentPage],
    queryData: {
      query: { page: currentPage, limit: 10 },
    },
  });

  const { mutate: deleteProperty } = tsr.agent.properties.delete.useMutation({
    onSuccess: () => {
      toast.success("Property deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete property");
    },
  });

  const handleDeleteProperty = (propertyId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone.",
      )
    ) {
      deleteProperty({
        params: { id: propertyId },
      });
    }
  };

  const properties = propertiesData?.body.data || [];
  const meta = propertiesData?.body.meta;

  // Filter properties based on search term
  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Properties</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link href="/agent/properties/new">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search properties by title or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No properties found" : "No properties yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first property listing"}
            </p>
            {!searchTerm && (
              <Link href="/agent/properties/new">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden group">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-blue-400" />
                </div>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 backdrop-blur-sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/agent/properties/${property.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/agent/properties/${property.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {property.title}
                  </CardTitle>
                  <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                    <Badge variant="secondary">
                      ${property.price.toLocaleString()}
                    </Badge>
                    <Badge
                      variant={
                        property.status === "active"
                          ? "default"
                          : property.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {property.status.charAt(0).toUpperCase() +
                        property.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {property.address}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{property.bathrooms}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {property.description}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/agent/properties/${property.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/agent/properties/${property.id}/edit`}>
                    <Button size="sm">Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && !searchTerm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
                {" • "}
                {meta.total} total properties
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePage(currentPage - 1)}
                  disabled={!meta.hasPrev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, meta.totalPages) },
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === meta.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => updatePage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    },
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePage(currentPage + 1)}
                  disabled={!meta.hasNext}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {filteredProperties.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              {searchTerm
                ? `Showing ${filteredProperties.length} of ${properties.length} properties matching "${searchTerm}"`
                : `Showing ${properties.length} properties on page ${meta?.page || 1}`}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
