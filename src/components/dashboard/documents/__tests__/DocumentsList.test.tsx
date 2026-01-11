import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { DocumentsList } from "../DocumentsList"
import { describe, it, expect, vi, afterEach } from "vitest"
import { Document } from "@/lib/types"

// Mock dependencies
vi.mock("../DocumentCard", () => ({
    DocumentCard: ({ document }: { document: Document }) => (
        <div data-testid="document-card">{document.title}</div>
    )
}))

vi.mock("../DocumentUploadModal", () => ({
    DocumentUploadModal: ({ isOpen, onClose }: any) => (
        isOpen ? <div data-testid="upload-modal"><button onClick={onClose}>Close</button></div> : null
    )
}))

vi.mock("../DocumentPreviewModal", () => ({
    DocumentPreviewModal: () => null
}))

vi.mock("../DocumentVersions", () => ({
    DocumentVersions: () => null
}))

const mockDocuments: Document[] = [
    {
        id: 1,
        title: "Document 1",
        fileUrl: "url1",
        fileType: "application/pdf",
        uploadedBy: "user1",
        buildingId: "b1",

        category: "atas",
        fileSize: 1000,

        fileName: "file1",
        fileKey: "key1",
        version: 1,
        originalId: null,
        description: null,
        uploaderName: "User 1",
        uploadedAt: new Date()
    },
    {
        id: 2,
        title: "Document 2",
        fileUrl: "url2",
        fileType: "image/png",
        uploadedBy: "user2",
        buildingId: "b1",

        category: "contas",
        fileSize: 2000,

        fileName: "file2",
        fileKey: "key2",
        version: 1,
        originalId: null,
        description: null,
        uploaderName: "User 2",
        uploadedAt: new Date()
    }
]

describe("DocumentsList", () => {
    afterEach(() => {
        cleanup()
    })

    it("renders documents list correctly", () => {
        render(<DocumentsList buildingId="b1" documents={mockDocuments} isManager={false} />)

        expect(screen.getByText("Documentos")).toBeTruthy()
        expect(screen.getAllByTestId("document-card")).toHaveLength(2)
    })

    it("filters documents by category", () => {
        render(<DocumentsList buildingId="b1" documents={mockDocuments} isManager={false} />)

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "contas" } })

        const cards = screen.getAllByTestId("document-card")
        expect(cards).toHaveLength(1)
        expect(screen.getByText("Document 2")).toBeTruthy()
        expect(screen.queryByText("Document 1")).toBeNull()
    })

    it("opens upload modal", () => {
        // Need isManager=true
        render(<DocumentsList buildingId="b1" documents={mockDocuments} isManager={true} />)

        fireEvent.click(screen.getByText("Carregar Documento"))
        expect(screen.getByTestId("upload-modal")).toBeTruthy()
    })
})
