export function AppFrame({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-secondary-950 text-secondary-50 overflow-hidden">
      {sidebar}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-secondary-900">
        {children}
      </main>
    </div>
  );
}
