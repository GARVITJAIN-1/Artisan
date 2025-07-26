import Dashboard from '@/components/dashboard';
import { Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
        <Leaf className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-primary">
          PM-KISAN Saathi
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
