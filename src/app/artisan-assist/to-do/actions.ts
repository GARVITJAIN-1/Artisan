
'use server';

import { createCalendarEvent } from '@/lib/google-calendar';

export const createCalendarEventAction = async (summary: string, description: string, startTime: string, endTime: string, accessToken: string) => {
  await createCalendarEvent(summary, description, startTime, endTime, accessToken);
};
