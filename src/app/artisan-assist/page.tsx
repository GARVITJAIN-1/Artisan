

import ArtisanAssistPage from '@/components/artisan-assistance-page';
import ArtisanAssistLayout from './layout';
import { Suspense } from 'react';
import { Tabs } from '@/components/ui/tabs';

function ArtisanAssistWithSuspense() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArtisanAssistPage />
        </Suspense>
    )
}

export default function ArtisanAssist() {
    return (
        <ArtisanAssistLayout>
            <div className="flex flex-col flex-grow p-4 md:p-6">
                <Tabs defaultValue="sourcing" className="w-full flex-grow flex flex-col">
                    <ArtisanAssistWithSuspense />
                </Tabs>
            </div>
        </ArtisanAssistLayout>
    );
}
