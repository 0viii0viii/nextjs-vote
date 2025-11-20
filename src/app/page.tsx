import { Feed } from "@/widgets/feed";
import { Navbar } from "@/widgets/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Feed Section - Main Content */}
          <div className="lg:col-span-10 xl:col-span-10">
            <Feed />
          </div>
        </div>
      </main>
    </div>
  );
}
