"use client";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  const handleSaveBio = async () => {
    if (user) {
      await updateProfile(user, { photoURL: bio });
      setIsEditing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
          <AvatarFallback>
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Bio</h2>
        {isEditing ? (
          <div>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full mt-2"
            />
            <Button onClick={handleSaveBio} className="mt-2">
              Save Bio
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground">
              {user.photoURL || "This is a default bio. Click edit to change it."}
            </p>
            <Button onClick={() => setIsEditing(true)} className="mt-2">
              Edit Bio
            </Button>
          </div>
        )}
      </div>
      
    </div>
  );
}
