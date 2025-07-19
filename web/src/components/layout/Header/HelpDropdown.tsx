import { HelpCircle, FileText, Phone, Mail } from "lucide-react";
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

export function HelpDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <HelpCircle className="w-5 h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Centro de Ayuda</DropdownMenuLabel>
                <DropdownMenuSeparator />


                <Link href={"/docs"}>
                        <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Documentación</span>
                        </DropdownMenuItem>
                </Link>

                <Link href={"https://wa.me/5493512050889"} target="_blank">
                    <DropdownMenuItem>
                        <Phone className="w-4 h-4 mr-2" />
                        <span>Contacto telefónico</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <span className="text-sm text-gray-500">Versión 1.0.0</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}