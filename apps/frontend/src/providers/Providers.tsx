'use client'

import { rQQueryClient, tsr } from "@/utils/tsr";
import { QueryClientProvider } from "@tanstack/react-query";


export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={rQQueryClient}>
          <tsr.ReactQueryProvider>
            {children}
          </tsr.ReactQueryProvider>
        </QueryClientProvider>
    )
}