"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Community</h1>
      <Tabs defaultValue="journal">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="journal">Artisan's Journal</TabsTrigger>
          <TabsTrigger value="post">Post to Community</TabsTrigger>
          <TabsTrigger value="challenges">Creative Challenges</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle>Artisan's Journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Track your progress, document your creations, and tell your story.</p>
              <Textarea placeholder="Write your journal entry here..." rows={10} />
              <Button>Save Entry</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="post">
          <Card>
            <CardHeader>
              <CardTitle>Post to Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Share your work, ask for feedback, and connect with other artisans.</p>
              <Textarea placeholder="What's on your mind?" rows={5} />
              <Button>Post</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>Creative Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-bold">Challenge 1: Nature's Inspiration</h3>
                <p className="text-sm text-gray-600">Create a piece inspired by the natural world around you.</p>
                <Button variant="outline" size="sm" className="mt-2">Accept Challenge</Button>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-bold">Challenge 2: Recycled Art</h3>
                <p className="text-sm text-gray-600">Create something new out of recycled materials.</p>
                <Button variant="outline" size="sm" className="mt-2">Accept Challenge</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
