"use client"

import { useState } from "react"
import {
  Button,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Label,
  FormField,
  Tag,
  Divider,
  Avatar,
  IconButton,
  Modal,
  Sheet,
  Drawer,
  Dropdown, DropdownItem, DropdownDivider,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  List, ListItem,
  DataGrid, DataGridItem,
  StatCard,
  Alert,
  Skeleton, SkeletonText, SkeletonCard, SkeletonTable,
  EmptyState,
  ToastProvider, useToast,
  Progress,
  Spinner,
} from "./components/ui"
import {
  Plus, Settings, MoreVertical, User, Mail, Phone,
  TrendingUp, Users, DollarSign, Activity, FileText,
  Edit, Trash2, Download, Eye,
} from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-heading mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-subtitle mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ToastDemo() {
  const { addToast } = useToast()

  return (
    <div className="flex flex-wrap gap-2">
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
    <div className="space-y-12">
      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-2 rounded-md border border-gray-200 bg-white p-4">
          <p className="text-heading">Heading - 16px semibold</p>
          <p className="text-subtitle">Subtitle - 14px medium</p>
          <p className="text-body">Body - 13px regular</p>
          <p className="text-label">Label - 11px medium</p>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <Subsection title="Variants">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Subsection>
        <Subsection title="Sizes">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
          </div>
        </Subsection>
        <Subsection title="States">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </Subsection>
        <Subsection title="With Icons">
          <div className="flex flex-wrap gap-2">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Item</Button>
            <IconButton icon={<Settings className="h-4 w-4" />} label="Settings" />
            <IconButton icon={<MoreVertical className="h-4 w-4" />} label="More" variant="ghost" />
          </div>
        </Subsection>
      </Section>

      {/* Form Elements */}
      <Section title="Form Elements">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent>
              <div className="space-y-4">
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
              <div className="space-y-4">
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
                <div className="space-y-2">
                  <Label>Checkboxes</Label>
                  <div className="space-y-2">
                    <Checkbox id="c1" label="Option A" defaultChecked />
                    <Checkbox id="c2" label="Option B" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Radio Group</Label>
                  <div className="space-y-2">
                    <Radio id="r1" name="radio" label="Choice 1" defaultChecked />
                    <Radio id="r2" name="radio" label="Choice 2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Badges & Tags */}
      <Section title="Badges & Tags">
        <Subsection title="Badge Variants">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Subsection>
        <Subsection title="Tags">
          <div className="flex flex-wrap gap-2">
            <Tag>Simple Tag</Tag>
            <Tag removable onRemove={() => {}}>Removable</Tag>
            <Tag removable onRemove={() => {}}>Category</Tag>
          </div>
        </Subsection>
      </Section>

      {/* Avatars */}
      <Section title="Avatars">
        <div className="flex items-center gap-4">
          <Avatar alt="John Doe" />
          <Avatar alt="Jane Smith" fallback="JS" />
          <Avatar size="sm" alt="Small" fallback="SM" />
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>A basic card with header and content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body">Card content goes here. This is a simple card component with header, title, description, and content areas.</p>
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
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Cancel</Button>
                <Button size="sm">Save</Button>
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
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

      {/* Stats */}
      <Section title="Stat Cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value="1,234"
            change={{ value: "12%", positive: true }}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Revenue"
            value="$45,231"
            change={{ value: "8%", positive: true }}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            label="Active Now"
            value="573"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatCard
            label="Pending"
            value="12"
            change={{ value: "3%", positive: false }}
            icon={<FileText className="h-5 w-5" />}
          />
        </div>
      </Section>

      {/* Data Grid */}
      <Section title="Data Grid">
        <DataGrid columns={4}>
          <DataGridItem label="Total Items" value="1,234" />
          <DataGridItem label="Completed" value="987" />
          <DataGridItem label="In Progress" value="156" />
          <DataGridItem label="Pending" value="91" />
        </DataGrid>
      </Section>

      {/* Table */}
      <Section title="Table">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>john@example.com</TableCell>
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
                <TableCell>jane@example.com</TableCell>
                <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <IconButton size="sm" variant="ghost" icon={<Eye className="h-4 w-4" />} label="View" />
                    <IconButton size="sm" variant="ghost" icon={<Edit className="h-4 w-4" />} label="Edit" />
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bob Wilson</TableCell>
                <TableCell>bob@example.com</TableCell>
                <TableCell><Badge variant="error">Inactive</Badge></TableCell>
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

      {/* List */}
      <Section title="List">
        <div className="max-w-md">
          <List>
            <ListItem
              clickable
              leading={<User className="h-5 w-5 text-gray-400" />}
              title="John Doe"
              description="john@example.com"
              trailing={<Badge variant="success">Active</Badge>}
            />
            <ListItem
              clickable
              leading={<User className="h-5 w-5 text-gray-400" />}
              title="Jane Smith"
              description="jane@example.com"
              trailing={<Badge variant="warning">Pending</Badge>}
            />
            <ListItem
              clickable
              leading={<User className="h-5 w-5 text-gray-400" />}
              title="Bob Wilson"
              description="bob@example.com"
              trailing={<Badge>Draft</Badge>}
            />
          </List>
        </div>
      </Section>

      {/* Dropdowns */}
      <Section title="Dropdown Menu">
        <Dropdown
          trigger={<Button variant="outline" size="sm">Actions <MoreVertical className="h-4 w-4" /></Button>}
        >
          <DropdownItem onClick={() => {}}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownItem>
          <DropdownItem onClick={() => {}}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownItem>
          <DropdownItem onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" /> Download
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={() => {}} destructive>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownItem>
        </Dropdown>
      </Section>

      {/* Alerts */}
      <Section title="Alerts">
        <div className="space-y-3">
          <Alert variant="info" title="Information">
            This is an informational message.
          </Alert>
          <Alert variant="success" title="Success">
            Your changes have been saved.
          </Alert>
          <Alert variant="warning" title="Warning">
            Please review your settings.
          </Alert>
          <Alert variant="error" title="Error" dismissible onDismiss={() => {}}>
            Something went wrong. Please try again.
          </Alert>
        </div>
      </Section>

      {/* Toast */}
      <Section title="Toast Notifications">
        <ToastDemo />
      </Section>

      {/* Progress & Loading */}
      <Section title="Progress & Loading">
        <Subsection title="Progress Bar">
          <div className="max-w-md space-y-3">
            <Progress value={25} />
            <Progress value={50} />
            <Progress value={75} />
            <Progress value={100} size="sm" />
          </div>
        </Subsection>
        <Subsection title="Spinner">
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Subsection>
      </Section>

      {/* Skeletons */}
      <Section title="Skeleton Loading">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-label mb-3">Text Skeleton</p>
            <SkeletonText lines={3} />
          </div>
          <div>
            <p className="text-label mb-3">Card Skeleton</p>
            <SkeletonCard />
          </div>
        </div>
        <div className="mt-6">
          <p className="text-label mb-3">Table Skeleton</p>
          <SkeletonTable rows={3} />
        </div>
      </Section>

      {/* Empty State */}
      <Section title="Empty State">
        <Card>
          <EmptyState
            title="No items found"
            description="Get started by creating your first item."
            action={<Button size="sm"><Plus className="h-4 w-4" /> Add Item</Button>}
          />
        </Card>
      </Section>

      {/* Dividers */}
      <Section title="Dividers">
        <div className="space-y-4 rounded-md border border-gray-200 bg-white p-4">
          <p className="text-body">Content above divider</p>
          <Divider />
          <p className="text-body">Content below divider</p>
          <Divider label="or" />
          <p className="text-body">Content after labeled divider</p>
        </div>
      </Section>

      {/* Modals & Overlays */}
      <Section title="Overlays">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            Open Sheet
          </Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Open Drawer
          </Button>
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal Title"
          description="This is a modal dialog example."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </div>
          }
        >
          <p className="text-body">Modal content goes here. You can put any content inside.</p>
        </Modal>

        <Sheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Sheet Title"
          description="This is a side sheet example."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Close</Button>
            </div>
          }
        >
          <p className="text-body">Sheet content goes here. Useful for forms or detail views.</p>
          <div className="mt-4 space-y-4">
            <FormField label="Name">
              <Input placeholder="Enter name" />
            </FormField>
            <FormField label="Email">
              <Input type="email" placeholder="Enter email" />
            </FormField>
          </div>
        </Sheet>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Drawer Title"
          description="This is a bottom drawer example."
        >
          <p className="text-body">Drawer content goes here. Great for mobile interactions.</p>
          <div className="mt-4 flex gap-2">
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
      <div>
        <div className="mb-8">
          <h1 className="text-[20px] font-semibold text-gray-900">Design System Components</h1>
          <p className="mt-1 text-body">A consistent, reusable component library for the application.</p>
        </div>
        <ComponentShowcase />
      </div>
    </ToastProvider>
  )
}
