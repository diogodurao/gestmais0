"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { createApartment, deleteApartment } from "@/lib/actions/building"
import type { OnboardingApartment } from "@/lib/types"
import { ONBOARDING_INPUT_CLASS_COMPACT } from "@/lib/constants/ui"

interface OnboardingStepUnitsProps {
  buildingId: string
  apartments: OnboardingApartment[]
  totalApartments: number
}

export function OnboardingStepUnits({
  buildingId,
  apartments,
  totalApartments,
}: OnboardingStepUnitsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [newUnit, setNewUnit] = useState("")
  const [newPermillage, setNewPermillage] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)
  const isAtLimit = totalApartments > 0 && apartments.length >= totalApartments

  const handleAddUnit = async () => {
    if (!newUnit.trim() || !newPermillage.trim()) {
      setError("Ambos os campos são obrigatórios")
      return
    }

    const permillageValue = parseFloat(newPermillage)
    if (isNaN(permillageValue) || permillageValue <= 0) {
      setError("A permilagem deve ser um número positivo")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await createApartment(buildingId, {
        unit: newUnit.trim(),
        permillage: permillageValue,
      })

      if (result.success) {
        setNewUnit("")
        setNewPermillage("")
        router.refresh()
      } else {
        setError(result.error || "Ocorreu um erro inesperado")
      }
    } catch {
      setError("Ocorreu um erro inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (apartmentId: number) => {
    setDeleteConfirmId(apartmentId)
  }

  const confirmDeleteUnit = async () => {
    if (deleteConfirmId === null) return

    setIsDeleting(true)
    try {
      const result = await deleteApartment(deleteConfirmId)
      if (result.success) {
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to delete unit", err)
    } finally {
      setIsDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-info-light border border-info rounded-md p-4">
          <h3 className="text-label font-semibold text-info uppercase mb-1">
            INSTRUÇÕES DE REGISTO
          </h3>
          <p className="text-label text-info">
            Ao adicionar frações, a permilagem total deve somar exatamente 1000. Pode
            adicionar mais frações posteriormente no painel de definições.
          </p>
        </div>

        {/* Unit List */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-200 text-label font-semibold text-gray-500 uppercase">
            <div className="col-span-5 p-2">FRAÇÃO</div>
            <div className="col-span-4 p-2">PERMILAGEM</div>
            <div className="col-span-3 p-2"></div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {apartments.map((apt) => (
              <div
                key={apt.id}
                className="grid grid-cols-12 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-5 p-2 text-body font-mono font-semibold uppercase">
                  {apt.unit}
                </div>
                <div className="col-span-4 p-2 text-body font-mono">{apt.permillage} ‰</div>
                <div className="col-span-3 p-2 text-right">
                  <button
                    onClick={() => handleDeleteClick(apt.id)}
                    className="p-1 text-gray-400 hover:text-error transition-colors rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {apartments.length === 0 && (
              <div className="p-4 text-center text-label text-gray-400 italic">
                Nenhuma fração definida
              </div>
            )}
          </div>

          {/* Add New Unit Row */}
          {!isAtLimit && (
            <div className="grid grid-cols-12 border-t border-gray-200 items-center bg-gray-50">
              <div className="col-span-5 p-2">
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Ex: 1º Esq"
                  className={ONBOARDING_INPUT_CLASS_COMPACT}
                />
              </div>
              <div className="col-span-4 p-2">
                <input
                  type="number"
                  value={newPermillage}
                  onChange={(e) => setNewPermillage(e.target.value)}
                  placeholder="0"
                  className={`${ONBOARDING_INPUT_CLASS_COMPACT} font-mono`}
                />
              </div>
              <div className="col-span-3 p-2">
                <Button size="sm" onClick={handleAddUnit} disabled={isLoading}>
                  <Plus className="w-3 h-3 mr-1" />
                  ADICIONAR
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Limit Warning */}
        {isAtLimit && (
          <div className="flex items-center gap-2 p-3 bg-warning-light border border-warning rounded-md">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-label font-semibold text-warning uppercase">
              Limite de frações atingido
            </span>
          </div>
        )}

        {error && <p className="text-label text-error font-semibold">{error}</p>}

        {/* Summary */}
        <div className="flex items-center justify-between text-label text-gray-500">
          <span>{apartments.length} FRAÇÕES</span>
          <span
            className={
              totalPermillage === 1000 ? "text-success font-semibold" : ""
            }
          >
            {totalPermillage}/1000 ‰
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Eliminar fração"
        message="Tem a certeza que deseja eliminar esta fração?"
        variant="danger"
        confirmText="Eliminar"
        onConfirm={confirmDeleteUnit}
        onCancel={() => setDeleteConfirmId(null)}
        loading={isDeleting}
      />
    </>
  )
}
