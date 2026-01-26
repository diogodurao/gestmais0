"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Drawer } from "@/components/ui/Drawer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { NotificationOptionsSection, type Resident } from "@/components/ui/ResidentSelector"
import { createPoll } from "@/lib/actions/polls"
import { getBuildingResidentsForSelector } from "@/lib/actions/notification"
import { PollType, PollWeightMode, NotificationOptions } from "@/lib/types"
import { WEIGHT_MODE_CONFIG } from "@/lib/constants/ui"
import { useToast } from "@/components/ui/Toast"

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
}

export function PollModal({ isOpen, onClose, buildingId }: Props) {
    const router = useRouter()
    const { addToast } = useToast()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState<PollType>("yes_no")
    const [weightMode, setWeightMode] = useState<PollWeightMode>("equal")
    const [options, setOptions] = useState<string[]>(["", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Notification options
    const [sendAppNotification, setSendAppNotification] = useState(true)
    const [sendEmail, setSendEmail] = useState(false)
    const [recipients, setRecipients] = useState<'all' | string[]>('all')

    const fetchResidents = useCallback(async (buildingId: string): Promise<Resident[]> => {
        return getBuildingResidentsForSelector(buildingId)
    }, [])

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setType("yes_no")
        setWeightMode("equal")
        setOptions(["", "", ""])
        setSendAppNotification(true)
        setSendEmail(false)
        setRecipients('all')
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""])
        }
    }

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index))
        }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            addToast({ title: "Erro", description: "Título é obrigatório", variant: "error" })
            return
        }

        if (type !== "yes_no") {
            const filledOptions = options.filter(o => o.trim())
            if (filledOptions.length < 2) {
                addToast({ title: "Erro", description: "Adicione pelo menos 2 opções", variant: "error" })
                return
            }
        }

        setIsLoading(true)

        // Build notification options
        const notificationOptions: NotificationOptions = {
            sendAppNotification,
            sendEmail,
            recipients,
        }

        const result = await createPoll({
            buildingId,
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            weightMode,
            options: type !== "yes_no" ? options.filter(o => o.trim()) : undefined,
            notificationOptions,
        })

        if (result.success) {
            addToast({ title: "Sucesso", description: "Votação criada", variant: "success" })
            router.refresh()
            handleClose()
        } else {
            addToast({ title: "Erro", description: result.error, variant: "error" })
        }

        setIsLoading(false)
    }

    // Form content (shared between Modal and Drawer)
    const FormContent = (
        <div className="space-y-4">
            <FormField required>
                <FormLabel>Título</FormLabel>
                <FormControl>
                    {(props) => (
                        <Input
                            {...props}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Aprovação de obras no telhado"
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            <FormField>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                    {(props) => (
                        <Textarea
                            {...props}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o assunto da votação..."
                            rows={3}
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
                <FormField required>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Select
                                {...props}
                                value={type}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as PollType)}
                            >
                                <option value="yes_no">Sim/Não/Abstenção</option>
                                <option value="multiple_choice">Escolha múltipla</option>
                            </Select>
                        )}
                    </FormControl>
                    <FormError />
                </FormField>

                <FormField required>
                    <FormLabel>Contagem</FormLabel>
                    <FormControl>
                        {(props) => (
                            <Select
                                {...props}
                                value={weightMode}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWeightMode(e.target.value as PollWeightMode)}
                            >
                                {Object.entries(WEIGHT_MODE_CONFIG).map(([value, { label }]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </Select>
                        )}
                    </FormControl>
                    <FormError />
                </FormField>
            </div>

            {type === "multiple_choice" && (
                <FormField required>
                    <FormLabel>Opções de Voto</FormLabel>
                    <div className="space-y-1.5">
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={`Opção ${index + 1}`}
                                />
                                {options.length > 2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeOption(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {options.length < 10 && (
                            <Button type="button" variant="outline" size="sm" className="w-full" onClick={addOption}>
                                <Plus className="w-4 h-4 mr-1" /> Adicionar opção
                            </Button>
                        )}
                    </div>
                </FormField>
            )}

            {/* Notification Options */}
            <NotificationOptionsSection
                sendAppNotification={sendAppNotification}
                onSendAppNotificationChange={setSendAppNotification}
                sendEmail={sendEmail}
                onSendEmailChange={setSendEmail}
                recipients={recipients}
                onRecipientsChange={setRecipients}
                buildingId={buildingId}
                fetchResidents={fetchResidents}
                disabled={isLoading}
            />
        </div>
    )

    // Footer buttons (shared)
    const FooterButtons = (
        <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={isLoading} className="flex-1">
                Criar Votação
            </Button>
        </div>
    )

    // Render mobile Drawer or desktop Modal
    if (isMobile) {
        return (
            <Drawer
                open={isOpen}
                onClose={handleClose}
                title="Nova Votação"
                description="Crie uma nova votação para os condóminos."
            >
                {FormContent}
                {FooterButtons}
            </Drawer>
        )
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Nova Votação"
        >
            {FormContent}
            {FooterButtons}
        </Modal>
    )
}