'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tsr } from '@/utils/tsr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Bed, Bath, MapPin, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import mapboxgl from 'mapbox-gl'

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface PropertyDetailsProps {
  propertyId: string
}

export default function PropertyDetails({ propertyId }: PropertyDetailsProps) {
  const router = useRouter()
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  
  // Fetch property details
  const { data: property, isLoading, error } = tsr.public.properties.get.useQuery({
    queryKey: ['property', propertyId],
    queryData: {
      params: { id: propertyId }
    }
  })

  tsr.public.properties.view.useQuery({
    queryKey: [],
    queryData: {
      params: { id: propertyId }
    }
  })

  // Initialize map when property data is available
  useEffect(() => {
    if (!property?.body || !mapContainerRef.current || mapRef.current) return

    const propertyData = property.body
    
    // Use the property's actual coordinates
    const lat = propertyData.addressLatitude
    const lng = propertyData.addressLongitude
    
    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 15,
      attributionControl: false
    })

    // Add marker
    markerRef.current = new mapboxgl.Marker({
      color: '#3b82f6' // Primary blue color
    })
      .setLngLat([lng, lat])
      .addTo(mapRef.current)

    // Add popup
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${propertyData.title}</h3>
          <p class="text-sm text-gray-600">${propertyData.address}</p>
          <p class="text-sm font-medium">$${propertyData.price.toLocaleString()}</p>
        </div>
      `)

    markerRef.current.setPopup(popup)

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [property])



  if (isLoading) {
    return <PropertyDetailsSkeleton />
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Property not found</h3>
            <p className="text-sm text-muted-foreground mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/')}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  const propertyData = property.body

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Properties
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Property Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{propertyData.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{propertyData.address}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                ${propertyData.price.toLocaleString()}
              </Badge>
              <Badge 
                variant={
                  propertyData.status === 'active' ? 'default' : 
                  propertyData.status === 'pending' ? 'secondary' : 
                  'destructive'
                }
                className="text-sm px-3 py-1"
              >
                {propertyData.status.charAt(0).toUpperCase() + propertyData.status.slice(1)}
              </Badge>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{propertyData.bedrooms} bed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{propertyData.bathrooms} bath</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Listed {new Date(propertyData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About This Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {propertyData.description}
              </p>
            </CardContent>
          </Card>

          {/* Property Features */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Property Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{propertyData.bedrooms}</div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">{propertyData.bathrooms}</div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">Prime</div>
                  <div className="text-sm text-muted-foreground">Location</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{propertyData.address}</span>
                </div>
                <div 
                  ref={mapContainerRef}
                  className="w-full h-80 rounded-lg overflow-hidden border"
                  style={{ minHeight: '320px' }}
                />
                <div className="text-xs text-muted-foreground">
                  Click the marker to see property details
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Interested in this property?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">${propertyData.price.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Asking Price</div>
                </div>
                
                <Separator />
                
                {!isInquiryOpen ? (
                  <Button 
                    className="w-full hover:cursor-pointer" 
                    size="lg"
                    onClick={() => setIsInquiryOpen(true)}
                  >
                    Submit Inquiry
                  </Button>
                ) : (
                  <InquiryForm 
                    propertyId={propertyId} 
                    onClose={() => setIsInquiryOpen(false)}
                    onSuccess={() => {
                      setIsInquiryOpen(false)
                      toast.success('Inquiry submitted successfully!')
                    }}
                  />
                )}
                
                <div className="text-xs text-muted-foreground text-center">
                  By submitting an inquiry, you agree to be contacted about this property.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InquiryForm({ 
  propertyId, 
  onClose, 
  onSuccess 
}: { 
  propertyId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  
  const { mutate: submitInquiry, isPending } = tsr.public.properties.submitInquiry.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to submit inquiry. Please try again.')
      console.error('Inquiry submission error:', error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    submitInquiry({
      body: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        propertyId: propertyId
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="(555) 123-4567"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isPending}
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  )
}

function PropertyDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center p-4 bg-muted rounded-lg">
                    <div className="h-6 w-6 bg-muted-foreground/20 rounded mx-auto mb-2"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded mb-1"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-80 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
