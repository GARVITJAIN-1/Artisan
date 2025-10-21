"use client";

import { useSession } from "@/context/session-context";
import { artisanProfiles } from "@/lib/profile-data";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileInfo } from "@/components/profile-info";
import { ProfileGallery } from "@/components/profile-gallery";

export default function ProfilePage() {
  const { session } = useSession();
  const username = session.username as keyof typeof artisanProfiles;

  if (!session.isLoggedIn || !username || !artisanProfiles[username]) {
    return <div>Please log in to view this page.</div>;
  }

  const profile = artisanProfiles[username];

  return (
    <div className="container mx-auto p-4">
      <ProfileHeader
        name={profile.name}
        location={profile.location}
        workType={profile.workType}
        profileImage={profile.profileImage}
      />
      <ProfileInfo profile={profile} />
      <ProfileGallery gallery={profile.gallery} />
    </div>
  );
}
