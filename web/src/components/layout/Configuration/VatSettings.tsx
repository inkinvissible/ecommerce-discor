// src/components/layout/Configuration/VatSettings.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Receipt, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { VatSettingResponse } from '@/types/configuration';

interface VatSettingsProps {
    currentValue: boolean;
    onUpdate: (hasVat: boolean) => Promise<VatSettingResponse>;
}

export const VatSettings = ({ currentValue, onUpdate }: VatSettingsProps) => {
    const [hasVat, setHasVat] = useState(currentValue);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await onUpdate(hasVat);
            toast.success(response.message);
        } catch (error) {
            console.error('Error updating VAT setting:', error);
            toast.error("No se pudo actualizar la configuración de IVA");
            setHasVat(currentValue);
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = hasVat !== currentValue;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Configuración de IVA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Esta configuración determina si los precios incluyen IVA en tu tienda.
                    </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="vat-setting">Aplicar IVA</Label>
                        <p className="text-sm text-gray-600">
                            {hasVat
                                ? "Los precios incluyen IVA (21%)"
                                : "Los precios no incluyen IVA"
                            }
                        </p>
                    </div>
                    <Switch
                        id="vat-setting"
                        checked={hasVat}
                        onCheckedChange={setHasVat}
                        disabled={isLoading}
                    />
                </div>

                {hasChanges && (
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            size="sm"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar cambios
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};