import AgentPropertiesList from '@/components/AgentPropertiesList'
import { rQQueryClient, tsr, tsrQueryClient } from '@/utils/tsr'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Properview - Agent Properties',
  description: 'Properview - Agent Properties',
}

export default async function AgentPropertiesPage() {
  
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get('jwtToken')?.value;

  tsrQueryClient.agent.properties.list.prefetchQuery({
    queryKey: ['agent-properties'],
    queryData: {
      headers: {
        authorization: `Bearer ${jwtToken}`
      },
      query: {
        page: 1,
        limit: 10
      }
    }
  })
  return (
    <HydrationBoundary state={dehydrate(rQQueryClient)}>
      <AgentPropertiesList />
    </HydrationBoundary>
  )
}
