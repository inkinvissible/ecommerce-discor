import { AppSidebar } from "@/components/features/navigation/AppSidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {Toaster} from "@/components/ui/sonner";
import Footer from "@/components/layout/Footer";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 p-3 sm:p-6 bg-gray-50 sm:bg-gray-100 overflow-x-hidden">
                        {children}
                        <Toaster />
                    </main>
                    <Footer />
                </div>
            </div>
        </SidebarProvider>
    );
};

export default DashboardLayout;