"use client"

import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button"
import { FormField, FormLabel, FormControl, FormDescription, FormError, FormRow } from "@/components/ui/Formfield"
import { ProgressBar } from "@/components/ui/ProgressBar"

const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "disabled", label: "Disabled Option", disabled: true },
]

export default function FormsPage() {
    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Form Elements
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Input, Select, Textarea and form field components.
                </p>
            </div>

            {/* Input */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Input
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Default</label>
                            <Input placeholder="Enter text..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">With Value</label>
                            <Input defaultValue="Sample value" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Disabled</label>
                            <Input placeholder="Disabled input" disabled />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Read Only</label>
                            <Input defaultValue="Read only value" readOnly />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Error State</label>
                            <Input placeholder="Invalid input" aria-invalid={true} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Number Type</label>
                            <Input type="number" placeholder="0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Select */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Select
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Default</label>
                            <Select options={selectOptions} placeholder="Select an option..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">With Value</label>
                            <Select options={selectOptions} defaultValue="option1" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Disabled</label>
                            <Select options={selectOptions} placeholder="Disabled" disabled />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Error State</label>
                            <Select options={selectOptions} placeholder="Invalid" error="Required field" />
                        </div>
                    </div>

                    <div>
                        <label className="text-label font-bold text-slate-500 uppercase mb-2 block">Sizes</label>
                        <div className="flex flex-wrap items-end gap-3">
                            <Select options={selectOptions} size="xs" defaultValue="option1" />
                            <Select options={selectOptions} size="sm" defaultValue="option1" />
                            <Select options={selectOptions} size="md" defaultValue="option1" />
                            <Select options={selectOptions} size="lg" defaultValue="option1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Textarea */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Textarea
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Default</label>
                            <Textarea placeholder="Enter description..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">With Value</label>
                            <Textarea defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">No Resize</label>
                            <Textarea placeholder="Cannot resize..." resize="none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-label font-bold text-slate-500 uppercase">Error State</label>
                            <Textarea placeholder="Invalid..." error="This field is required" />
                        </div>
                    </div>
                </div>
            </div>

            {/* FormField Components */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        FormField Components
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    {/* Standard Field */}
                    <FormField>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            {(props) => <Input {...props} type="email" placeholder="email@example.com" />}
                        </FormControl>
                        <FormDescription>We&apos;ll never share your email.</FormDescription>
                    </FormField>

                    {/* Required Field */}
                    <FormField required>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            {(props) => <Input {...props} placeholder="John Doe" />}
                        </FormControl>
                    </FormField>

                    {/* Optional Field */}
                    <FormField>
                        <FormLabel optional>Phone Number</FormLabel>
                        <FormControl>
                            {(props) => <Input {...props} type="tel" placeholder="+1 (555) 000-0000" />}
                        </FormControl>
                    </FormField>

                    {/* Error Field */}
                    <FormField error="This field is required" required>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            {(props) => <Input {...props} placeholder="username" />}
                        </FormControl>
                        <FormError />
                    </FormField>
                </div>
            </div>

            {/* FormRow Layout */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        FormRow Layout (Horizontal)
                    </h2>
                </div>
                <div className="divide-y divide-slate-100">
                    <FormRow label="Name" required>
                        <Input placeholder="Enter name..." className="border-none h-10" />
                    </FormRow>
                    <FormRow label="Email">
                        <Input type="email" placeholder="email@example.com" className="border-none h-10" />
                    </FormRow>
                    <FormRow label="Category">
                        <Select options={selectOptions} placeholder="Select..." fullWidth className="border-none" />
                    </FormRow>
                    <FormRow label="Notes" error="This field has an error">
                        <Input placeholder="Enter notes..." className="border-none h-10" />
                    </FormRow>
                </div>
            </div>

            {/* ProgressBar */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Progress Bar
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-label font-bold text-slate-500 uppercase">Sizes</label>
                        <div className="space-y-3">
                            <div>
                                <span className="text-micro text-slate-400">xs</span>
                                <ProgressBar value={40} max={100} size="xs" />
                            </div>
                            <div>
                                <span className="text-micro text-slate-400">sm</span>
                                <ProgressBar value={50} max={100} size="sm" />
                            </div>
                            <div>
                                <span className="text-micro text-slate-400">md</span>
                                <ProgressBar value={60} max={100} size="md" />
                            </div>
                            <div>
                                <span className="text-micro text-slate-400">lg</span>
                                <ProgressBar value={70} max={100} size="lg" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-label font-bold text-slate-500 uppercase">Variants</label>
                        <div className="space-y-3">
                            <ProgressBar value={50} max={100} variant="default" showPercentage />
                            <ProgressBar value={100} max={100} variant="success" showPercentage />
                            <ProgressBar value={75} max={100} variant="warning" showPercentage />
                            <ProgressBar value={25} max={100} variant="danger" showPercentage />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-label font-bold text-slate-500 uppercase">Auto Variant</label>
                        <div className="space-y-3">
                            <ProgressBar value={10} max={100} variant="auto" showPercentage />
                            <ProgressBar value={30} max={100} variant="auto" showPercentage />
                            <ProgressBar value={60} max={100} variant="auto" showPercentage />
                            <ProgressBar value={100} max={100} variant="auto" showPercentage />
                        </div>
                    </div>
                </div>
            </div>

            {/* Example Form */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Example Form
                    </h2>
                </div>
                <div className="p-4">
                    <form className="space-y-4 max-w-md">
                        <FormField required>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                                {(props) => <Input {...props} placeholder="My Project" />}
                            </FormControl>
                        </FormField>

                        <FormField>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                {(props) => (
                                    <Select
                                        {...props}
                                        options={selectOptions}
                                        placeholder="Select category..."
                                        fullWidth
                                    />
                                )}
                            </FormControl>
                        </FormField>

                        <FormField>
                            <FormLabel optional>Description</FormLabel>
                            <FormControl>
                                {(props) => <Textarea {...props} placeholder="Describe your project..." />}
                            </FormControl>
                            <FormDescription>Max 500 characters</FormDescription>
                        </FormField>

                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline">Cancel</Button>
                            <Button type="submit">Create Project</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
