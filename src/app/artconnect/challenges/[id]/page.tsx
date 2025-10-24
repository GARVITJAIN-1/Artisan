
'use client';

import React, { use, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommentSection } from '@/components/comment-section';
import { Separator } from '@/components/ui/separator';
import type { Challenge, Submission } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { doc, Timestamp, query, collection, orderBy, where, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { SubmitWorkDialog } from '@/components/submit-work-dialog';
import { VoteControl } from '@/components/vote-control';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type ChallengePageProps = {
  params: Promise<{
    id: string;
  }>
};

const toDate = (timestamp: Date | Timestamp | undefined): Date | null => {
    if (!timestamp) return null;
    return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
}


function ChallengePageSkeleton() {
    return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-12 text-center">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
         <Skeleton className="h-6 w-1/3 mx-auto mt-4" />
      </header>

      <section id="submissions" className="mb-12">
        <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden">
                <CardHeader className="p-0">
                    <Skeleton className="aspect-square w-full" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
             <Card className="overflow-hidden">
                <CardHeader className="p-0">
                    <Skeleton className="aspect-square w-full" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
             <Card className="overflow-hidden">
                <CardHeader className="p-0">
                    <Skeleton className="aspect-square w-full" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
        </div>
      </section>

      <Separator />

      <div className="mt-12">
        <CommentSection postId={'loading-post'} collectionName='creativeChallenges' />
      </div>
    </div>
    );
}

function SubmissionsSection({ challengeId, challengeTitle }: { challengeId: string, challengeTitle: string }) {
    const firestore = useFirestore();
    const { user } = useUser();

    const submissionsQuery = useMemoFirebase(
        () => firestore ? query(
            collection(firestore, `creativeChallenges/${challengeId}/submissions`),
            orderBy('votes', 'desc')
        ) : null,
        [firestore, challengeId]
    );

    const { data: submissions, isLoading } = useCollection<Submission>(submissionsQuery);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
               {[...Array(3)].map((_, i) => (
                 <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-0">
                        <Skeleton className="aspect-square w-full" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                    </CardContent>
                    <CardFooter className='flex justify-between items-center'>
                         <Skeleton className="h-8 w-1/2" />
                         <Skeleton className="h-8 w-16" />
                    </CardFooter>
                </Card>
               ))}
            </div>
        )
    }

    if (!submissions || submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
              <h3 className="text-xl font-semibold">No Submissions Yet</h3>
              <p className="mt-2 text-muted-foreground">
                Be the first to share your creation for this challenge!
              </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {submissions.map((submission) => {
              const isOwner = user?.uid === submission.authorId;
              const submissionWithTitle = {...submission, challengeTitle};
              return (
              <Card key={submission.id} className="overflow-hidden flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={submission.imageUrl}
                      alt={submission.title}
                      fill
                      className="object-cover"
                      data-ai-hint={submission.imageHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <div className='flex justify-between items-start'>
                    <CardTitle className="mb-2 text-lg">{submission.title}</CardTitle>
                    {isOwner && (
                        <SubmitWorkDialog submissionToEdit={submissionWithTitle}>
                            <Button variant='ghost' size='icon' className='h-8 w-8 -mt-1'>
                                <Edit className='h-4 w-4' />
                            </Button>
                        </SubmitWorkDialog>
                    )}
                  </div>
                  {submission.description && (
                    <CardDescription>{submission.description}</CardDescription>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between bg-muted/50 p-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6">
                        <AvatarImage src={submission.author.avatarUrl} alt={submission.author.name} />
                        <AvatarFallback>{submission.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{submission.author.name}</span>
                    </div>
                    <VoteControl submission={submission} />
                </CardFooter>
              </Card>
              )}
            )}
        </div>
    )

}

function SubmitButton({ challengeId, challengeTitle }: { challengeId: string, challengeTitle: string }) {
    const firestore = useFirestore();
    const { user } = useUser();

    const userSubmissionQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, `creativeChallenges/${challengeId}/submissions`),
            where('authorId', '==', user.uid)
        );
    }, [firestore, user, challengeId]);

    const { data: userSubmissions, isLoading } = useCollection(userSubmissionQuery);

    const hasSubmitted = !isLoading && userSubmissions && userSubmissions.length > 0;

    let buttonText = 'Log in to Submit';
    if (user) {
        if (isLoading) {
            buttonText = 'Checking...';
        } else if (hasSubmitted) {
            buttonText = 'You have already submitted';
        } else {
            buttonText = 'Submit Your Work';
        }
    }

    return (
        <SubmitWorkDialog challenge={{ id: challengeId, title: challengeTitle } as Challenge}>
            <Button disabled={!user || isLoading || hasSubmitted}>
                {buttonText}
            </Button>
        </SubmitWorkDialog>
    );
}


export default function ChallengePage({ params: paramsProp }: ChallengePageProps) {
  const params = use(paramsProp);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const challengeRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'creativeChallenges', params.id) : null),
    [firestore, params.id]
  );
  const { data: challenge, isLoading } = useDoc<Challenge>(challengeRef);

  const handleDelete = async () => {
    if (!challenge || !firestore) return;
    setIsDeleting(true);
    try {
      const docRef = doc(firestore, 'creativeChallenges', challenge.id);
      await deleteDoc(docRef)
        .catch(serverError => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'delete',
                })
            );
            throw serverError;
        });

      toast({
        title: 'Challenge Deleted',
        description: 'The challenge has been successfully removed.',
      });
      router.push('/challenges');
    } catch (error) {
       if (!(error instanceof FirestorePermissionError)) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not delete the challenge. Please try again.',
            });
       }
       setIsDeleting(false);
    }
  };


  if (isLoading || !challenge) {
    return <ChallengePageSkeleton />;
  }

  const endDate = toDate(challenge.endDate);


  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-12 text-center">
        <div className="relative inline-block">
            <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
            {challenge.title}
            </h1>
            {user && (
                <div className="absolute -right-12 top-0">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Delete Challenge</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this challenge
                            and all its submissions.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className='bg-destructive hover:bg-destructive/90'>
                            {isDeleting ? 'Deleting...' : 'Yes, delete it'}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </div>
            )}
        </div>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {challenge.description}
        </p>
         {endDate && (
          <div className="mt-4 inline-flex items-center justify-center rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Submissions due by {format(endDate, 'MMMM d, yyyy')}
          </div>
        )}
      </header>

      <section id="submissions" className="mb-12">
        <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-3xl font-bold">Community Submissions</h2>
            <SubmitButton challengeId={params.id} challengeTitle={challenge.title} />
        </div>
        
        <SubmissionsSection challengeId={challenge.id} challengeTitle={challenge.title} />
      </section>

      <Separator />

      <div className="mt-12">
        <CommentSection postId={challenge.id} collectionName="creativeChallenges" />
      </div>
    </div>
  );
}
