// artisan-assist/events/page.tsx

"use client";

import { useState, useTransition, FC, useEffect } from "react";
import type { Event } from "@/lib/types";
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
import { Loader2, Search } from "lucide-react";
import { findEventsAction } from "@/lib/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/context/language-context";

export default function EventsPage() {
  const { t } = useLanguage();
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
          title: t("eventsPage.error"),
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
          title: t("eventsPage.error"),
          description: result.error,
        });
      } else if (result.events) {
        setLocalEvents(result.events);
      }
    });
  };

  return (
    // ## Alignment & Color Change ##
    // 1. Changed `grid-rows-2` to `grid-cols-1` for a flexible vertical stack.
    // 2. Added the artisanal background gradient (`bg-gradient-to-b...`).
    <div className="grid grid-cols-1 gap-6 flex-grow p-4 md:p-8 bg-gradient-to-b from-[#FBF9F6] to-amber-50">
      {/* ## Card 1: Local Events ## */}
      {/* Updated Card style to be semi-transparent */}
      <Card className="flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-stone-900">{t("eventsPage.findLocalEvents")}</CardTitle>
          <CardDescription className="text-stone-600">
            {t("eventsPage.findLocalEventsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          {/* Made the search bar responsive with flex-wrap */}
          <div className="flex flex-wrap items-end gap-2 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="local-event-state" className="text-stone-700">
                {t("eventsPage.stateRegion")}
              </Label>
              {/* Updated Input style */}
              <Input
                id="local-event-state"
                placeholder="e.g. Rajasthan"
                value={localEventState}
                onChange={(e) => setLocalEventState(e.target.value)}
                className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="local-event-country" className="text-stone-700">
                {t("eventsPage.country")}
              </Label>
              {/* Updated Input style */}
              <Input
                id="local-event-country"
                placeholder="e.g. India"
                value={localEventCountry}
                onChange={(e) => setLocalEventCountry(e.target.value)}
                className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            {/* Updated Button style */}
            <Button
              onClick={handleFindLocalEvents}
              disabled={isFindingLocalEvents}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-90"
            >
              {isFindingLocalEvents ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {t("eventsPage.findLocalEventsButton")}
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-stone-700">{t("eventsPage.event")}</TableHead>
                  <TableHead className="text-stone-700">{t("eventsPage.date")}</TableHead>
                  <TableHead className="text-stone-700">{t("eventsPage.location")}</TableHead>
                  <TableHead className="text-right text-stone-700">
                    {t("eventsPage.link")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFindingLocalEvents ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      {/* Updated Loader color */}
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
                    </TableCell>
                  </TableRow>
                ) : localEvents.length > 0 ? (
                  localEvents.map((event, index) => (
                    <TableRow key={index} className="border-stone-200/80">
                      <TableCell className="font-medium text-stone-800">
                        {event.name}
                      </TableCell>
                      <TableCell className="text-stone-600">
                        {event.date}
                      </TableCell>
                      <TableCell className="text-stone-600">
                        {event.location}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Updated outline Button style */}
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t("eventsPage.register")}
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-stone-200/80">
                    <TableCell
                      colSpan={4}
                      className="text-center h-24 text-stone-500"
                    >
                      {t("eventsPage.noLocalEvents")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ## Card 2: National Events ## */}
      <Card className="flex flex-col bg-white/70 backdrop-blur-lg border border-stone-200/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-stone-900">{t("eventsPage.findNationalEvents")}</CardTitle>
          <CardDescription className="text-stone-600">
            {t("eventsPage.findNationalEventsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <div className="flex flex-wrap items-end gap-2 mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="event-country" className="text-stone-700">
                {t("eventsPage.country")}
              </Label>
              <Input
                id="event-country"
                placeholder="e.g. India"
                value={eventCountry}
                onChange={(e) => setEventCountry(e.target.value)}
                className="bg-white/50 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <Button
              onClick={handleFindEvents}
              disabled={isFindingEvents}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:opacity-90"
            >
              {isFindingEvents ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {t("eventsPage.findNationalEventsButton")}
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-stone-700">{t("eventsPage.event")}</TableHead>
                  <TableHead className="text-stone-700">{t("eventsPage.date")}</TableHead>
                  <TableHead className="text-stone-700">{t("eventsPage.location")}</TableHead>
                  <TableHead className="text-right text-stone-700">
                    {t("eventsPage.link")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFindingEvents ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
                    </TableCell>
                  </TableRow>
                ) : events.length > 0 ? (
                  events.map((event, index) => (
                    <TableRow key={index} className="border-stone-200/80">
                      <TableCell className="font-medium text-stone-800">
                        {event.name}
                      </TableCell>
                      <TableCell className="text-stone-600">
                        {event.date}
                      </TableCell>
                      <TableCell className="text-stone-600">
                        {event.location}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t("eventsPage.register")}
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-stone-200/80">
                    <TableCell
                      colSpan={4}
                      className="text-center h-24 text-stone-500"
                    >
                      {t("eventsPage.noNationalEvents")}
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
