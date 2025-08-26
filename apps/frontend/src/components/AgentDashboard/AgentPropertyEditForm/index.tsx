"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { tsr } from "@/utils/tsr";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isFetchError } from "@ts-rest/react-query/v5";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AgentPropertyEditFormProps {
  propertyId: string;
}

export default function AgentPropertyEditForm({
  propertyId,
}: AgentPropertyEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    status: "active",
    bathrooms: "",
    description: "",
  });

  const { data: property, isLoading: isLoadingProperty } =
    tsr.agent.properties.get.useQuery({
      queryKey: ["agent-property", propertyId],
      queryData: {
        params: { id: propertyId },
      },
    });

  const { mutate: updateProperty, isPending } =
    tsr.agent.properties.update.useMutation({
      onSuccess: () => {
        toast.success("Property updated successfully!");
        router.push(`/agent/properties/${propertyId}`);
      },
      onError: (error) => {
        if (isFetchError(error)) {
          setError("A network error occurred. Please try again.");
          return;
        }

        if (error.status === 400) {
          if ("bodyResult" in error.body) {
            setError(
              error.body.bodyResult.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join(", "),
            );
          }
        }
      },
    });

  // Populate form when property data loads
  useEffect(() => {
    if (property?.body) {
      const p = property.body;
      setFormData({
        title: p.title,
        address: p.address,
        price: p.price.toString(),
        bedrooms: p.bedrooms.toString(),
        bathrooms: p.bathrooms.toString(),
        description: p.description || "",
        status: p.status,
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (
      !formData.title ||
      !formData.address ||
      !formData.price ||
      !formData.bedrooms ||
      !formData.bathrooms
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate numeric fields
    const price = parseFloat(formData.price);
    const bedrooms = parseInt(formData.bedrooms);
    const bathrooms = parseFloat(formData.bathrooms);

    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (isNaN(bedrooms) || bedrooms < 0) {
      setError("Please enter a valid number of bedrooms");
      return;
    }

    if (isNaN(bathrooms) || bathrooms < 0) {
      setError("Please enter a valid number of bathrooms");
      return;
    }

    updateProperty({
      params: { id: propertyId },
      body: {
        title: formData.title,
        address: formData.address,
        price,
        bedrooms,
        bathrooms,
        description: formData.description,
        status: formData.status as "active" | "pending" | "sold",
      },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoadingProperty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Property not found
            </h3>
            <p className="text-muted-foreground">
              The property you&apos;re trying to edit doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600">Update property information</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Beautiful 3BR Home in Downtown"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="e.g., 123 Main St, City, State 12345"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="e.g., 450000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange("bedrooms", e.target.value)
                  }
                  placeholder="e.g., 3"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange("bathrooms", e.target.value)
                  }
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the property features, amenities, and highlights..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="status">Property Status *</Label>
              <Select
                key={`status-${formData.status}`}
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating Property..." : "Update Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
