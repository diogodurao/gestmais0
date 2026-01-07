"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel, FormControl } from "@/components/ui/Formfield"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from "@/components/ui/Dropdown"
import { MoreVertical, Edit, Trash2, Copy, Settings, LogOut } from "lucide-react"

export default function ModalsPage() {
    const [basicModal, setBasicModal] = useState(false)
    const [formModal, setFormModal] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [dangerConfirm, setDangerConfirm] = useState(false)
    const [sizeModal, setSizeModal] = useState<string | null>(null)

    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Modals & Dropdowns
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Modal dialogs, confirm dialogs, and dropdown menus.
                </p>
            </div>

            {/* Basic Modal */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Basic Modal
                    </h2>
                </div>
                <div className="p-4">
                    <Button onClick={() => setBasicModal(true)}>Open Basic Modal</Button>
                    <Modal
                        isOpen={basicModal}
                        onClose={() => setBasicModal(false)}
                        title="Basic Modal"
                    >
                        <p className="text-content text-slate-600">
                            This is a basic modal with just text content. Modals are useful for displaying
                            focused content that requires user attention.
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setBasicModal(false)}>Close</Button>
                        </div>
                    </Modal>
                </div>
            </div>

            {/* Modal Sizes */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Modal Sizes
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {["xs", "sm", "md", "lg", "xl", "2xl"].map((size) => (
                            <Button
                                key={size}
                                variant="outline"
                                size="sm"
                                onClick={() => setSizeModal(size)}
                            >
                                {size.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                    <Modal
                        isOpen={!!sizeModal}
                        onClose={() => setSizeModal(null)}
                        title={`Modal Size: ${sizeModal?.toUpperCase()}`}
                        size={sizeModal as "xs" | "sm" | "md" | "lg" | "xl" | "2xl"}
                    >
                        <p className="text-content text-slate-600">
                            This modal uses the <code className="bg-slate-100 px-1">{sizeModal}</code> size.
                            Available sizes: xs, sm, md, lg, xl, 2xl, full.
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setSizeModal(null)}>Close</Button>
                        </div>
                    </Modal>
                </div>
            </div>

            {/* Modal with Form */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Modal with Form
                    </h2>
                </div>
                <div className="p-4">
                    <Button onClick={() => setFormModal(true)}>Open Form Modal</Button>
                    <Modal
                        isOpen={formModal}
                        onClose={() => setFormModal(false)}
                        title="Create New Item"
                        size="md"
                    >
                        <form className="space-y-4">
                            <FormField required>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    {(props) => <Input {...props} placeholder="Enter name..." />}
                                </FormControl>
                            </FormField>
                            <FormField>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    {(props) => <Input {...props} placeholder="Enter description..." />}
                                </FormControl>
                            </FormField>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setFormModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" onClick={(e) => { e.preventDefault(); setFormModal(false); }}>
                                    Create
                                </Button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>

            {/* Confirm Modal */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Confirm Modal
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setConfirmModal(true)}>
                            Neutral Confirm
                        </Button>
                        <Button variant="danger" onClick={() => setDangerConfirm(true)}>
                            Danger Confirm
                        </Button>
                    </div>
                    <ConfirmModal
                        isOpen={confirmModal}
                        onClose={() => setConfirmModal(false)}
                        onConfirm={() => { setConfirmModal(false); }}
                        title="Confirm Action"
                        message="Are you sure you want to proceed with this action?"
                        confirmText="Confirm"
                        cancelText="Cancel"
                    />
                    <ConfirmModal
                        isOpen={dangerConfirm}
                        onClose={() => setDangerConfirm(false)}
                        onConfirm={() => { setDangerConfirm(false); }}
                        title="Delete Item"
                        message="This action cannot be undone. Are you sure you want to delete this item?"
                        confirmText="Delete"
                        cancelText="Cancel"
                        variant="danger"
                    />
                </div>
            </div>

            {/* Dropdown */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Dropdown Menu
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-4">
                        {/* Basic Dropdown */}
                        <div className="space-y-2">
                            <p className="text-label font-bold text-slate-500 uppercase">Basic</p>
                            <Dropdown>
                                <DropdownTrigger className="inline-flex items-center gap-1 px-3 py-1.5 text-body font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50">
                                    Options
                                    <MoreVertical className="w-3 h-3" />
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownItem>Option 1</DropdownItem>
                                    <DropdownItem>Option 2</DropdownItem>
                                    <DropdownItem>Option 3</DropdownItem>
                                </DropdownContent>
                            </Dropdown>
                        </div>

                        {/* With Icons */}
                        <div className="space-y-2">
                            <p className="text-label font-bold text-slate-500 uppercase">With Icons</p>
                            <Dropdown>
                                <DropdownTrigger className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-sm">
                                    <MoreVertical className="w-4 h-4" />
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownItem icon={<Edit className="w-4 h-4" />}>Edit</DropdownItem>
                                    <DropdownItem icon={<Copy className="w-4 h-4" />}>Duplicate</DropdownItem>
                                    <DropdownSeparator />
                                    <DropdownItem icon={<Trash2 className="w-4 h-4" />} destructive>Delete</DropdownItem>
                                </DropdownContent>
                            </Dropdown>
                        </div>

                        {/* With Labels */}
                        <div className="space-y-2">
                            <p className="text-label font-bold text-slate-500 uppercase">With Labels</p>
                            <Dropdown>
                                <DropdownTrigger className="inline-flex items-center gap-1 px-3 py-1.5 text-body font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50">
                                    Account
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownLabel>Account</DropdownLabel>
                                    <DropdownItem icon={<Settings className="w-4 h-4" />}>Settings</DropdownItem>
                                    <DropdownSeparator />
                                    <DropdownLabel>Actions</DropdownLabel>
                                    <DropdownItem icon={<LogOut className="w-4 h-4" />} destructive>Sign Out</DropdownItem>
                                </DropdownContent>
                            </Dropdown>
                        </div>

                        {/* Alignment */}
                        <div className="space-y-2">
                            <p className="text-label font-bold text-slate-500 uppercase">Right Aligned</p>
                            <Dropdown>
                                <DropdownTrigger className="inline-flex items-center gap-1 px-3 py-1.5 text-body font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50">
                                    Align End
                                </DropdownTrigger>
                                <DropdownContent align="end">
                                    <DropdownItem>Option 1</DropdownItem>
                                    <DropdownItem>Option 2</DropdownItem>
                                    <DropdownItem>Option 3</DropdownItem>
                                </DropdownContent>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown States */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Dropdown Item States
                    </h2>
                </div>
                <div className="p-4">
                    <Dropdown>
                        <DropdownTrigger className="inline-flex items-center gap-1 px-3 py-1.5 text-body font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50">
                            View States
                        </DropdownTrigger>
                        <DropdownContent>
                            <DropdownItem>Normal Item</DropdownItem>
                            <DropdownItem disabled>Disabled Item</DropdownItem>
                            <DropdownSeparator />
                            <DropdownItem destructive>Destructive Item</DropdownItem>
                        </DropdownContent>
                    </Dropdown>
                </div>
            </div>

            {/* Usage Note */}
            <div className="bg-amber-50 border border-amber-200 p-4">
                <p className="text-body text-amber-800">
                    <strong>Note:</strong> Modals and Dropdowns require client-side interactivity.
                    These components use <code className="bg-amber-100 px-1">&quot;use client&quot;</code> directive.
                </p>
            </div>
        </div>
    )
}
