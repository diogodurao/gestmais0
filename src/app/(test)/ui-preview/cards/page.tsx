import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { TrendingUp, Users, DollarSign, Activity, Settings, MoreVertical } from "lucide-react"

export default function CardsPage() {
    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Cards
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Card component compositions and StatCard variants.
                </p>
            </div>

            {/* Basic Card */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Basic Card
                    </h2>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Simple Card */}
                        <Card>
                            <CardContent>
                                <p className="text-content text-slate-600">
                                    Simple card with just content. No header or footer.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card with Header */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Card Title</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-content text-slate-600">
                                    Card with header and content sections.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Full Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Full Card</CardTitle>
                                <Badge variant="success" size="xs">Active</Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-content text-slate-600">
                                    Card with header, content, and footer.
                                </p>
                            </CardContent>
                            <CardFooter>
                                Last updated: 2 hours ago
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Card with Actions */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Card with Actions
                    </h2>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Settings</CardTitle>
                                <Button variant="ghost" size="xs">
                                    <Settings className="w-3 h-3" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-content text-slate-600">
                                    Configure your project settings and preferences.
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">Cancel</Button>
                                <Button size="sm">Save Changes</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <Button variant="ghost" size="xs">
                                    <MoreVertical className="w-3 h-3" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" fullWidth>Action 1</Button>
                                <Button variant="outline" size="sm" fullWidth>Action 2</Button>
                                <Button variant="outline" size="sm" fullWidth>Action 3</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Card with Progress */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Card with Progress
                    </h2>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-body">
                                    <span className="text-slate-600">Completed</span>
                                    <span className="font-bold text-slate-800">7/10</span>
                                </div>
                                <ProgressBar value={70} max={100} variant="auto" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Storage Used</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-body">
                                    <span className="text-slate-600">45 GB of 100 GB</span>
                                    <span className="font-bold text-slate-800">45%</span>
                                </div>
                                <ProgressBar value={45} max={100} variant="warning" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Budget</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-body">
                                    <span className="text-slate-600">€8,500 / €10,000</span>
                                    <span className="font-bold text-slate-800">85%</span>
                                </div>
                                <ProgressBar value={85} max={100} variant="danger" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* StatCard */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        StatCard Component
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    {/* Variants */}
                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-3">Semantic Variants</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <StatCard
                                label="Revenue"
                                value="€12,450"
                                subValue="+12%"
                                variant="success"
                                icon={DollarSign}
                            />
                            <StatCard
                                label="Pending"
                                value="23"
                                subValue="tasks"
                                variant="warning"
                                icon={Activity}
                            />
                            <StatCard
                                label="Overdue"
                                value="5"
                                subValue="items"
                                variant="danger"
                                icon={TrendingUp}
                            />
                            <StatCard
                                label="Active"
                                value="142"
                                subValue="users"
                                variant="info"
                                icon={Users}
                            />
                            <StatCard
                                label="Total"
                                value="1,234"
                                subValue="records"
                                variant="neutral"
                            />
                        </div>
                    </div>

                    {/* Sizes */}
                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-3">Sizes</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard
                                label="Extra Small"
                                value="123"
                                size="xs"
                                variant="neutral"
                            />
                            <StatCard
                                label="Small"
                                value="456"
                                size="sm"
                                variant="neutral"
                            />
                            <StatCard
                                label="Medium"
                                value="789"
                                size="md"
                                variant="neutral"
                            />
                            <StatCard
                                label="Large"
                                value="1,012"
                                size="lg"
                                variant="neutral"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Grid Layouts */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Common Grid Layouts
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-3">
                            Stats Row (4 columns)
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <StatCard label="Total Users" value="1,234" variant="neutral" icon={Users} />
                            <StatCard label="Revenue" value="€45,678" variant="success" icon={DollarSign} />
                            <StatCard label="Active" value="89%" variant="info" icon={Activity} />
                            <StatCard label="Growth" value="+12%" variant="success" icon={TrendingUp} />
                        </div>
                    </div>

                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-3">
                            Content Cards (3 columns)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <CardTitle>Card {i}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-content text-slate-600">
                                            Sample content for card {i}. This demonstrates a common 3-column layout.
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
