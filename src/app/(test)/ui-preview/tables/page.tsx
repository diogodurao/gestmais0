import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
    TableEmpty
} from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Edit, Trash2, MoreVertical, FileQuestion } from "lucide-react"

const sampleData = [
    { id: 1, name: "Project Alpha", status: "active", budget: "€12,500", progress: 75 },
    { id: 2, name: "Project Beta", status: "pending", budget: "€8,200", progress: 30 },
    { id: 3, name: "Project Gamma", status: "completed", budget: "€15,000", progress: 100 },
    { id: 4, name: "Project Delta", status: "paused", budget: "€6,800", progress: 45 },
]

export default function TablesPage() {
    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Tables
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Table components for displaying data in rows and columns.
                </p>
            </div>

            {/* Basic Table */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Basic Table
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Progress</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sampleData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                row.status === "active" ? "success" :
                                                row.status === "pending" ? "warning" :
                                                row.status === "completed" ? "info" : "neutral"
                                            }
                                            size="xs"
                                            dot
                                        >
                                            {row.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell mono>{row.budget}</TableCell>
                                    <TableCell>{row.progress}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Table with Footer */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Table with Footer
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Product A</TableCell>
                                <TableCell mono>10</TableCell>
                                <TableCell mono>€25.00</TableCell>
                                <TableCell mono>€250.00</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Product B</TableCell>
                                <TableCell mono>5</TableCell>
                                <TableCell mono>€40.00</TableCell>
                                <TableCell mono>€200.00</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Product C</TableCell>
                                <TableCell mono>3</TableCell>
                                <TableCell mono>€100.00</TableCell>
                                <TableCell mono>€300.00</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3}>Total</TableCell>
                                <TableCell mono>€750.00</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>

            {/* Table with Actions */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Table with Actions
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sampleData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell mono muted>#{row.id}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={row.status === "active" ? "success" : "neutral"}
                                            size="xs"
                                        >
                                            {row.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="xs">
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button variant="ghost" size="xs">
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                            <Button variant="ghost" size="xs">
                                                <MoreVertical className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Sortable Table */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Sortable Headers
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead sortable sorted="asc">Name</TableHead>
                                <TableHead sortable>Status</TableHead>
                                <TableHead sortable sorted="desc">Budget</TableHead>
                                <TableHead sortable>Progress</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sampleData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell mono>{row.budget}</TableCell>
                                    <TableCell>{row.progress}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Selected Row */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Row States
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>State</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Normal Row</TableCell>
                                <TableCell muted>hoverable=true (default)</TableCell>
                            </TableRow>
                            <TableRow selected>
                                <TableCell>Selected Row</TableCell>
                                <TableCell muted>selected=true</TableCell>
                            </TableRow>
                            <TableRow hoverable={false}>
                                <TableCell>Non-hoverable Row</TableCell>
                                <TableCell muted>hoverable=false</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Cell Variants */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Cell Variants
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Example</TableHead>
                                <TableHead>Props</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Default</TableCell>
                                <TableCell>Regular text content</TableCell>
                                <TableCell muted>(none)</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Mono</TableCell>
                                <TableCell mono>€1,234.56</TableCell>
                                <TableCell muted>mono=true</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Muted</TableCell>
                                <TableCell muted>Secondary information</TableCell>
                                <TableCell muted>muted=true</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Truncate</TableCell>
                                <TableCell truncate>This is a very long text that will be truncated when it exceeds the maximum width</TableCell>
                                <TableCell muted>truncate=true</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Empty State */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Empty State
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Budget</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableEmpty
                                colSpan={3}
                                icon={<FileQuestion className="w-8 h-8" />}
                                title="No projects found"
                                description="Create a new project to get started"
                            />
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Table with Caption */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Table with Caption
                    </h2>
                </div>
                <div className="p-4">
                    <Table>
                        <TableCaption>A list of recent projects and their status.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Project Alpha</TableCell>
                                <TableCell>Active</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Project Beta</TableCell>
                                <TableCell>Pending</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* CSS Cell Classes */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        CSS Cell Classes (globals.css)
                    </h2>
                </div>
                <div className="p-4">
                    <p className="text-body text-slate-600 mb-4">
                        Legacy spreadsheet-style cell classes from globals.css.
                    </p>
                    <div className="border border-slate-300">
                        <div className="grid grid-cols-4">
                            <div className="header-cell">.header-cell</div>
                            <div className="header-cell">.header-cell</div>
                            <div className="header-cell">.header-cell</div>
                            <div className="header-cell border-r-0">.header-cell</div>
                        </div>
                        <div className="grid grid-cols-4">
                            <div className="data-cell">.data-cell</div>
                            <div className="data-cell">.data-cell</div>
                            <div className="data-cell">.data-cell</div>
                            <div className="data-cell border-r-0">.data-cell</div>
                        </div>
                        <div className="grid grid-cols-4">
                            <div className="data-cell border-b-0">.data-cell</div>
                            <div className="data-cell border-b-0">.data-cell</div>
                            <div className="data-cell border-b-0">.data-cell</div>
                            <div className="data-cell border-b-0 border-r-0">.data-cell</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
