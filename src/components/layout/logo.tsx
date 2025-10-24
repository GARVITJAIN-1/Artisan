import Link from 'next/link';
import { QuillIcon } from './quill-icon';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <QuillIcon className="h-8 w-8 text-accent" />
      <span className="inline-block font-headline text-2xl font-bold">
        ArtConnect
      </span>
    </Link>
  );
}
