"use client"

import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Search, Filter } from "lucide-react"
import { Input } from "./Input"
import { Button } from "./Button"
import { Dropdown, DropdownItem } from "./Dropdown"

interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: {
    label: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
  }[]
  actions?: React.ReactNode
}

export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  ({
    className,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Pesquisar...",
    filters = [],
    actions,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center gap-1.5",
          className
        )}
        {...props}
      >
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-6"
            />
          </div>
        )}

        {/* Filter Dropdowns */}
        {filters.map((filter, idx) => (
          <Dropdown
            key={idx}
            trigger={
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">
                  {filter.options.find((o) => o.value === filter.value)?.label || filter.label}
                </span>
              </Button>
            }
          >
            {filter.options.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => filter.onChange(option.value)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>
        ))}

        {/* Additional Actions */}
        {actions}
      </div>
    )
  }
)

FilterBar.displayName = "FilterBar"

// Simple Search Bar
interface SearchBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export const SearchBar = forwardRef<HTMLDivElement, SearchBarProps>(
  ({
    className,
    value,
    onChange,
    placeholder = "Pesquisar...",
    ...props
  }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="pl-6"
        />
      </div>
    )
  }
)

SearchBar.displayName = "SearchBar"

// Filter Button Group
interface FilterButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

export const FilterButtonGroup = forwardRef<HTMLDivElement, FilterButtonGroupProps>(
  ({ className, options, value, onChange, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex gap-1", className)} {...props}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "primary" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    )
  }
)

FilterButtonGroup.displayName = "FilterButtonGroup"
