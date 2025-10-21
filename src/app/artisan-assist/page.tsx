
"use client";

import ArtisanAssistPage from '@/components/artisan-assistance-page';
import { Suspense } from 'react';

function ArtisanAssistWithSuspense() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArtisanAssistPage />
        </Suspense>
    )
}

export default function ArtisanAssist() {
    return (
        <div className="flex flex-col flex-grow p-4 md:p-6">
            <ArtisanAssistWithSuspense />
        </div>
    );
}
