// src/components/features/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react";

interface LoginFormProps {
    onSubmit: (data: { username: string; password: string }) => void;
    isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Código de Cliente
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Ingresa tu código de cliente"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                        )}
                    </Button>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                    </>
                ) : (
                    "Iniciar Sesión"
                )}
            </Button>
        </form>
    );
};