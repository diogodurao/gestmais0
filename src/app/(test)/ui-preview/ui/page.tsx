import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table"
import { ProgressBar } from "@/components/ui/ProgressBar"

const selectOptions = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
]

export default function UIComponentsPage() {
    return (
        <div className="space-y-6">
            {/* Buttons */}
            <section className="tech-border bg-white p-4">
                <h2 className="text-body font-bold text-slate-600 uppercase tracking-wider mb-3">Buttons</h2>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm">Primary</Button>
                    <Button size="sm" variant="secondary">Secondary</Button>
                    <Button size="sm" variant="outline">Outline</Button>
                    <Button size="sm" variant="ghost">Ghost</Button>
                    <Button size="sm" disabled>Disabled</Button>
                    <Button size="sm" isLoading>Loading</Button>
                </div>
            </section>

            {/* Form Inputs */}
            <section className="tech-border bg-white p-4">
                <h2 className="text-body font-bold text-slate-600 uppercase tracking-wider mb-3">Forms</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="Text input..." />
                    <Select options={selectOptions} placeholder="Select..." />
                    <Input type="number" placeholder="0" />
                </div>
            </section>

            {/* Badges */}
            <section className="tech-border bg-white p-4">
                <h2 className="text-body font-bold text-slate-600 uppercase tracking-wider mb-3">Badges</h2>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral" dot>Default</Badge>
                    <Badge variant="success" dot>Success</Badge>
                    <Badge variant="warning" dot>Warning</Badge>
                    <Badge variant="danger" dot>Error</Badge>
                </div>
            </section>

            {/* Cards */}
            <section className="tech-border bg-white p-4">
                <h2 className="text-body font-bold text-slate-600 uppercase tracking-wider mb-3">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-body text-slate-500">Card content goes here.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>With Footer</CardTitle>
                            <Badge variant="neutral" size="xs">Tag</Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-body text-slate-500">Content area.</p>
                        </CardContent>
                        <CardFooter>Footer text</CardFooter>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-body text-slate-500">Simple card without header.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Progress */}
            <section className="tech-border bg-white p-4">
                <h2 className="text-body font-bold text-slate-600 uppercase tracking-wider mb-3">Progress</h2>
                <div className="space-y-3 max-w-md">
                    <ProgressBar value={25} max={100} size="sm" />
                    <ProgressBar value={50} max={100} size="sm" />
                    <ProgressBar value={75} max={100} size="sm" />
                    <ProgressBar value={100} max={100} size="sm" variant="success" />
                </div>
            </section>

            {/* Table */}
            <section className="tech-border bg-white p-4">
                <h2 className="text-body font-bold text-slate-600 uppercase tracking-wider mb-3">Table</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Item A</TableCell>
                            <TableCell><Badge variant="success" size="xs" dot>Active</Badge></TableCell>
                            <TableCell mono>€1,234</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Item B</TableCell>
                            <TableCell><Badge variant="warning" size="xs" dot>Pending</Badge></TableCell>
                            <TableCell mono>€567</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
        </div>
    )
}
