import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import Dialog from '@mui/material/Dialog'
import LiabilityList from "../components/liabilities/LiabilityList"
import CreateLiability from "../components/liabilities/CreateLiability"

function LiabilitiesPage() {
    const { globalRefresh, reload } = useOutletContext()
    const [open, setOpen] = useState(false)

    return (
        <div className="page-stack">
            <div className="page-card page-header">
                <div>
                    <h1 className="page-title">Liabilities</h1>
                    <p className="page-subtitle">Track debts and obligations.</p>
                </div>
                <button className="button-primary" onClick={() => setOpen(true)}>+ Add Liability</button>
            </div>
            <section className="page-card">
                <LiabilityList globalRefresh={globalRefresh} onRefresh={reload} />
            </section>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <CreateLiability onRefresh={reload} onClose={() => setOpen(false)} />
            </Dialog>
        </div>
    )
}

export default LiabilitiesPage
