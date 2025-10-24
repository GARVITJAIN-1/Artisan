
'use client';

import { ChallengeCard } from '@/components/challenge-card';
import type { Challenge } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { AIChallengeGenerator } from '@/components/ai-challenge-generator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export default function ChallengesPage() {
  const firestore = useFirestore();

  const challengesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'creativeChallenges'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore]
  );
  
  const { data: allChallenges, isLoading } = useCollection<Challenge>(challengesQuery);

  const toDate = (timestamp: Date | Timestamp | undefined): Date | null => {
    if (!timestamp) return null;
    return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  }

  const { activeChallenges, pastChallenges } = useMemo(() => {
    const active: Challenge[] = [];
    const past: Challenge[] = [];
    if (allChallenges) {
        allChallenges.forEach((c) => {
            let status: 'Active' | 'Past' = 'Active';
            const now = new Date();
            const endDate = toDate(c.endDate);

            if (endDate && endDate < now) {
                status = 'Past';
            } else if (!c.endDate) {
                // If no end date, consider it active for 30 days as a fallback
                 const createdAt = toDate(c.createdAt);
                 if (createdAt) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    if (createdAt < thirtyDaysAgo) {
                        status = 'Past';
                    }
                 } else {
                     status = 'Past';
                 }
            }
            
            if (status === 'Active') {
                active.push({...c, status});
            } else {
                past.push({...c, status});
            }
        });
    }
    return { activeChallenges: active, pastChallenges: past };
  }, [allChallenges]);


  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4 font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Creative Challenges
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Spark your imagination with our community challenges. Submit your work,
          see what others have created, and grow as an artist.
        </p>
        <AIChallengeGenerator />
      </div>

      <Separator className="my-12" />

      <div>
        <h2 className="mb-8 font-headline text-3xl font-bold">Active Challenges</h2>
        {isLoading && (
            <div className="grid gap-8 md:grid-cols-2">
                <Skeleton className="h-96 w-full"/>
                <Skeleton className="h-96 w-full"/>
            </div>
        )}
        {activeChallenges.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          !isLoading && <p className="text-muted-foreground">No active challenges right now. Check back soon!</p>
        )}
      </div>

      <Separator className="my-12" />

      <div>
        <h2 className="mb-8 font-headline text-3xl font-bold">Past Challenges</h2>
         {isLoading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-80 w-full"/>
                <Skeleton className="h-80 w-full"/>
                <Skeleton className="h-80 w-full"/>
            </div>
        )}
        {pastChallenges.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pastChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
         ) : (
          !isLoading && <p className="text-muted-foreground">No past challenges yet.</p>
        )}
      </div>
    </div>
  );
}

    