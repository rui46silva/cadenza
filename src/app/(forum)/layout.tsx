import LeftSidebar from "@/components/forum/LeftSidebar";
import RightSidebar from "@/components/forum/RightSidebar";

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[200px_1fr_260px]">
      <aside className="hidden lg:block lg:min-w-0">
        <LeftSidebar />
      </aside>
      <main className="flex min-w-0 flex-col gap-4">{children}</main>
      <aside className="hidden lg:block lg:min-w-0">
        <RightSidebar />
      </aside>
    </div>
  );
}
