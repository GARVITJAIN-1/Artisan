'use client';

import Dashboard from '@/components/todo-dashboard';
import Header from '@/components/todo-header';
import { useUser } from '@/firebase';

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Dashboard /> 
      </main>
    </div>
  );
}
