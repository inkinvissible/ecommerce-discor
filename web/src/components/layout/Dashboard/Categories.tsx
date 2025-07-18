import { Category } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Tag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoriesProps {
    categories: Category[];
    loading: boolean;
    error?: Error;
}

const Categories: React.FC<CategoriesProps> = ({ categories, loading, error }) => {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Error al cargar las categorías.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Categorías</CardTitle>
            </CardHeader>
            <CardContent>
                {categories.length === 0 ? (
                    <div className="text-center py-4">
                        <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
                    </div>
                ) : (
                    <div className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <div className="space-y-2 pr-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded transition-colors">
                                    <Tag className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">{category.name.es}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Categories;