// src/components/layout/Profile/ClientInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building, CreditCard, Percent, MapPin, HelpCircle } from 'lucide-react';
import { Client } from '@/types/profile';

interface ClientInfoProps {
    client: Client;
}

export const ClientInfo = ({ client }: ClientInfoProps) => {
    const defaultAddress = client.addresses.find(addr => addr.isDefaultShipping);

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Información del Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="font-medium">Razón Social:</span>
                            <p className="text-sm text-gray-600">{client.businessName}</p>
                        </div>
                        <div>
                            <span className="font-medium">CUIT:</span>
                            <p className="text-sm text-gray-600">{client.cuit}</p>
                        </div>
                        <div>
                            <span className="font-medium">Código ERP:</span>
                            <p className="text-sm text-gray-600">{client.erpCode}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Descuento:</span>
                            <Badge variant="outline">{client.discountPercentage}%</Badge>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">
                                        Descuento especial aplicado a todos los productos.
                                        Se calcula sobre el precio de lista antes de aplicar el IVA.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">IVA:</span>
                            <Badge variant={client.applyVat ? "default" : "secondary"}>
                                {client.applyVat ? "Aplica" : "No aplica"}
                            </Badge>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">
                                        {client.applyVat
                                            ? "Los precios incluyen IVA (21%). Se ha decidido aplicar el impuesto al valor agregado, lo puede desactivar en la configuración."
                                            : "Los precios no incluyen IVA (21%). Los precios no incluyen el impuesto al valor agregado, lo puede activar en la configuración."
                                        }
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {defaultAddress && (
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Dirección Principal:</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>{defaultAddress.street}</p>
                                <p>{defaultAddress.city}, {defaultAddress.province}</p>
                                <p>CP: {defaultAddress.zipCode}</p>
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium">Zona de Envío:</span>
                                <p className="text-sm text-gray-600">{client.shippingZone.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Ganancia aplicada:</span>
                                <p className="text-sm text-gray-600">{client.pricingConfigs.markupPercentage}%</p>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Porcentaje de ganancia aplicado después de aplicar el descuento sobre el precio de lista. Es el precio sugerido para vender.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};