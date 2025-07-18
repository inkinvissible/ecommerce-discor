import { Skeleton } from "@/components/ui/skeleton";

export function CartLoading() {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="md:col-span-1">
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
}