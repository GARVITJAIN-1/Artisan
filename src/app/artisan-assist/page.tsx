
"use client";

import { readFileSync } from "fs";

// import ArtisanAssistPage from '@/components/artisan-assistance-page';
// import ArtisanAssistLayout from './layout';
// import { Suspense } from 'react';
// import { Tabs } from '@/components/ui/tabs';

// function ArtisanAssistWithSuspense() {
//     return (
//         <Suspense fallback={<div>Loading...</div>}>
//             <ArtisanAssistPage />
//         </Suspense>
//     )
// }

// export default function ArtisanAssist() {
//     return (
//         <ArtisanAssistLayout>
//             <div className="flex flex-col flex-grow p-4 md:p-6">
//                 <Tabs defaultValue="sourcing" className="w-full flex-grow flex flex-col">
//                     <ArtisanAssistWithSuspense />
//                 </Tabs>
//             </div>
//         </ArtisanAssistLayout>
//     );
// }


export default function ArtisanAssist() {
    return (

        <div className="flex-grow flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Artisan Assist</h1>
            <p className="text-gray-600">Your personal assistant for artisans.</p>
        </div>
    );
}
