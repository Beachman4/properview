'use client'

import { useEffect, useRef, useCallback } from 'react'
import { tsr } from "@/utils/tsr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientInferResponses } from '@ts-rest/core'
import { contract } from '@properview/api-contract'

interface Property {
  id: string
  title: string
  price: number
  address: string
  bedrooms: number
  bathrooms: number
  description: string
  createdAt: Date
}

export default function Listings() {
  const observerRef = useRef<HTMLDivElement>(null)
  
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = tsr.public.properties.list.useInfiniteQuery({
    queryKey: ['properties'],
    initialPageParam: { page: 1, limit: 10 },
    getNextPageParam: (lastPage: ClientInferResponses<typeof contract.public.properties.list, 200>, allPages: ClientInferResponses<typeof contract.public.properties.list, 200>['body']['data'][]) => {
      return lastPage.body.data.length >= 10
          ? {limit: 10, page: allPages.length + 1}
          : undefined;
    },
    queryData: ({ pageParam }: { pageParam: { page: number } }) => ({
        query: {
            page: pageParam?.page ?? 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }
    }),
  })

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    const element = observerRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '100px'
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error loading properties</h3>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  const allProperties = data?.pages.flatMap(page => page.body.data) ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <PropertyCardSkeleton key={`initial-skeleton-${index}`} />
          ))}
        </div>
      )}
      
      {/* No more properties message */}
      {!hasNextPage && allProperties.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No more properties to load</p>
        </div>
      )}
    </div>
  )
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
  )
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
  )
}