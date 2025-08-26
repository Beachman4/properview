import AgentInquiriesList from "@/components/AgentDashboard/AgentInquiriesList";
import { rQQueryClient, tsrQueryClient } from "@/utils/tsr";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Properview - Agent Inquiries",
  description: "Properview - Agent Inquiries",
};

export default async function AgentInquiriesPage() {
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get("jwtToken")?.value;

  tsrQueryClient.agent.inquiries.list.prefetchQuery({
    queryKey: ["agent-inquiries-all", 1],
    queryData: {
      query: { page: 1, limit: 20 },
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    },
  });

  return (
    <HydrationBoundary state={dehydrate(rQQueryClient)}>
      <AgentInquiriesList />
    </HydrationBoundary>
  );
}
