import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { QueryClient } from '@tanstack/react-query';
import { contract } from '@properview/api-contract';


let accessTokenGetter: () => string | null = () => {
    return null
}

export const rQQueryClient = new QueryClient()

export const tsr = initTsrReactQuery(contract, {
  baseUrl: `${process.env.NEXT_PUBLIC_API_HOST}`,
  baseHeaders: {
    'authorization': accessTokenGetter() ? `Bearer ${accessTokenGetter()}` : '',
  },
});

export const queryClient = tsr.initQueryClient(new QueryClient())