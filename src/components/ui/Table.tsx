import { forwardRef, memo, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const TableComponent = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn("w-full border-collapse text-body", className)}
        {...props}
      />
    </div>
  )
)
TableComponent.displayName = "Table"

const TableHeaderComponent = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("border-b border-gray-200 bg-gray-50", className)} {...props} />
  )
)
TableHeaderComponent.displayName = "TableHeader"

const TableBodyComponent = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-100", className)} {...props} />
  )
)
TableBodyComponent.displayName = "TableBody"

const TableRowComponent = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("transition-colors hover:bg-gray-50", className)} {...props} />
  )
)
TableRowComponent.displayName = "TableRow"

const TableHeadComponent = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-1.5 py-1 text-left text-label font-medium uppercase tracking-wide text-gray-500",
        className
      )}
      {...props}
    />
  )
)
TableHeadComponent.displayName = "TableHead"

const TableCellComponent = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("px-1.5 py-1 text-gray-700", className)} {...props} />
  )
)
TableCellComponent.displayName = "TableCell"

export const Table = memo(TableComponent)
export const TableHeader = memo(TableHeaderComponent)
export const TableBody = memo(TableBodyComponent)
export const TableRow = memo(TableRowComponent)
export const TableHead = memo(TableHeadComponent)
export const TableCell = memo(TableCellComponent)
