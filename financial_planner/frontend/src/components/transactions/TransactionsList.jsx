import { useState, useEffect } from "react"
import { apiDelete } from "../../utils/api"
import '../lists.css'
import CreateTransaction from './CreateTransaction'
import EditTransaction from "./EditTransaction"
import Dialog from '@mui/material/Dialog'
import currencyFormatter from "../../utils/currencyFormatter"

function IncomeList({ type, globalRefresh, onRefresh }) {
    const [transactions, setTransactions] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [selected, SetSelected] = useState([])
    const [allSelected, setAllSelected] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [transaction, setTransaction] = useState('')

    useEffect(() => {
        const params = new URLSearchParams({
            type,
            orderby: '-transaction_date'
        })

        fetch(`/api/transactions/?${params.toString()}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setTransactions(data) })
    }, [globalRefresh, refresh, type])

    const handleDelete = (items) => {
        apiDelete(`/api/transactions/?type=${type}`, { items })
            .then(response => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok }) => {
                if (ok) {
                    setRefresh((current) => !current)
                    SetSelected([])
                    onRefresh?.()
                }
            })
    }

    const handleChange = (id) => {
        SetSelected(selectedItems => selectedItems.includes(id) ?
            selectedItems.filter((item) => item !== id) : [...selectedItems, id])
    }

    const handleSelectAll = () => {
        if (allSelected) {
            SetSelected([])
            setAllSelected(false)
        } else {
            SetSelected(transactions.map(transaction => transaction.id))
            setAllSelected(true)
        }
    }

    return (
        <div className="list-section">
            <CreateTransaction
                type={type}
                globalRefresh={globalRefresh}
                onRefresh={() => {
                    setRefresh((current) => !current)
                    onRefresh?.()
                }}
            />
            <h3 className="list-header">All {type}</h3>
            <table className="table-wrapper">
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Amount</td>
                        <td>Category</td>
                        <td>Notes</td>
                        <td>
                            <input type="checkbox"
                                checked={allSelected}
                                onChange={() => handleSelectAll()}></input>
                            <button className="btn"
                                onClick={() => {
                                    handleDelete(selected);
                                    setAllSelected(false)
                                }}>
                                Delete</button>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr
                            onClick={() => {
                                setEditDialog(true)
                                setTransaction(transaction)

                            }}
                            key={transaction.id}>
                            <td>{transaction.transaction_date}</td>
                            <td>{currencyFormatter.format(transaction.transaction_amount)}</td>
                            <td>{transaction.transaction_category_name}</td>
                            <td>{transaction.transaction_notes}</td>
                            <td><input
                                type="checkbox"
                                value={transaction.id}
                                checked={selected.includes(transaction.id)}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => handleChange(transaction.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
                <EditTransaction
                    type={type}
                    target={transaction}
                    onRefresh={() => {
                        setRefresh((current) => !current)
                        onRefresh?.()
                    }}
                    onClose={() => setEditDialog(false)}
                />
            </Dialog>
        </div>
    )
}

export default IncomeList
