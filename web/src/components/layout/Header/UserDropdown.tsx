import { User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function UserDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={"/profile"} className="cursor-pointer">
                    <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        <span>Perfil</span>
                    </DropdownMenuItem>
                </Link>
                <Link href={"/settings"} className="cursor-pointer">
                    <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        <span>Configuración</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}