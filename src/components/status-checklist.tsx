"use client";

import type { ChecklistItem, ChecklistItemStatus } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Circle, CircleCheck, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusChecklistProps = {
  items: ChecklistItem[];
};

const statusIcons: Record<ChecklistItemStatus, React.ReactElement> = {
  completed: <CircleCheck className="h-5 w-5 text-primary" />,
  current: <LoaderCircle className="h-5 w-5 animate-spin text-accent" />,
  upcoming: <Circle className="h-5 w-5 text-muted-foreground" />,
};

const statusStyles: Record<ChecklistItemStatus, string> = {
    completed: 'text-foreground line-through',
    current: 'text-accent font-bold',
    upcoming: 'text-muted-foreground'
}

export default function StatusChecklist({ items }: StatusChecklistProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Application Checklist</CardTitle>
        <CardDescription>Follow these steps to complete your application.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-4 transition-all duration-300">
              {statusIcons[item.status]}
              <span className={cn("flex-1 text-md", statusStyles[item.status])}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
