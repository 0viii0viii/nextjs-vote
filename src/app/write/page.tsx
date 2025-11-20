import { WritePost } from "@/features/write-post/ui/write-post";
import { Navbar } from "@/widgets/navbar";

export default function WritePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <WritePost />
      </main>
    </div>
  );
}
