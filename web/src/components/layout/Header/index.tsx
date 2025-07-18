import { SidebarTrigger } from "@/components/ui/sidebar";
import { HelpDropdown } from "@/components/layout/Header/HelpDropdown";
import { UserDropdown } from "@/components/layout/Header/UserDropdown";

export function Header() {
    return (
        <header className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Panel de Control
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <HelpDropdown />
                    <UserDropdown />
                </div>
            </div>
        </header>
    );
}