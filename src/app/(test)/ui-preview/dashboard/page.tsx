"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table"
import { StatCard } from "@/components/ui/StatCard"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Modal } from "@/components/ui/Modal"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown"
import { Plus, Search, MoreVertical, Edit, Trash2, Users, TrendingUp, Activity } from "lucide-react"

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
]

const tableData = [
    { id: 1, name: "Project Alpha", status: "active", value: "€12,500", progress: 75 },
    { id: 2, name: "Project Beta", status: "pending", value: "€8,200", progress: 30 },
    { id: 3, name: "Project Gamma", status: "active", value: "€15,000", progress: 100 },
]

export default function DashboardPreviewPage() {
    const [modal, setModal] = useState(false)

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-heading font-bold text-slate-800 uppercase tracking-tight">Dashboard</h1>
                <Button size="sm" onClick={() => setModal(true)}>
                    <Plus className="w-3 h-3" /> New Item
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total" value="1,234" variant="neutral" size="sm" />
                <StatCard label="Active" value="89" variant="success" icon={Activity} size="sm" />
                <StatCard label="Users" value="256" variant="info" icon={Users} size="sm" />
                <StatCard label="Growth" value="+12%" variant="success" icon={TrendingUp} size="sm" />
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-3">
                    <div className="flex flex-wrap gap-2">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="Search..." className="pl-8" />
                            </div>
                        </div>
                        <Select options={statusOptions} defaultValue="all" size="md" />
                        <Button variant="outline" size="sm">Filter</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Table */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Projects</CardTitle>
                            <Badge variant="neutral" size="xs">{tableData.length} items</Badge>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={row.status === "active" ? "success" : "warning"}
                                                size="xs"
                                                dot
                                            >
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell mono>{row.value}</TableCell>
                                        <TableCell>
                                            <div className="w-20">
                                                <ProgressBar value={row.progress} max={100} size="xs" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Dropdown>
                                                <DropdownTrigger className="p-1 hover:bg-slate-100 rounded-sm">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </DropdownTrigger>
                                                <DropdownContent align="end">
                                                    <DropdownItem icon={<Edit className="w-4 h-4" />}>Edit</DropdownItem>
                                                    <DropdownSeparator />
                                                    <DropdownItem icon={<Trash2 className="w-4 h-4" />} destructive>Delete</DropdownItem>
                                                </DropdownContent>
                                            </Dropdown>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <CardFooter className="flex justify-between">
                            <span>Showing 3 of 3</span>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="xs" disabled>Prev</Button>
                                <Button variant="ghost" size="xs" disabled>Next</Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" size="sm" fullWidth>Create Project</Button>
                            <Button variant="outline" size="sm" fullWidth>Import Data</Button>
                            <Button variant="outline" size="sm" fullWidth>Export Report</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-2 text-body">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-slate-600">Activity item {i}</p>
                                        <p className="text-micro text-slate-400">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title="New Item" size="sm">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-label font-bold text-slate-500 uppercase">Name</label>
                        <Input placeholder="Enter name..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-label font-bold text-slate-500 uppercase">Status</label>
                        <Select options={statusOptions} placeholder="Select status..." fullWidth />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setModal(false)}>Cancel</Button>
                        <Button size="sm" onClick={() => setModal(false)}>Create</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
