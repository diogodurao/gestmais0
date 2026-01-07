import { forwardRef, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn("w-full border-collapse text-[13px]", className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = "Table"

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("border-b border-gray-200 bg-gray-50", className)} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-100", className)} {...props} />
  )
)
TableBody.displayName = "TableBody"

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("transition-colors hover:bg-gray-50", className)} {...props} />
  )
)
TableRow.displayName = "TableRow"

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500",
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = "TableHead"

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("px-3 py-2 text-gray-700", className)} {...props} />
  )
)
TableCell.displayName = "TableCell"
