"use client"

export default function ArtisanAssistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col flex-grow">
            {children}
        </div>
    );
}