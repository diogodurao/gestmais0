import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

// ===========================================
// TABLE ROOT
// ===========================================
const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div className="w-full overflow-auto">
                <table
                    ref={ref}
                    className={cn("w-full caption-bottom text-[11px]", className)}
                    {...props}
                />
            </div>
        )
    }
)
Table.displayName = "Table"

// ===========================================
// TABLE HEADER
// ===========================================
const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => {
        return (
            <thead
                ref={ref}
                className={cn("bg-slate-50 border-b border-slate-300", className)}
                {...props}
            />
        )
    }
)
TableHeader.displayName = "TableHeader"

// ===========================================
// TABLE BODY
// ===========================================
const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => {
        return (
            <tbody
                ref={ref}
                className={cn("[&_tr:last-child]:border-0", className)}
                {...props}
            />
        )
    }
)
TableBody.displayName = "TableBody"

// ===========================================
// TABLE FOOTER
// ===========================================
const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => {
        return (
            <tfoot
                ref={ref}
                className={cn("bg-slate-50 border-t border-slate-300 font-bold", className)}
                {...props}
            />
        )
    }
)
TableFooter.displayName = "TableFooter"

// ===========================================
// TABLE ROW
// ===========================================
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
    hoverable?: boolean
    selected?: boolean
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
    ({ className, hoverable = true, selected, ...props }, ref) => {
        return (
            <tr
                ref={ref}
                className={cn(
                    "border-b border-slate-200 transition-colors",
                    {
                        "hover:bg-slate-50/50": hoverable,
                        "bg-blue-50/30": selected,
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
TableRow.displayName = "TableRow"

// ===========================================
// TABLE HEAD (TH)
// ===========================================
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
    sortable?: boolean
    sorted?: "asc" | "desc" | false
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
    ({ className, sortable, sorted, children, ...props }, ref) => {
        return (
            <th
                ref={ref}
                className={cn(
                    "h-8 px-3 text-left align-middle font-bold text-slate-500 uppercase tracking-wider text-[9px]",
                    "[&:has([role=checkbox])]:pr-0",
                    sortable && "cursor-pointer hover:text-slate-700 select-none",
                    className
                )}
                {...props}
            >
                <div className="flex items-center gap-1">
                    {children}
                    {sorted === "asc" && <span className="text-[8px]">↑</span>}
                    {sorted === "desc" && <span className="text-[8px]">↓</span>}
                </div>
            </th>
        )
    }
)
TableHead.displayName = "TableHead"

// ===========================================
// TABLE CELL (TD)
// ===========================================
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
    mono?: boolean
    muted?: boolean
    truncate?: boolean
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
    ({ className, mono, muted, truncate, ...props }, ref) => {
        return (
            <td
                ref={ref}
                className={cn(
                    "h-10 px-3 align-middle text-slate-700",
                    "[&:has([role=checkbox])]:pr-0",
                    {
                        "font-mono text-[10px] tracking-tight": mono,
                        "text-slate-400": muted,
                        "max-w-[200px] truncate": truncate,
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
TableCell.displayName = "TableCell"

// ===========================================
// TABLE CAPTION
// ===========================================
const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, ...props }, ref) => {
        return (
            <caption
                ref={ref}
                className={cn("mt-2 text-[10px] text-slate-400", className)}
                {...props}
            />
        )
    }
)
TableCaption.displayName = "TableCaption"

// ===========================================
// EMPTY STATE
// ===========================================
interface TableEmptyProps extends HTMLAttributes<HTMLTableRowElement> {
    colSpan: number
    icon?: React.ReactNode
    title?: string
    description?: string
}

const TableEmpty = forwardRef<HTMLTableRowElement, TableEmptyProps>(
    ({ className, colSpan, icon, title = "No data", description, ...props }, ref) => {
        return (
            <tr ref={ref} className={className} {...props}>
                <td colSpan={colSpan} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        {icon && <div className="w-8 h-8">{icon}</div>}
                        <div className="text-[11px] font-bold uppercase tracking-wider">{title}</div>
                        {description && <div className="text-[10px]">{description}</div>}
                    </div>
                </td>
            </tr>
        )
    }
)
TableEmpty.displayName = "TableEmpty"

export { 
    Table, 
    TableHeader, 
    TableBody, 
    TableFooter, 
    TableRow, 
    TableHead, 
    TableCell, 
    TableCaption,
    TableEmpty 
}