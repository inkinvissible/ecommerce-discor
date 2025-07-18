// src/components/layout/Cart/CheckoutForm.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { OrderType, TimeOfDay, OrderInfo } from '@/types/order';
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Truck, Package, Calendar as CalendarIcon, AlertCircle, FileText } from 'lucide-react';

interface CheckoutFormProps {
    onSubmit: (orderInfo: OrderInfo) => void;
}

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
    const [orderType, setOrderType] = useState<OrderType>('PICKUP');
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>();
    const [isUrgent, setIsUrgent] = useState(false);
    const [shippingNotes, setShippingNotes] = useState('');
    const { profile, isLoading, isError } = useProfile();
    const defaultAddress = profile?.client.addresses.find(addr => addr.isDefaultShipping);
    const userAddress = defaultAddress?.street

    const buildShippingMessage = () => {
        const messages = [];

        // Tipo de pedido
        messages.push(`TIPO DE PEDIDO: ${orderType === 'PICKUP' ? 'Retirar en local' : 'Entrega a domicilio'}`);

        // Dirección si es delivery
        if (orderType === 'DELIVERY' && userAddress) {
            messages.push(`DIRECCIÓN: ${userAddress}`);
        }

        // Urgencia
        if (isUrgent) {
            messages.push('PEDIDO URGENTE: Procesar lo antes posible');
        } else {
            // Fecha y hora si no es urgente
            if (selectedDate) {
                const formattedDate = selectedDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                messages.push(`FECHA: ${formattedDate}`);
            }

            if (timeOfDay) {
                const timeLabels = {
                    morning: 'Mañana (9:00 - 11:00)',
                    afternoon: 'Mediodía (11:00 - 14:00)',
                    evening: 'Tarde (14:00 - 17:00)'
                };
                messages.push(`HORARIO: ${timeLabels[timeOfDay]}`);
            }
        }

        // Notas adicionales
        if (shippingNotes.trim()) {
            messages.push(`NOTAS: ${shippingNotes.trim()}`);
        }

        return messages.join('\n');
    };

    const handleSubmit = () => {
        const orderInfo: OrderInfo = {
            type: orderType,
            date: !isUrgent ? selectedDate : undefined,
            timeOfDay: !isUrgent ? timeOfDay : undefined,
            isUrgent,
            deliveryAddress: orderType === 'DELIVERY' ? userAddress : undefined,
            shippingNotes: buildShippingMessage()
        };

        onSubmit(orderInfo);
    };

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg border-red-200">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span>Error al cargar la información del perfil.</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isFormValid = orderType && (isUrgent || selectedDate);

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-green-50 to-gray-50 rounded-t-lg border-b border-green-100">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2 mt-6">
                    <Package className="h-6 w-6 text-primary" />
                    <span>Información del Pedido</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Tipo de pedido */}
                <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <span>Tipo de pedido *</span>
                    </Label>
                    <RadioGroup
                        value={orderType}
                        onValueChange={(value) => setOrderType(value as OrderType)}
                        className="space-y-3"
                    >
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            orderType === 'PICKUP'
                                ? 'border-primary bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}>
                            <RadioGroupItem value="PICKUP" id="pickup" className="text-primary" />
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-gray-600" />
                                <Label htmlFor="pickup" className="font-medium text-gray-700 cursor-pointer">
                                    Retirar en local
                                </Label>
                            </div>
                        </div>
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            orderType === 'DELIVERY'
                                ? 'border-primary bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}>
                            <RadioGroupItem value="DELIVERY" id="delivery" className="text-primary" />
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-gray-600" />
                                <Label htmlFor="delivery" className="font-medium text-gray-700 cursor-pointer">
                                    Entrega a domicilio
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                {/* Dirección de entrega */}
                {orderType === 'DELIVERY' && userAddress && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <Label className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>Dirección de entrega</span>
                        </Label>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                <p className="text-sm font-medium text-green-800">{userAddress}</p>
                            </div>
                        </div>
                    </div>
                )}

                <Separator className="my-6 bg-gray-200" />

                {/* Pedido urgente */}
                <div className="space-y-4">
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                        isUrgent
                            ? 'border-orange-500 bg-orange-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}>
                        <Checkbox
                            id="urgent"
                            checked={isUrgent}
                            onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
                            className="border-orange-500 text-orange-600"
                        />
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <Label htmlFor="urgent" className="font-medium text-gray-700 cursor-pointer">
                                Pedido urgente
                            </Label>
                        </div>
                    </div>
                    {isUrgent && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 animate-in slide-in-from-top-2 duration-300">
                            <p className="text-sm text-orange-800">
                                <strong>Nota:</strong> Los pedidos urgentes se procesarán lo antes posible dentro del horario de atención.
                            </p>
                        </div>
                    )}
                </div>

                {/* Fecha y hora (solo si no es urgente) */}
                {!isUrgent && (
                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                <span>Fecha de entrega *</span>
                            </Label>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={(date) => date < new Date()}
                                    className="rounded-md border-0 bg-white shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span>Momento del día</span>
                            </Label>
                            <RadioGroup
                                value={timeOfDay}
                                onValueChange={(value) => setTimeOfDay(value as TimeOfDay)}
                                className="space-y-3"
                            >
                                <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                    timeOfDay === 'morning'
                                        ? 'border-primary bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <RadioGroupItem value="morning" id="morning" className="text-primary" />
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <Label htmlFor="morning" className="font-medium text-gray-700 cursor-pointer">
                                            Mañana (9:00 - 11:00)
                                        </Label>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                    timeOfDay === 'afternoon'
                                        ? 'border-primary bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <RadioGroupItem value="afternoon" id="afternoon" className="text-primary" />
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <Label htmlFor="afternoon" className="font-medium text-gray-700 cursor-pointer">
                                            Mediodía (11:00 - 14:00)
                                        </Label>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                    timeOfDay === 'evening'
                                        ? 'border-primary bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <RadioGroupItem value="evening" id="evening" className="text-primary" />
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <Label htmlFor="evening" className="font-medium text-gray-700 cursor-pointer">
                                            Tarde (14:00 - 17:00)
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                )}

                <Separator className="my-6 bg-gray-200" />

                {/* Campo de notas adicionales */}
                <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Notas adicionales</span>
                    </Label>
                    <Textarea
                        placeholder="Ingresa cualquier información adicional para tu pedido..."
                        value={shippingNotes}
                        onChange={(e) => setShippingNotes(e.target.value)}
                        rows={4}
                        className="resize-none border-gray-200 focus:border-primary focus:ring-primary"
                    />
                    <p className="text-sm text-gray-500">
                        Ejemplo: Preferencias de horario, instrucciones especiales, etc.
                    </p>
                </div>

                <div className="pt-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className={`w-full h-12 text-lg font-semibold transition-all ease-in-out duration-500 ${
                            isFormValid
                                ? 'bg-gradient-to-r from-primary to-gray-800 hover:from-green-700 hover:to-gray-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isFormValid ? (
                            <span className="flex items-center space-x-2">
                                <Package className="h-5 w-5" />
                                <span>Confirmar Pedido</span>
                            </span>
                        ) : (
                            'Completa la información requerida'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}