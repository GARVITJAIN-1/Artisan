'use client';

import { useMemo } from 'react';
import type { Todo, TodoStatus } from '@/lib/definitions';
import NewOrderForm from './NewOrderForm';
import TodoList from './ToDoList';
import { useToast } from '@/hooks/use-toast';
import { updateTodoStatus as updateStatusAction } from '@/lib/actions';
import NewTaskForm from './NewTaskForm';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function Dashboard() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const todosQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, 'artisans', user.uid, 'todos'), orderBy('createdAt', 'desc'))
        : null,
    [firestore, user]
  );
  const { data: todos, isLoading: isLoadingTodos } = useCollection<Todo>(todosQuery);
  
  const handleNewOrder = () => {
    // Data is now handled by useCollection, revalidation happens in the server action.
    // This function can be used for client-side feedback if needed.
  };

  const handleNewTodo = () => {
    // Data is now handled by useCollection, revalidation happens in the server action.
  };

  const handleStatusChange = async (todoId: string, status: TodoStatus) => {
    // Optimistic update could be implemented here if desired, but for now we rely on server action revalidation.
    const result = await updateStatusAction(todoId, status);
    
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.message,
      });
    } else {
        toast({
            title: 'Task Updated',
            description: `Task marked as ${status}.`
        })
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <NewOrderForm onOrderCreated={handleNewOrder} />
        <NewTaskForm onTaskCreated={handleNewTodo} />
      </div>
      <div className="lg:col-span-2">
        <TodoList todos={todos || []} onStatusChange={handleStatusChange} isLoading={isLoadingTodos}/>
      </div>
    </div>
  );
}
