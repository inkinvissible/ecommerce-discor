import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function NotificationDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                    >
                        3
                    </Badge>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Pedido confirmado</p>
                        <p className="text-xs text-gray-500">Tu pedido #12345 ha sido confirmado</p>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Nuevo producto disponible</p>
                        <p className="text-xs text-gray-500">Revisa los nuevos productos agregados</p>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Actualización de precios</p>
                        <p className="text-xs text-gray-500">Se han actualizado algunos precios</p>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center">
                    <span className="text-sm text-primary">Ver todas las notificaciones</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}