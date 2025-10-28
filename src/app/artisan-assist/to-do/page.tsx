'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Mic, Calendar as CalendarIcon, Clock, Plus, Bell, BellOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCollection } from '@/firebase/firestore/use-collection';
import { useSession } from '@/context/session-context';
import { db } from '@/firebase/firestore';
import { addDoc, collection, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getUpcomingTodos } from '@/lib/reminders';
import { useToast } from '@/hooks/use-toast';
import { getOauthToken } from '@/lib/google-calendar.client';
import { createCalendarEventAction } from './actions';

interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  dueTime: string;
  createdAt: any;
}

export default function ToDoPage() {
  const { user } = useSession();
  const { toast } = useToast();

  const toDosCollection = useMemo(() => 
    user ? query(collection(db, `users/${user.uid}/todos`), orderBy('createdAt', 'desc')) : null,
    [user]
  );

  const { data: toDos, isLoading: loading, error } = useCollection<ToDoItem>(toDosCollection);

  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading tasks",
        description: error.message,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        const upcoming = await getUpcomingTodos(user.uid);
        if (upcoming.length > 0) {
          toast({
            title: "Upcoming Task Reminder",
            description: `You have ${upcoming.length} task(s) due soon.`,
            action: (
              <Button variant="outline" size="sm" onClick={() => {}}>
                Snooze
              </Button>
            ),
          });
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [user, toast]);

  const handleAddToDo = async () => {
    if (!inputValue.trim() || !user) {
      return;
    }

    const taskData = {
        text: inputValue,
        completed: false,
        dueDate,
        dueTime,
        createdAt: serverTimestamp(),
    };

    try {
      // Primary action: add to DB
      await addDoc(collection(db, `users/${user.uid}/todos`), taskData);

      // UI feedback: clear form and close dialog
      setInputValue('');
      setDueDate('');
      setDueTime('');
      setIsAddDialogOpen(false);

      toast({ title: "Task added successfully!" });

      // Secondary action: create calendar event
      if (taskData.dueDate && taskData.dueTime) {
        try {
          const accessToken = await getOauthToken();
          if (accessToken) {
            const startTime = new Date(`${taskData.dueDate}T${taskData.dueTime}`);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            await createCalendarEventAction(taskData.text, '', startTime.toISOString(), endTime.toISOString(), accessToken);
          } else {
            toast({
              variant: 'destructive',
              title: 'Task added, but calendar sync failed.',
              description: 'Could not get authentication token for Google Calendar.',
            });
          }
        } catch (e) {
          console.error('Could not create calendar event', e);
          toast({
            variant: 'destructive',
            title: 'Task added, but calendar sync failed.',
            description: 'Please make sure you have granted calendar permissions to this app.'
          });
        }
      }
    } catch (e) {
      // Handle failure of primary action
      console.error('Could not add task', e);
      toast({
        variant: 'destructive',
        title: 'Could not add task',
        description: 'There was an error saving your task. Please try again.'
      });
    }
  };

  const handleToggleToDo = async (id: string, completed: boolean) => {
    if (user) {
      const todoRef = doc(db, `users/${user.uid}/todos`, id);
      await updateDoc(todoRef, { completed: !completed });
    }
  };

  const handleDeleteToDo = async (id: string) => {
    if (user) {
      const todoRef = doc(db, `users/${user.uid}/todos`, id);
      await deleteDoc(todoRef);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">To-Do List</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay organized and on top of your tasks. Add, manage, and complete your to-dos to keep your artisan business running smoothly.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Tasks</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a new task</DialogTitle>
              <DialogDescription>
                What do you need to get done? Add a description, due date, and time.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Task description..."
              />
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddToDo}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Loading tasks...</p>
                </div>
              ) : toDos && toDos.length > 0 ? (
                toDos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 rounded-lg bg-background p-3 shadow-sm transition-all hover:bg-accent border"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleToDo(todo.id, todo.completed)}
                      id={`todo-${todo.id}`}
                    />
                    <div className="flex-grow grid gap-1">
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`font-medium ${
                          todo.completed ? 'text-muted-foreground line-through' : ''
                        }`}
                      >
                        {todo.text}
                      </label>
                      {todo.dueDate && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                           <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(todo.dueDate).toLocaleDateString()}
                           </div>
                          {todo.dueTime && (
                             <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(`1970-01-01T${todo.dueTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteToDo(todo.id)}
                      className="rounded-full h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>You have no tasks yet.</p>
                  <p>Click "Add New Task" to get started.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
