export function AppFrame({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-200 p-4">{sidebar}</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
