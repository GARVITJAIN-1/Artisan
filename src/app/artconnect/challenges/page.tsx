"use client";

import { ChallengeCard } from "@/components/challenge-card";
import type { Challenge } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { AIChallengeGenerator } from "@/components/ai-challenge-generator";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { GalleryVertical } from "lucide-react"; // Icon for empty state

export default function ChallengesPage() {
  const firestore = useFirestore();

  const challengesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, "creativeChallenges"),
            orderBy("createdAt", "desc")
          )
        : null,
    [firestore]
  );

  const { data: allChallenges, isLoading } =
    useCollection<Challenge>(challengesQuery);

  const toDate = (timestamp: Date | Timestamp | undefined): Date | null => {
    if (!timestamp) return null;
    return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  };

  const { activeChallenges, pastChallenges } = useMemo(() => {
    const active: Challenge[] = [];
    const past: Challenge[] = [];
    if (allChallenges) {
      allChallenges.forEach((c) => {
        let status: "Active" | "Past" = "Active";
        const now = new Date();
        const endDate = toDate(c.endDate);

        if (endDate && endDate < now) {
          status = "Past";
        } else if (!c.endDate) {
          // If no end date, consider it active for 30 days as a fallback
          const createdAt = toDate(c.createdAt);
          if (createdAt) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            if (createdAt < thirtyDaysAgo) {
              status = "Past";
            }
          } else {
            status = "Past";
          }
        }

        if (status === "Active") {
          active.push({ ...c, status });
        } else {
          past.push({ ...c, status });
        }
      });
    }
    return { activeChallenges: active, pastChallenges: past };
  }, [allChallenges]);

  // Helper for a "beautiful empty state"
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-stone-300/80 p-12 text-center">
      <GalleryVertical className="h-12 w-12 text-stone-400" />
      <p className="font-medium text-stone-700">{message}</p>
      <p className="text-sm text-stone-500">
        Check back soon or create your own!
      </p>
    </div>
  );

  return (
    // Page inherits background from layout, we just add padding
    <div className="container px-4 py-8 bg-gradient-to-b from-[#FBF9F6] to-amber-50">
      <div className="text-center">
        {/* ## Updated Typography ## */}
        <h1 className="mb-4 font-headline text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
          Creative Challenges
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-stone-600">
          Spark your imagination with our community challenges. Submit your
          work, see what others have created, and grow as an artist.
        </p>
        <AIChallengeGenerator />
      </div>

      {/* ## Updated Separator ## */}
      <Separator className="my-12 bg-stone-200/80" />

      <div>
        <h2 className="mb-8 font-headline text-3xl font-bold text-stone-900">
          Active Challenges
        </h2>
        {isLoading && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* ## Updated Skeleton ## */}
            <Skeleton className="h-96 w-full bg-stone-200/80" />
            <Skeleton className="h-96 w-full bg-stone-200/80" />
          </div>
        )}
        {activeChallenges.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          !isLoading && <EmptyState message="No active challenges right now." />
        )}
      </div>

      <Separator className="my-12 bg-stone-200/80" />

      <div>
        <h2 className="mb-8 font-headline text-3xl font-bold text-stone-900">
          Past Challenges
        </h2>
        {isLoading && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 w-full bg-stone-200/80" />
            <Skeleton className="h-80 w-full bg-stone-200/80" />
            <Skeleton className="h-80 w-full bg-stone-200/80" />
          </div>
        )}
        {pastChallenges.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pastChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          !isLoading && <EmptyState message="No past challenges yet." />
        )}
      </div>
    </div>
  );
}
