import Link from 'next/link';
import Image from 'next/image';
import type { Challenge } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { SubmissionCounter } from './submission-counter';

type ChallengeCardProps = {
  challenge: Challenge;
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <Link href={`/artconnect/challenges/${challenge.id}`} className="group block">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader>
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={challenge.imageUrl}
              alt={challenge.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={challenge.imageHint}
            />
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-2xl">{challenge.title}</CardTitle>
            {challenge.status && (
              <Badge
                variant={challenge.status === 'Active' ? 'default' : 'secondary'}
                className={cn(
                  challenge.status === 'Active' && 'bg-accent text-accent-foreground'
                )}
              >
                {challenge.status}
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2 pt-2 text-base">
            {challenge.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto flex items-center justify-between bg-muted/50 p-4">
            <SubmissionCounter challengeId={challenge.id} />
            <div className="flex items-center text-sm font-semibold text-accent">
                View Challenge
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
