
"use client";

import { useState, useTransition, FC, useEffect } from "react";
import type {
  Event,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
} from "lucide-react";
import {
  findEventsAction,
} from "@/lib/actions";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EventsPage() {
  const { toast } = useToast();

  const [isFindingEvents, startFindingEvents] = useTransition();
  const [isFindingLocalEvents, startFindingLocalEvents] = useTransition();

  const [events, setEvents] = useState<Event[]>([]);
  const [localEvents, setLocalEvents] = useState<Event[]>([]);

  const [eventCountry, setEventCountry] = useState<string>("India");
  const [localEventState, setLocalEventState] = useState<string>("Rajasthan");
  const [localEventCountry, setLocalEventCountry] = useState<string>("India");

  const handleFindEvents = () => {
    setEvents([]);
    startFindingEvents(async () => {
      const result = await findEventsAction(eventCountry);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else if (result.events) {
        setEvents(result.events);
      }
    });
  };

  const handleFindLocalEvents = () => {
    setLocalEvents([]);
    startFindingLocalEvents(async () => {
      const result = await findEventsAction(localEventCountry, localEventState);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else if (result.events) {
        setLocalEvents(result.events);
      }
    });
  };

  return (
    <div className="grid gap-6 flex-grow grid-rows-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Find Local Events</CardTitle>
          <CardDescription>
            Discover upcoming events in your specific state or region.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <div className="flex items-end gap-2 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="local-event-state">State / Region</Label>
              <Input
                id="local-event-state"
                placeholder="e.g. Rajasthan"
                value={localEventState}
                onChange={(e) => setLocalEventState(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="local-event-country">Country</Label>
              <Input
                id="local-event-country"
                placeholder="e.g. India"
                value={localEventCountry}
                onChange={(e) => setLocalEventCountry(e.target.value)}
              />
            </div>
            <Button
              onClick={handleFindLocalEvents}
              disabled={isFindingLocalEvents}
            >
              {isFindingLocalEvents ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Find Local Events
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFindingLocalEvents ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : localEvents.length > 0 ? (
                  localEvents.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {event.name}
                      </TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Register
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No upcoming local events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Find National Events</CardTitle>
          <CardDescription>
            Discover events across the entire country to showcase your
            work.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <div className="flex items-end gap-2 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="event-country">Country</Label>
              <Input
                id="event-country"
                placeholder="e.g. India"
                value={eventCountry}
                onChange={(e) => setEventCountry(e.target.value)}
              />
            </div>
            <Button onClick={handleFindEvents} disabled={isFindingEvents}>
              {isFindingEvents ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Find National Events
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFindingEvents ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : events.length > 0 ? (
                  events.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {event.name}
                      </TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Register
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No upcoming national events found. Try a different
                      country.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
