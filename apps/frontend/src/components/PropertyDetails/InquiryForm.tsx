import { useState } from "react";
import { tsr } from "@/utils/tsr";
import { isFetchError } from "@ts-rest/react-query/v5";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function InquiryForm({
  propertyId,
  onClose,
  onSuccess,
}: {
  propertyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const { mutate: submitInquiry, isPending } =
    tsr.public.properties.submitInquiry.useMutation({
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        if (isFetchError(error)) {
          setError("A network error has occurred");

          return;
        }
        if (error.status === 400) {
          const body = error.body;

          // zod validation error
          if ("bodyResult" in body) {
            const validationErrors = body.bodyResult.issues;

            if (validationErrors) {
              setError(
                validationErrors
                  .map((error: { message: string }) => error.message)
                  .join(", "),
              );
            }
          }
        }
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation with specific error messages
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    submitInquiry({
      body: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        propertyId: propertyId,
      },
    });
  };

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="(555) 123-4567"
            required
          />
        </div>

        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            placeholder="Any additional questions or comments..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </>
  );
}
