import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import Dialog from '@mui/material/Dialog'
import AssetList from "../components/asset/AssetList"
import CreateAsset from "../components/asset/CreateAsset"

function AssetsPage() {
    const { globalRefresh, reload } = useOutletContext()
    const [open, setOpen] = useState(false)

    return (
        <div className="page-stack">
            <div className="page-card page-header">
                <div>
                    <h1 className="page-title">Assets</h1>
                    <p className="page-subtitle">Track owned assets and values.</p>
                </div>
                <button className="button-primary" onClick={() => setOpen(true)}>+ Add Asset</button>
            </div>
            <section className="page-card">
                <AssetList globalRefresh={globalRefresh} onRefresh={reload} />
            </section>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <CreateAsset onRefresh={reload} onClose={() => setOpen(false)} />
            </Dialog>
        </div>
    )
}

export default AssetsPage
