import { useState, useEffect } from "react"
import { apiDelete } from "../../utils/api"
import '../lists.css'
function IncomeList({ type, globalRefresh, onRefresh }) {
    const [transactions, setTransactions] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [selected, SetSelected] = useState([])
    const [allSelected, setAllSelected] = useState(false)

    useEffect(() => {
        fetch(`/api/transactions/?type=${type}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setTransactions(data) })
    }, [globalRefresh, refresh])

    const handleDelete = (items) => {
        apiDelete(`/api/transactions/?type=${type}`, { items })
            .then(response => response.json())
            .then(data => setRefresh(!refresh))
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
                                onClick={() => { handleDelete(selected); setAllSelected(false) }}>
                                Delete</button>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.transaction_date}</td>
                            <td>{transaction.transaction_amount}</td>
                            <td>{transaction.transaction_category}</td>
                            <td>{transaction.transaction_notes}</td>
                            <td><input type="checkbox"
                                value={transaction.id}
                                checked={selected.includes(transaction.id)}
                                onChange={() => handleChange(transaction.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default IncomeList