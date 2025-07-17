// src/components/layout/Configuration/MarkupSettings.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Percent, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { MarkupResponse } from '@/types/configuration';

interface MarkupSettingsProps {
    currentValue: number;
    onUpdate: (markupPercentage: number) => Promise<MarkupResponse>;
}

export const MarkupSettings = ({ currentValue, onUpdate }: MarkupSettingsProps) => {
    const [markupPercentage, setMarkupPercentage] = useState(currentValue);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (markupPercentage < 0 || markupPercentage > 100) {
            toast.error("El porcentaje de markup debe estar entre 0 y 100");
            return;
        }

        setIsLoading(true);
        try {
            const response = await onUpdate(markupPercentage);
            toast.success(response.message);
        } catch (error) {
            console.error('Error updating markup:', error);
            toast.error("No se pudo actualizar el porcentaje de markup");
            setMarkupPercentage(currentValue);
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = markupPercentage !== currentValue;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Configuración de Margen de ganancia
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Define el porcentaje de ganancia que se aplicará sobre el costo de los productos.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Label htmlFor="markup-percentage">Porcentaje de Ganancia (%)</Label>
                    <div className="relative">
                        <Input
                            id="markup-percentage"
                            type="number"
                            value={markupPercentage}
                            onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                            min="0"
                            max="100"
                            step="0.1"
                            className="pr-8"
                            disabled={isLoading}
                        />
                        <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                        Ganancia actual: {currentValue}%
                    </p>
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