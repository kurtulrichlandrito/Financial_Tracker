import { useOutletContext } from "react-router-dom"
import UploadFiles from "../components/statements/UploadStatements"

function TransactionImportPage() {
    const { reload } = useOutletContext()

    return (
        <section className="page-card">
            <UploadFiles onRefresh={reload} />
        </section>
    )
}

export default TransactionImportPage
