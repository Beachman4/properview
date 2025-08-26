import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { tsrQueryClient } from "@/utils/tsr";
import Listings from "@/components/Listings";

export const runtime = "edge";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    priceMin: string | null;
    priceMax: string | null;
    bedroomsMin: string | null;
    bedroomsMax: string | null;
    bathroomsMin: string | null;
    bathroomsMax: string | null;
    location: string | null;
    sortBy: string | null;
    sortOrder: string | null;
  }>;
}) {
  const awaitedSearchParams = await searchParams;
  const filters = {
    priceMin: awaitedSearchParams.priceMin
      ? Number(awaitedSearchParams.priceMin)
      : undefined,
    priceMax: awaitedSearchParams.priceMax
      ? Number(awaitedSearchParams.priceMax)
      : undefined,
    bedroomsMin: awaitedSearchParams.bedroomsMin
      ? Number(awaitedSearchParams.bedroomsMin)
      : undefined,
    bedroomsMax: awaitedSearchParams.bedroomsMax
      ? Number(awaitedSearchParams.bedroomsMax)
      : undefined,
    bathroomsMin: awaitedSearchParams.bathroomsMin
      ? Number(awaitedSearchParams.bathroomsMin)
      : undefined,
    bathroomsMax: awaitedSearchParams.bathroomsMax
      ? Number(awaitedSearchParams.bathroomsMax)
      : undefined,
    location: awaitedSearchParams.location || undefined,
    sortBy: awaitedSearchParams.sortBy || "createdAt",
    sortOrder: (awaitedSearchParams.sortOrder as "asc" | "desc") || "desc",
  };
  // Prefetch the first page of properties on the server
  await tsrQueryClient.public.properties.list.prefetchInfiniteQuery({
    queryKey: ["properties", filters],
    // @ts-expect-error - infiniteQuery types are a little messed up with ts rest
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
    initialPageParam: { page: 1, limit: 20 },
  });

  return (
    <HydrationBoundary state={dehydrate(tsrQueryClient)}>
      <Listings />
    </HydrationBoundary>
  );
}
