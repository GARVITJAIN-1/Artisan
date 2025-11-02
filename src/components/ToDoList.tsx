'use client';

import { useState } from 'react';
import type { Todo, TodoStatus } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from './ui/button';
import { getAiSummary } from '@/lib/actions';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from './ui/alert-dialog';
import { Loader2, BrainCircuit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

interface TodoListProps {
  todos: Todo[];
  onStatusChange: (todoId: string, status: TodoStatus) => void;
  isLoading: boolean;
}

const statusVariant: { [key in TodoStatus]: 'default' | 'secondary' | 'outline' } = {
    'complete': 'default',
    'in progress': 'secondary',
    'incomplete': 'outline',
};

const statusLabel: { [key in TodoStatus]: string } = {
    'complete': 'Complete',
    'in progress': 'In Progress',
    'incomplete': 'Incomplete',
};

export default function TodoList({ todos, onStatusChange, isLoading }: TodoListProps) {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const handleSummary = async () => {
    setIsSummarizing(true);
    const result = await getAiSummary(todos);
    setSummary(result);
    setIsSummarizing(false);
    setIsSummaryOpen(true);
  };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>To-Do List</CardTitle>
        <CardDescription>All the tasks required to complete your orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Task Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 float-right" /></TableCell>
                    </TableRow>
                ))
            ) : todos.length > 0 ? (
              todos.map(todo => (
                <TableRow key={todo.id}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Checkbox
                            checked={todo.status === 'complete'}
                            onCheckedChange={(checked) =>
                              onStatusChange(todo.id, checked ? 'complete' : 'incomplete')
                            }
                            aria-label={`Mark ${todo.description} as ${todo.status === 'complete' ? 'incomplete' : 'complete'}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark as {todo.status === 'complete' ? 'incomplete' : 'complete'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className={`font-medium ${todo.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                    {todo.description}
                  </TableCell>
                  <TableCell className={`text-center ${todo.status === 'complete' ? 'text-muted-foreground line-through' : ''}`}>
                    {todo.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Badge variant={statusVariant[todo.status]}>{statusLabel[todo.status]}</Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {(Object.keys(statusLabel) as TodoStatus[]).map((status) => (
                           <DropdownMenuItem key={status} onSelect={() => onStatusChange(todo.id, status)}>
                             {statusLabel[status]}
                           </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No tasks yet. Create an order to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSummary} disabled={isSummarizing || todos.length === 0} variant="outline" className="ml-auto">
          {isSummarizing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          Summarize Tasks
        </Button>
      </CardFooter>
      <AlertDialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI Task Summary</AlertDialogTitle>
            <AlertDialogDescription>
              {summary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
