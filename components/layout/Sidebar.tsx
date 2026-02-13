interface SidebarProps {
  title?: string;
  children?: React.ReactNode;
}

export default function Sidebar({ title = "Tools", children }: SidebarProps) {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Sidebar header */}
      <div className="h-14 border-b border-gray-200 flex items-center px-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children || (
          <p className="text-sm text-gray-500">No content yet</p>
        )}
      </div>
    </aside>
  );
}