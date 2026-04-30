import { useState, useEffect } from "react"
import Dialog from '@mui/material/Dialog'
import EditAssetLiability from "../networth/EditAssetLiability"
import currencyFormatter from "../../utils/currencyFormatter"

function AssetList({ globalRefresh, onRefresh }) {
    const [assets, setAssets] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [selectedAsset, setSelectedAsset] = useState(null)
    const [editDialog, setEditDialog] = useState(false)

    useEffect(() => {
        fetch('/api/asset/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setAssets(data) })
    }, [globalRefresh, refresh])

    const refreshAssets = () => {
        setRefresh((current) => !current)
        onRefresh?.()
    }

    return (
        <div>
            <h3>All Asset</h3>
            <table>
                <thead>
                    <tr>
                        <td>Asset Name</td>
                        <td>Amount</td>

                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset) => (
                        <tr
                            key={asset.id}
                            onClick={() => {
                                setSelectedAsset(asset)
                                setEditDialog(true)
                            }}>
                            <td>{asset.asset_name}</td>
                            <td>{currencyFormatter.format(asset.asset_amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
                <EditAssetLiability
                    type="asset"
                    target={selectedAsset}
                    onRefresh={refreshAssets}
                    onClose={() => setEditDialog(false)}
                />
            </Dialog>
        </div>
    )
}

export default AssetList
