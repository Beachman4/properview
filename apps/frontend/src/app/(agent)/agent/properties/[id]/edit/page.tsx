import AgentPropertyEditForm from '@/components/AgentPropertyEditForm'
import { tsrQueryClient } from '@/utils/tsr'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

type Params = Promise<{ id: string }>

export default async function EditPropertyPage({ params }: { params: Params }) {
  const awaitedParams = await params

  await tsrQueryClient.agent.properties.get.prefetchQuery({
    queryKey: ['agent-property', awaitedParams.id],
    queryData: {
      params: { id: awaitedParams.id }
    }
  })
  return (
    <HydrationBoundary state={dehydrate(tsrQueryClient)}>
      <AgentPropertyEditForm propertyId={awaitedParams.id} />
    </HydrationBoundary>
  )
}
