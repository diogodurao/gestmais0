"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Avatar } from "../../../components/ui/avatar"
import { IconButton } from "../components/ui/icon-button"
import { Modal } from "../components/ui/modal"
import { Sheet } from "../components/ui/sheet"
import { Drawer } from "../components/ui/drawer"
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
  Plus, Filter, MoreVertical, Menu, X,
  Users, DollarSign, TrendingUp, Calendar,
  Eye, Edit, Trash2, Download, ChevronRight,
  Home, FileText, CreditCard, MessageSquare, Settings,
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

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-[#F8F8F6] border-r border-[#E9ECEF] p-1.5">
        <div className="flex h-10 items-center justify-between px-1.5">
          <span className="text-[11px] font-semibold text-[#495057]">Condominium</span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-1.5 space-y-0.5">
          {navigation.map((item) => (
            <a
              key={item.name}
              href="#"
              onClick={onClose}
              className={`flex items-center gap-2 rounded px-1.5 py-1.5 text-[10px] transition-colors ${item.active
                ? "bg-[#E8F0EA] font-medium text-[#6A9B72]"
                : "text-[#6C757D] hover:bg-[#E9ECEF]"
                }`}
            >
              <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={`hidden lg:flex flex-col rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] transition-all duration-200 ${collapsed ? "w-12" : "w-48"
        }`}
    >
      <div className="flex h-10 items-center justify-between px-1.5">
        {!collapsed && (
          <span className="text-[11px] font-semibold text-[#495057]">Condominium</span>
        )}
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF]"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 px-1.5 py-1.5">
        {navigation.map((item) => (
          <a
            key={item.name}
            href="#"
            className={`flex items-center gap-2 rounded px-1.5 py-1.5 text-[10px] transition-colors ${item.active
              ? "bg-[#E8F0EA] font-medium text-[#6A9B72]"
              : "text-[#6C757D] hover:bg-[#E9ECEF]"
              }`}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
            {!collapsed && item.name}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-10 items-center justify-between rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] px-1.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={onMenuClick}
          className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="text-[12px] font-medium text-[#495057]">Overview</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Avatar size="sm" fallback="AD" alt="Admin" />
      </div>
    </header>
  )
}

function DashboardContent() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showResidentSheet, setShowResidentSheet] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
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

  const handleNewPayment = () => {
    // On mobile, use drawer; on desktop, use modal
    if (window.innerWidth < 640) {
      setShowMobileDrawer(true)
    } else {
      setShowPaymentModal(true)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border border-[#E9ECEF] bg-white p-1.5">
      <Alert variant="info" className="mb-1.5" dismissible onDismiss={() => { }}>
        Next monthly meeting scheduled for January 15th at 7:00 PM.
      </Alert>

      <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-[#343A40]">Dashboard</h2>
          <p className="text-[10px] text-[#8E9AAF]">Welcome back. Here is your overview.</p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="h-3 w-3" /> <span className="hidden xs:inline">Filter</span>
          </Button>
          <Button size="sm" onClick={handleNewPayment} className="flex-1 sm:flex-none">
            <Plus className="h-3 w-3" /> <span className="hidden xs:inline">New Payment</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - responsive */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Total Collected"
          value="$12,450"
          change={{ value: "8%", positive: true }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Residents"
          value="48"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Pending Payments"
          value="6"
          change={{ value: "2", positive: false }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="This Month"
          value="$4,250"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Main content grid - stack on mobile */}
      <div className="grid gap-1.5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Payments</CardTitle>
                <Button variant="ghost" size="sm">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>

            {/* Desktop Table */}
            <div className="hidden sm:block">
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
                        <div className="flex items-center gap-1.5">
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
                          trigger={<IconButton size="sm" variant="ghost" icon={<MoreVertical className="h-3 w-3" />} label="Actions" />}
                          align="right"
                        >
                          <DropdownItem onClick={() => setShowResidentSheet(true)}>
                            <Eye className="mr-1.5 h-3 w-3" /> View Details
                          </DropdownItem>
                          <DropdownItem onClick={() => { }}>
                            <Edit className="mr-1.5 h-3 w-3" /> Edit
                          </DropdownItem>
                          <DropdownItem onClick={() => { }}>
                            <Download className="mr-1.5 h-3 w-3" /> Download Receipt
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem onClick={() => { }} destructive>
                            <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                          </DropdownItem>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile List View */}
            <div className="sm:hidden p-1.5 space-y-1.5">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border border-[#F1F3F5] p-1.5"
                  onClick={() => setShowResidentSheet(true)}
                >
                  <div className="flex items-center gap-1.5">
                    <Avatar size="sm" fallback={payment.resident.charAt(0)} alt={payment.resident} />
                    <div>
                      <p className="text-[11px] font-medium text-[#495057]">{payment.resident}</p>
                      <p className="text-[10px] text-[#8E9AAF]">{payment.unit} • {payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-[#495057]">${payment.amount}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar cards */}
        <div className="space-y-1.5">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-[#495057]">{task.title}</p>
                      <p className="text-[10px] text-[#8E9AAF]">{task.date}</p>
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
              <div className="space-y-1.5">
                <div>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">January 2025</span>
                    <span className="font-medium text-[#495057]">87%</span>
                  </div>
                  <Progress value={87} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">December 2024</span>
                    <span className="font-medium text-[#495057]">94%</span>
                  </div>
                  <Progress value={94} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">November 2024</span>
                    <span className="font-medium text-[#495057]">91%</span>
                  </div>
                  <Progress value={91} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
        description="Enter the payment details below."
        footer={
          <div className="flex justify-end gap-1.5">
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
        <div className="space-y-1.5">
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

      {/* Mobile Drawer for Payment */}
      <Drawer
        open={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        title="Record Payment"
        description="Enter the payment details below."
      >
        <div className="space-y-1.5">
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
        <div className="mt-4 flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={() => setShowMobileDrawer(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => {
            setShowMobileDrawer(false)
            addToast({ variant: "success", title: "Payment recorded", description: "The payment has been saved." })
          }}>
            Save Payment
          </Button>
        </div>
      </Drawer>

      <Sheet
        open={showResidentSheet}
        onClose={() => setShowResidentSheet(false)}
        title="Resident Details"
        description="Maria Silva - Apt 101"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Avatar fallback="MS" alt="Maria Silva" />
            <div>
              <p className="text-[12px] font-medium text-[#343A40]">Maria Silva</p>
              <p className="text-[11px] text-[#8E9AAF]">maria.silva@email.com</p>
            </div>
          </div>

          <Divider />

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[11px] text-[#8E9AAF]">Unit</span>
              <span className="text-[11px] font-medium text-[#343A40]">Apt 101</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[#8E9AAF]">Status</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[#8E9AAF]">Balance</span>
              <span className="text-[11px] font-medium text-[#343A40]">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[#8E9AAF]">Member since</span>
              <span className="text-[11px] font-medium text-[#343A40]">Jan 2023</span>
            </div>
          </div>

          <Divider />

          <div>
            <p className="mb-1.5 text-[10px] font-medium text-[#8E9AAF]">RECENT PAYMENTS</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#495057]">January 2025</span>
                <span className="font-medium text-[#8FB996]">$85.00</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#495057]">December 2024</span>
                <span className="font-medium text-[#8FB996]">$85.00</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#495057]">November 2024</span>
                <span className="font-medium text-[#8FB996]">$85.00</span>
              </div>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-full gap-1.5 bg-white">
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <DashboardContent />
        </div>
      </div>
    </ToastProvider>
  )
}