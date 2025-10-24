'use client';

import { StoryCard } from '@/components/story-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { StoryPost } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { CreateStory } from '@/components/create-story';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const firestore = useFirestore();

  const storiesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'stories'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  const { data: stories, isLoading } = useCollection<StoryPost>(storiesQuery);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-center font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Artisan Stories
        </h1>
        <CreateStory />
      </div>

      {isLoading && (
         <div className="grid gap-8">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
         </div>
      )}

      <div className="grid gap-8">
        {stories?.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
