"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import {
    Home,
    Package,
    ShoppingCart,
    ClipboardList,
    Download,
    LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
    {
        title: "Inicio",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Productos",
        url: "/products",
        icon: Package,
    },
    {
        title: "Mis Pedidos",
        url: "/orders",
        icon: ClipboardList,
    },
    {
        title: "Mi Carrito",
        url: "/cart",
        icon: ShoppingCart,
    },
    {
        title: "Descargar Lista",
        url: "/download-excel",
        icon: Download,
    },
    {
        title: "Documentación",
        url: "/docs",
        icon: ClipboardList,
    }
];

export const AppSidebar = () => {
    const handleLogout = () => {
        // Aquí puedes implementar la lógica de cierre de sesión
        // Por ejemplo, eliminar el token del localStorage y redirigir al usuario
        localStorage.removeItem("token");
        // También puedes eliminar cookies si es necesario
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login"; // Redirigir a la página de inicio de sesión
    };
    return (
        <Sidebar>
            <SidebarHeader>
                <Image src={"/images/logo-discor.png"} alt={"Logo de DisCor: Cerrajería y Accesorios"} height={35} width={150}/>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} className="flex items-center space-x-3">
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <button className="flex items-center space-x-3 w-full text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg p-2" onClick={handleLogout}>
                                <LogOut className="w-5 h-5" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};