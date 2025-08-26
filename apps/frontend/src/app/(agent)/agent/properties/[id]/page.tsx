import AgentPropertyDetails from "@/components/AgentDashboard/AgentPropertyDetails";
import { rQQueryClient, tsrQueryClient } from "@/utils/tsr";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";

type Params = Promise<{ id: string }>;

export default async function PropertyDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get("jwtToken")?.value;

  tsrQueryClient.agent.properties.get.prefetchQuery({
    queryKey: ["agent-property", id],
    queryData: {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
      params: {
        id,
      },
    },
  });

  tsrQueryClient.agent.inquiries.list.prefetchQuery({
    queryKey: ["agent-inquiries", id, 1],
    queryData: {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
      query: {
        propertyId: id,
      },
    },
  });

  return (
    <HydrationBoundary state={dehydrate(rQQueryClient)}>
      <AgentPropertyDetails propertyId={id} />
    </HydrationBoundary>
  );
}
