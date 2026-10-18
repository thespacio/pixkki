// components/shelters/AdminSkeleton.tsx
// Esqueleto de carga para la lista de albergues

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ShelterSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                        <div className="flex space-x-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-16" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}