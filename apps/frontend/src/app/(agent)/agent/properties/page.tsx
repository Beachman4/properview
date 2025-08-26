import AgentPropertiesList from "@/components/AgentDashboard/AgentPropertiesList";
import { rQQueryClient, tsrQueryClient } from "@/utils/tsr";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Properview - Agent Properties",
  description: "Properview - Agent Properties",
};

type SearchParams = Promise<{
  page?: string;
}>;

export default async function AgentPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page } = await searchParams;
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get("jwtToken")?.value;
  const currentPage = page ? parseInt(page, 10) : 1;

  tsrQueryClient.agent.properties.list.prefetchQuery({
    queryKey: ["agent-properties", currentPage],
    queryData: {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
      query: {
        page: currentPage,
        limit: 10,
      },
    },
  });
  return (
    <HydrationBoundary state={dehydrate(rQQueryClient)}>
      <AgentPropertiesList />
    </HydrationBoundary>
  );
}
