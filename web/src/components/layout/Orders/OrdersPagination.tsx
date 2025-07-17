// src/components/layout/Orders/OrdersPagination.tsx
interface OrdersPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const OrdersPagination: React.FC<OrdersPaginationProps> = ({
                                                                      currentPage,
                                                                      totalPages,
                                                                      onPageChange
                                                                  }) => {
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            const end = Math.min(totalPages, start + maxVisible - 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Anterior
            </button>

            {getPageNumbers().map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Siguiente
            </button>
        </div>
    );
};