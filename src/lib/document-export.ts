/**
 * Document Export Utilities
 * Handles PDF and Excel (CSV) exports for the dashboard
 */

/**
 * Basic PDF export using browser's print functionality
 */
export async function exportExtraPaymentsToPDF<T extends Record<string, unknown>>(
    title: string,
    buildingName: string,
    totalBudget: number,
    data: T[]
) {


    // In a production environment, we would use libraries like jspdf and jspdf-autotable here.
    // For now, we trigger the browser's print dialog as a fallback.
    if (typeof window !== "undefined") {
        window.print();
    }
}

/**
 * Basic Excel export using CSV format
 */
export async function exportToExcel<T extends Record<string, unknown>>({
    filename,
    title,
    columns,
    data,
}: {
    filename: string;
    title: string;
    columns: Array<{ header: string; key: keyof T & string; format?: "currency" }>;
    data: T[];
}) {


    if (typeof window === "undefined") return;

    // Generate CSV content
    const headers = columns.map(col => `"${col.header}"`).join(",");
    const rows = data.map(item => {
        return columns.map(col => {
            const value = item[col.key];

            if (value === null || value === undefined) return '""';

            if (col.format === "currency") {
                // Simplified currency formatting for CSV (value is in cents)
                const numValue = typeof value === 'number' ? value : Number(value);
                return (isNaN(numValue) ? "0.00" : (numValue / 100).toFixed(2));
            }

            if (typeof value === "string") {
                return `"${value.replace(/"/g, '""')}"`;
            }

            return value;
        }).join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

