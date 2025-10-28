
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDollarSign, Lightbulb, Calendar, CheckSquare } from 'lucide-react';

export default function ArtisanAssistPage() {
  const services = [
    {
      title: 'Sourcing & Pricing',
      description: 'Find materials, sell products, and get price suggestions.',
      href: '/artisan-assist/sourcing-pricing',
      icon: <BadgeDollarSign className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Ideas & Trends',
      description: 'Get AI-powered ideas and discover trending products.',
      href: '/artisan-assist/ideas-trends',
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Events',
      description: 'Find local and national events to showcase your work.',
      href: '/artisan-assist/events',
      icon: <Calendar className="h-8 w-8 text-primary" />,
    }
  ];

  return (
    <div className="flex flex-col flex-grow p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Artisan Assistance</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link href={service.href} key={service.title}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  {service.title}
                </CardTitle>
                {service.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
