import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/") return "Home";
    if (path === "/knowledge") return "Equipment";
    if (path.startsWith("/knowledge/")) {
      // Equipment detail page - show equipment name in breadcrumb
      return "Equipment Details";
    }
    if (path.startsWith("/library")) return "Library";
    if (path.startsWith("/settings")) return "Settings";

    return "";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 h-16 border-b flex items-center gap-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
