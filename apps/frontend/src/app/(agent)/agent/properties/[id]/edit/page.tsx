import AgentPropertyEditForm from "@/components/AgentDashboard/AgentPropertyEditForm";
import { tsrQueryClient } from "@/utils/tsr";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";

type Params = Promise<{ id: string }>;

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Properview - Edit Property",
  description: "Properview - Edit Property",
};

export default async function EditPropertyPage({ params }: { params: Params }) {
  const awaitedParams = await params;

  await tsrQueryClient.agent.properties.get.prefetchQuery({
    queryKey: ["agent-property", awaitedParams.id],
    queryData: {
      params: { id: awaitedParams.id },
    },
  });
  return (
    <HydrationBoundary state={dehydrate(tsrQueryClient)}>
      <AgentPropertyEditForm propertyId={awaitedParams.id} />
    </HydrationBoundary>
  );
}
