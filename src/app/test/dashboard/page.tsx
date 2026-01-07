"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Avatar } from "../components/ui/avatar"
import { IconButton } from "../components/ui/icon-button"
import { Modal } from "../components/ui/modal"
import { Sheet } from "../components/ui/sheet"
import { FormField } from "../components/ui/form-field"
import { Textarea } from "../components/ui/textarea"
import { Dropdown, DropdownItem, DropdownDivider } from "../components/ui/dropdown"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table"
import { StatCard } from "../components/ui/stat-card"
import { Alert } from "../components/ui/alert"
import { Divider } from "../components/ui/divider"
import { ToastProvider, useToast } from "../components/ui/toast"
import { Progress } from "../components/ui/progress"
import {
  Plus, Search, Filter, MoreVertical, Bell, Settings,
  Users, DollarSign, TrendingUp, Calendar,
  Eye, Edit, Trash2, Download, ChevronRight,
  Home, FileText, CreditCard, MessageSquare,
} from "lucide-react"

const navigation = [
  { name: "Overview", icon: Home, active: true },
  { name: "Payments", icon: CreditCard },
  { name: "Residents", icon: Users },
  { name: "Documents", icon: FileText },
  { name: "Messages", icon: MessageSquare },
  { name: "Settings", icon: Settings },
]

const recentPayments = [
  { id: 1, resident: "Maria Silva", unit: "Apt 101", amount: "85.00", status: "paid", date: "Jan 5" },
  { id: 2, resident: "João Santos", unit: "Apt 203", amount: "85.00", status: "pending", date: "Jan 4" },
  { id: 3, resident: "Ana Costa", unit: "Apt 305", amount: "85.00", status: "paid", date: "Jan 3" },
  { id: 4, resident: "Pedro Lima", unit: "Apt 102", amount: "85.00", status: "late", date: "Jan 2" },
  { id: 5, resident: "Clara Reis", unit: "Apt 401", amount: "85.00", status: "paid", date: "Jan 1" },
]

const upcomingTasks = [
  { id: 1, title: "Monthly meeting", date: "Jan 15", type: "event" },
  { id: 2, title: "Elevator maintenance", date: "Jan 18", type: "maintenance" },
  { id: 3, title: "Payment deadline", date: "Jan 20", type: "deadline" },
]

function Sidebar() {
  return (
    <aside className="w-56 border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <span className="text-[14px] font-semibold text-gray-900">Condominium</span>
      </div>
      <nav className="p-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href="#"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
              item.active
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-[16px] font-semibold text-gray-900">Overview</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input className="w-64 pl-9" placeholder="Search..." size="sm" />
        </div>
        <IconButton icon={<Bell className="h-4 w-4" />} label="Notifications" variant="ghost" size="sm" />
        <Divider className="!mx-2 !h-6 !w-px" />
        <div className="flex items-center gap-2">
          <Avatar size="sm" fallback="AD" alt="Admin" />
          <span className="text-[13px] text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  )
}

function DashboardContent() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showResidentSheet, setShowResidentSheet] = useState(false)
  const { addToast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "late":
        return <Badge variant="error">Late</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <Alert variant="info" className="mb-6" dismissible onDismiss={() => {}}>
        Next monthly meeting scheduled for January 15th at 7:00 PM.
      </Alert>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">Dashboard</h2>
          <p className="text-[13px] text-gray-500">Welcome back. Here is your overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button size="sm" onClick={() => setShowPaymentModal(true)}>
            <Plus className="h-4 w-4" /> New Payment
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Collected"
          value="$12,450"
          change={{ value: "8%", positive: true }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Residents"
          value="48"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Payments"
          value="6"
          change={{ value: "2", positive: false }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="This Month"
          value="$4,250"
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Payments</CardTitle>
                <Button variant="ghost" size="sm">
                  View all <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resident</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm" fallback={payment.resident.charAt(0)} alt={payment.resident} />
                        <span>{payment.resident}</span>
                      </div>
                    </TableCell>
                    <TableCell>{payment.unit}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <Dropdown
                        trigger={<IconButton size="sm" variant="ghost" icon={<MoreVertical className="h-4 w-4" />} label="Actions" />}
                        align="right"
                      >
                        <DropdownItem onClick={() => setShowResidentSheet(true)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownItem>
                        <DropdownItem onClick={() => {}}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownItem>
                        <DropdownItem onClick={() => {}}>
                          <Download className="mr-2 h-4 w-4" /> Download Receipt
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem onClick={() => {}} destructive>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownItem>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-gray-800">{task.title}</p>
                      <p className="text-[11px] text-gray-500">{task.date}</p>
                    </div>
                    <Badge variant={task.type === "deadline" ? "warning" : "default"}>
                      {task.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collection Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-gray-500">January 2025</span>
                    <span className="font-medium text-gray-700">87%</span>
                  </div>
                  <Progress value={87} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-gray-500">December 2024</span>
                    <span className="font-medium text-gray-700">94%</span>
                  </div>
                  <Progress value={94} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-gray-500">November 2024</span>
                    <span className="font-medium text-gray-700">91%</span>
                  </div>
                  <Progress value={91} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
        description="Enter the payment details below."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowPaymentModal(false)
              addToast({ variant: "success", title: "Payment recorded", description: "The payment has been saved." })
            }}>
              Save Payment
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="Resident" required>
            <Select>
              <option value="">Select resident</option>
              <option value="1">Maria Silva - Apt 101</option>
              <option value="2">João Santos - Apt 203</option>
              <option value="3">Ana Costa - Apt 305</option>
            </Select>
          </FormField>
          <FormField label="Amount" required>
            <Input type="number" placeholder="0.00" />
          </FormField>
          <FormField label="Date" required>
            <Input type="date" />
          </FormField>
          <FormField label="Notes">
            <Textarea placeholder="Optional notes..." />
          </FormField>
        </div>
      </Modal>

      <Sheet
        open={showResidentSheet}
        onClose={() => setShowResidentSheet(false)}
        title="Resident Details"
        description="Maria Silva - Apt 101"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar fallback="MS" alt="Maria Silva" />
            <div>
              <p className="text-[14px] font-medium text-gray-900">Maria Silva</p>
              <p className="text-[13px] text-gray-500">maria.silva@email.com</p>
            </div>
          </div>

          <Divider />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">Unit</span>
              <span className="text-[13px] font-medium text-gray-900">Apt 101</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">Status</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">Balance</span>
              <span className="text-[13px] font-medium text-gray-900">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">Member since</span>
              <span className="text-[13px] font-medium text-gray-900">Jan 2023</span>
            </div>
          </div>

          <Divider />

          <div>
            <p className="mb-2 text-[11px] font-medium text-gray-500">RECENT PAYMENTS</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-700">January 2025</span>
                <span className="font-medium text-emerald-600">$85.00</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-700">December 2024</span>
                <span className="font-medium text-emerald-600">$85.00</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-700">November 2024</span>
                <span className="font-medium text-emerald-600">$85.00</span>
              </div>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <DashboardContent />
        </div>
      </div>
    </ToastProvider>
  )
}
