'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Mail,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Building
} from 'lucide-react'
import { tsr } from '@/utils/tsr'

export default function AgentInquiriesList() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: inquiriesData, isLoading } = tsr.agent.inquiries.list.useQuery({
    queryKey: ['agent-inquiries-all', currentPage],
    queryData: {
      query: { page: currentPage, limit: 20 }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Inquiries</h1>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const inquiries = inquiriesData?.body
  const hasInquiries = inquiries?.data && inquiries.data.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Inquiries</h1>
          <p className="text-gray-600">
            Manage customer inquiries across all properties
          </p>
        </div>
        {hasInquiries && (
          <Badge variant="secondary" className="text-base px-3 py-1">
            {inquiries.meta.total} total inquiries
          </Badge>
        )}
      </div>

      {/* Inquiries List */}
      {!hasInquiries ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No inquiries yet
            </h3>
            <p className="text-gray-600 mb-4">
              Customer inquiries will appear here when they're interested in your properties.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiriesData?.body.data.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(inquiry.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    New Inquiry
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${inquiry.email}`}
                      className="text-primary hover:underline text-sm"
                    >
                      {inquiry.email}
                    </a>
                  </div>
                  {inquiry.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`tel:${inquiry.phone}`}
                        className="text-primary hover:underline text-sm"
                      >
                        {inquiry.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Message */}
                {inquiry.message && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      "{inquiry.message}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>Property inquiry</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {inquiries.meta.totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {inquiries.meta.page} of {inquiries.meta.totalPages}
                    {' • '}
                    {inquiries.meta.total} total inquiries
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!inquiries.meta.hasPrev}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, inquiries.meta.totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={page === inquiries.meta.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
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
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!inquiries.meta.hasNext}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
