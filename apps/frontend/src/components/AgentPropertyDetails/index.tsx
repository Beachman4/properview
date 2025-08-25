'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Bed, 
  Bath, 
  Calendar,
  Mail,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react'
import { tsr } from '@/utils/tsr'
import { toast } from 'sonner'
import Link from 'next/link'
import { useContextBack } from '@/hooks/use-context-back'

interface AgentPropertyDetailsProps {
  propertyId: string
}

export default function AgentPropertyDetails({ propertyId }: AgentPropertyDetailsProps) {
  const router = useRouter()
  const { goBack, backText } = useContextBack()
  
  const { data: property, isLoading, error } = tsr.agent.properties.get.useQuery({
    queryKey: ['agent-property', propertyId],
    queryData: {
      params: { id: propertyId }
    }
  })

  const { mutate: deleteProperty } = tsr.agent.properties.delete.useMutation({
    onSuccess: () => {
      toast.success('Property deleted successfully')
      router.push('/agent/properties')
    },
    onError: () => {
      toast.error('Failed to delete property')
    }
  })

  const handleDeleteProperty = () => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      deleteProperty({
        params: { id: propertyId }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backText}
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-destructive mb-2">Property not found</h3>
            <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const propertyData = property.body

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backText}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{propertyData.title}</h1>
            <p className="text-gray-600 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {propertyData.address}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/agent/properties/${propertyData.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href={`/properties/${propertyData.id}`} target="_blank">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Public Listing
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteProperty}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Property Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  ${propertyData.price.toLocaleString()}
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
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {propertyData.description || 'No description provided.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Inquiries */}
          <InquiriesSection propertyId={propertyData.id} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">

          {/* Property Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Property Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="text-sm font-medium">{propertyData.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Inquiries</span>
                  <span className="text-sm font-medium">{propertyData.inquiries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="text-sm font-medium">{(propertyData.conversionRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days on Market</span>
                  <span className="text-sm font-medium">
                    {Math.floor((Date.now() - new Date(propertyData.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InquiriesSection({ propertyId }: { propertyId: string }) {
  const [inquiriesPage, setInquiriesPage] = useState(1)

  const { data: inquiries, isLoading: inquiriesLoading } = tsr.agent.inquiries.list.useQuery({
    queryKey: ['agent-inquiries', propertyId, inquiriesPage],
    queryData: {
      query: { propertyId, page: inquiriesPage, limit: 10 }
    }
  })

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }

  if (inquiriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const inquiriesData = inquiries?.body
  const hasInquiries = inquiriesData?.data && inquiriesData.data.length > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Property Inquiries</CardTitle>
        {hasInquiries && (
          <Badge variant="secondary">
            {inquiriesData.meta.total} total
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!hasInquiries ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm mb-1">No inquiries yet</h3>
            <p className="text-xs text-muted-foreground">
              Inquiries will appear here when customers are interested in this property.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Inquiries List */}
            <div className="space-y-3">
              {inquiriesData.data.map((inquiry) => (
                <div key={inquiry.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{inquiry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(inquiry.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${inquiry.email}`}
                        className="text-primary hover:underline"
                      >
                        {inquiry.email}
                      </a>
                    </div>
                    {inquiry.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={`tel:${inquiry.phone}`}
                          className="text-primary hover:underline"
                        >
                          {inquiry.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {inquiry.message && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm text-muted-foreground italic">
                        "{inquiry.message}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {inquiriesData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {inquiriesData.meta.page} of {inquiriesData.meta.totalPages}
                  {' • '}
                  {inquiriesData.meta.total} total inquiries
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInquiriesPage(inquiriesPage - 1)}
                    disabled={!inquiriesData.meta.hasPrev}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, inquiriesData.meta.totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={page === inquiriesData.meta.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setInquiriesPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInquiriesPage(inquiriesPage + 1)}
                    disabled={!inquiriesData.meta.hasNext}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
