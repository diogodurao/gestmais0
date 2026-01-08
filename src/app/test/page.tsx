"use client"

import { useState } from "react"
import { Button } from "./components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card"
import { Badge } from "./components/ui/badge"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { Select } from "./components/ui/select"
import { Checkbox } from "./components/ui/checkbox"
import { Radio } from "./components/ui/radio"
import { Label } from "./components/ui/label"
import { FormField } from "./components/ui/form-field"
import { Tag } from "./components/ui/tag"
import { Divider } from "./components/ui/divider"
import { Avatar } from "../../components/ui/avatar"
import { IconButton } from "./components/ui/icon-button"
import { Modal } from "./components/ui/modal"
import { Sheet } from "./components/ui/sheet"
import { Drawer } from "./components/ui/drawer"
import { Dropdown, DropdownItem, DropdownDivider } from "./components/ui/dropdown"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./components/ui/table"
import { List, ListItem } from "./components/ui/list"
import { DataGrid, DataGridItem } from "./components/ui/data-grid"
import { StatCard } from "./components/ui/stat-card"
import { Alert } from "./components/ui/alert"
import { SkeletonText, SkeletonCard, SkeletonTable } from "./components/ui/skeleton"
import { EmptyState } from "./components/ui/empty-state"
import { ToastProvider, useToast } from "./components/ui/toast"
import { Progress } from "./components/ui/progress"
import { Spinner } from "./components/ui/spinner"
import {
  Plus, Settings, MoreVertical, User,
  Users, DollarSign, Activity, FileText,
  Edit, Trash2, Download, Eye,
} from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-heading mb-1.5">{title}</h2>
      {children}
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5">
      <h3 className="text-subtitle mb-1.5">{title}</h3>
      {children}
    </div>
  )
}

function ToastDemo() {
  const { addToast } = useToast()

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button size="sm" variant="outline" onClick={() => addToast({ variant: "success", title: "Success", description: "Operation completed." })}>
        Success Toast
      </Button>
      <Button size="sm" variant="outline" onClick={() => addToast({ variant: "error", title: "Error", description: "Something went wrong." })}>
        Error Toast
      </Button>
      <Button size="sm" variant="outline" onClick={() => addToast({ variant: "warning", title: "Warning", description: "Please review this." })}>
        Warning Toast
      </Button>
      <Button size="sm" variant="outline" onClick={() => addToast({ variant: "info", title: "Info", description: "Here is some info." })}>
        Info Toast
      </Button>
    </div>
  )
}

function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="space-y-6">
      <Section title="Typography">
        <div className="space-y-1.5 rounded-md border border-gray-200 bg-white p-1.5">
          <p className="text-heading">Heading - 16px semibold</p>
          <p className="text-subtitle">Subtitle - 14px medium</p>
          <p className="text-body">Body - 13px regular</p>
          <p className="text-label">Label - 11px medium</p>
        </div>
      </Section>

      <Section title="Buttons">
        <Subsection title="Variants">
          <div className="flex flex-wrap gap-1.5">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Subsection>
        <Subsection title="Sizes">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
          </div>
        </Subsection>
        <Subsection title="States">
          <div className="flex flex-wrap gap-1.5">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </Subsection>
        <Subsection title="With Icons">
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Item</Button>
            <IconButton icon={<Settings className="h-4 w-4" />} label="Settings" />
            <IconButton icon={<MoreVertical className="h-4 w-4" />} label="More" variant="ghost" />
          </div>
        </Subsection>
      </Section>

      <Section title="Form Elements">
        <div className="grid gap-1.5 sm:grid-cols-2">
          <Card>
            <CardContent>
              <div className="space-y-1.5">
                <FormField label="Name" required>
                  <Input placeholder="Enter your name" />
                </FormField>
                <FormField label="Email" description="We'll never share your email.">
                  <Input type="email" placeholder="email@example.com" />
                </FormField>
                <FormField label="Disabled">
                  <Input disabled placeholder="Disabled input" />
                </FormField>
                <FormField label="With Error" error="This field is required">
                  <Input error placeholder="Invalid input" />
                </FormField>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="space-y-1.5">
                <FormField label="Select Option">
                  <Select>
                    <option value="">Choose an option</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                  </Select>
                </FormField>
                <FormField label="Message">
                  <Textarea placeholder="Enter your message..." />
                </FormField>
                <div className="space-y-1.5">
                  <Label>Checkboxes</Label>
                  <div className="space-y-1.5">
                    <Checkbox id="c1" label="Option A" defaultChecked />
                    <Checkbox id="c2" label="Option B" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Radio Group</Label>
                  <div className="space-y-1.5">
                    <Radio id="r1" name="radio" label="Choice 1" defaultChecked />
                    <Radio id="r2" name="radio" label="Choice 2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Badges & Tags">
        <Subsection title="Badge Variants">
          <div className="flex flex-wrap gap-1.5">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Subsection>
        <Subsection title="Tags">
          <div className="flex flex-wrap gap-1.5">
            <Tag>Simple Tag</Tag>
            <Tag removable onRemove={() => { }}>Removable</Tag>
            <Tag removable onRemove={() => { }}>Category</Tag>
          </div>
        </Subsection>
      </Section>

      <Section title="Avatars">
        <div className="flex items-center gap-1.5">
          <Avatar alt="John Doe" />
          <Avatar alt="Jane Smith" fallback="JS" />
          <Avatar size="sm" alt="Small" fallback="SM" />
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>A basic card with header and content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body">Card content goes here.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card with Footer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body">This card has a footer with actions.</p>
            </CardContent>
            <CardFooter>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline">Cancel</Button>
                <Button size="sm">Save</Button>
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-1.5">
                <Avatar alt="User" />
                <div>
                  <p className="text-subtitle">John Doe</p>
                  <p className="text-label">Developer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Stat Cards">
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
          <StatCard label="Total Users" value="1,234" change={{ value: "12%", positive: true }} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Revenue" value="$45,231" change={{ value: "8%", positive: true }} icon={<DollarSign className="h-5 w-5" />} />
          <StatCard label="Active Now" value="573" icon={<Activity className="h-5 w-5" />} />
          <StatCard label="Pending" value="12" change={{ value: "3%", positive: false }} icon={<FileText className="h-5 w-5" />} />
        </div>
      </Section>

      <Section title="Data Grid">
        <DataGrid columns={4}>
          <DataGridItem label="Total Items" value="1,234" />
          <DataGridItem label="Completed" value="987" />
          <DataGridItem label="In Progress" value="156" />
          <DataGridItem label="Pending" value="91" />
        </DataGrid>
      </Section>

      <Section title="Table">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell className="hidden sm:table-cell">john@example.com</TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <IconButton size="sm" variant="ghost" icon={<Eye className="h-4 w-4" />} label="View" />
                    <IconButton size="sm" variant="ghost" icon={<Edit className="h-4 w-4" />} label="Edit" />
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell className="hidden sm:table-cell">jane@example.com</TableCell>
                <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <IconButton size="sm" variant="ghost" icon={<Eye className="h-4 w-4" />} label="View" />
                    <IconButton size="sm" variant="ghost" icon={<Edit className="h-4 w-4" />} label="Edit" />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Section>

      <Section title="List">
        <div className="max-w-md">
          <List>
            <ListItem clickable leading={<User className="h-5 w-5 text-gray-400" />} title="John Doe" description="john@example.com" trailing={<Badge variant="success">Active</Badge>} />
            <ListItem clickable leading={<User className="h-5 w-5 text-gray-400" />} title="Jane Smith" description="jane@example.com" trailing={<Badge variant="warning">Pending</Badge>} />
            <ListItem clickable leading={<User className="h-5 w-5 text-gray-400" />} title="Bob Wilson" description="bob@example.com" trailing={<Badge>Draft</Badge>} />
          </List>
        </div>
      </Section>

      <Section title="Dropdown Menu">
        <Dropdown trigger={<Button variant="outline" size="sm">Actions <MoreVertical className="h-4 w-4" /></Button>}>
          <DropdownItem onClick={() => { }}><Eye className="mr-1.5 h-4 w-4" /> View</DropdownItem>
          <DropdownItem onClick={() => { }}><Edit className="mr-1.5 h-4 w-4" /> Edit</DropdownItem>
          <DropdownItem onClick={() => { }}><Download className="mr-1.5 h-4 w-4" /> Download</DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={() => { }} destructive><Trash2 className="mr-1.5 h-4 w-4" /> Delete</DropdownItem>
        </Dropdown>
      </Section>

      <Section title="Alerts">
        <div className="space-y-1.5">
          <Alert variant="info" title="Information">This is an informational message.</Alert>
          <Alert variant="success" title="Success">Your changes have been saved.</Alert>
          <Alert variant="warning" title="Warning">Please review your settings.</Alert>
          <Alert variant="error" title="Error" dismissible onDismiss={() => { }}>Something went wrong.</Alert>
        </div>
      </Section>

      <Section title="Toast Notifications">
        <ToastDemo />
      </Section>

      <Section title="Progress & Loading">
        <Subsection title="Progress Bar">
          <div className="max-w-md space-y-1.5">
            <Progress value={25} />
            <Progress value={50} />
            <Progress value={75} />
          </div>
        </Subsection>
        <Subsection title="Spinner">
          <div className="flex items-center gap-1.5">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Subsection>
      </Section>

      <Section title="Skeleton Loading">
        <div className="grid gap-1.5 sm:grid-cols-2">
          <div>
            <p className="text-label mb-1.5">Text Skeleton</p>
            <SkeletonText lines={3} />
          </div>
          <div>
            <p className="text-label mb-1.5">Card Skeleton</p>
            <SkeletonCard />
          </div>
        </div>
        <div className="mt-1.5">
          <p className="text-label mb-1.5">Table Skeleton</p>
          <SkeletonTable rows={3} />
        </div>
      </Section>

      <Section title="Empty State">
        <Card>
          <EmptyState title="No items found" description="Get started by creating your first item." action={<Button size="sm"><Plus className="h-4 w-4" /> Add Item</Button>} />
        </Card>
      </Section>

      <Section title="Dividers">
        <div className="space-y-1.5 rounded-md border border-gray-200 bg-white p-1.5">
          <p className="text-body">Content above divider</p>
          <Divider />
          <p className="text-body">Content below divider</p>
          <Divider label="or" />
          <p className="text-body">Content after labeled divider</p>
        </div>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap gap-1.5">
          <Button variant="outline" onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button variant="outline" onClick={() => setSheetOpen(true)}>Open Sheet</Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modal Title" description="This is a modal dialog example." footer={<div className="flex justify-end gap-1.5"><Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={() => setModalOpen(false)}>Confirm</Button></div>}>
          <p className="text-body">Modal content goes here.</p>
        </Modal>

        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Sheet Title" description="This is a side sheet example." footer={<div className="flex justify-end gap-1.5"><Button variant="outline" onClick={() => setSheetOpen(false)}>Close</Button></div>}>
          <p className="text-body">Sheet content goes here.</p>
          <div className="mt-1.5 space-y-1.5">
            <FormField label="Name"><Input placeholder="Enter name" /></FormField>
            <FormField label="Email"><Input type="email" placeholder="Enter email" /></FormField>
          </div>
        </Sheet>

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer Title" description="This is a bottom drawer example.">
          <p className="text-body">Drawer content goes here.</p>
          <div className="mt-1.5 flex gap-1.5">
            <Button className="flex-1" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => setDrawerOpen(false)}>Confirm</Button>
          </div>
        </Drawer>
      </Section>
    </div>
  )
}

export default function TestPage() {
  return (
    <ToastProvider>
      <div className="overflow-y-auto h-full p-1.5">
        <div className="mb-1.5">
          <h1 className="text-[20px] font-semibold text-gray-900">Design System Components</h1>
          <p className="mt-1 text-body">A consistent, reusable component library for the application.</p>
        </div>
        <ComponentShowcase />
      </div>
    </ToastProvider>
  )
}