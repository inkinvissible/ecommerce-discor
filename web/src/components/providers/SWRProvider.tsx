'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/api/fetcher';

interface SWRProviderProps {
    children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
    return (
        <SWRConfig
            value={{
                fetcher: fetcher,
                revalidateOnFocus: true,
                shouldRetryOnError: true,
            }}
        >
            {children}
        </SWRConfig>
    );
}