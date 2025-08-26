"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { tsr } from "@/utils/tsr";
import { toast } from "sonner";

export default function AgentPropertyCreateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
  });

  const { mutate: createProperty, isPending } =
    tsr.agent.properties.create.useMutation({
      onSuccess: (data) => {
        toast.success("Property created successfully!");
        router.push(`/agent/properties/${data.body.id}`);
      },
      onError: (error) => {
        toast.error("Failed to create property. Please try again.");
        console.error("Error creating property:", error);
      },
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.address ||
      !formData.price ||
      !formData.bedrooms ||
      !formData.bathrooms
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate numeric fields
    const price = parseFloat(formData.price);
    const bedrooms = parseInt(formData.bedrooms);
    const bathrooms = parseInt(formData.bathrooms);

    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (isNaN(bedrooms) || bedrooms < 0) {
      toast.error("Please enter a valid number of bedrooms");
      return;
    }

    if (isNaN(bathrooms) || bathrooms < 0) {
      toast.error("Please enter a valid number of bathrooms");
      return;
    }

    createProperty({
      body: {
        title: formData.title,
        address: formData.address,
        price,
        bedrooms,
        bathrooms,
        description: formData.description || "",
      },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600">Create a new property listing</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
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
                {isPending ? "Creating Property..." : "Create Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
