import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { tsrQueryClient, tsr } from "@/utils/tsr";
import PropertyDetails from "@/components/PropertyDetails";

export default async function PropertyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const awaitedParams = await params;

  // Prefetch the property details on the server
  await tsrQueryClient.public.properties.get.prefetchQuery({
    queryKey: ["property", awaitedParams.id],
    queryData: {
      params: { id: awaitedParams.id },
    },
  });

  return (
    <HydrationBoundary state={dehydrate(tsrQueryClient)}>
      <PropertyDetails propertyId={awaitedParams.id} />
    </HydrationBoundary>
  );
}
