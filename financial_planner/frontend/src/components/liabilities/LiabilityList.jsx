import { useState, useEffect } from "react"
import Dialog from '@mui/material/Dialog'
import EditAssetLiability from "../networth/EditAssetLiability"
import currencyFormatter from "../../utils/currencyFormatter"

function LiabilityList({ globalRefresh, onRefresh }) {
    const [liabilities, setLiabilities] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [selectedLiability, setSelectedLiability] = useState(null)
    const [editDialog, setEditDialog] = useState(false)

    useEffect(() => {
        fetch('/api/liability/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setLiabilities(data) })
    }, [globalRefresh, refresh])

    const refreshLiabilities = () => {
        setRefresh((current) => !current)
        onRefresh?.()
    }

    return (
        <div>
            <h3>All Liabilities</h3>
            <table>
                <thead>
                    <tr>
                        <td>Liability Name</td>
                        <td>Amount</td>

                    </tr>
                </thead>
                <tbody>
                    {liabilities.map((liability) => (
                        <tr
                            key={liability.id}
                            onClick={() => {
                                setSelectedLiability(liability)
                                setEditDialog(true)
                            }}>
                            <td>{liability.liability_name}</td>
                            <td>{currencyFormatter.format(liability.liability_amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
                <EditAssetLiability
                    type="liability"
                    target={selectedLiability}
                    onRefresh={refreshLiabilities}
                    onClose={() => setEditDialog(false)}
                />
            </Dialog>
        </div>
    )
}

export default LiabilityList
