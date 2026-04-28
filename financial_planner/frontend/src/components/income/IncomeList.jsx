import { useState, useEffect } from "react"
import { apiDelete } from "../../utils/api"
import '../lists.css'
function IncomeList(globalRefresh, onRefresh) {
    const [incomes, setIncomes] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [selected, SetSelected] = useState([])
    const [allSelected, setAllSelected] = useState(false)

    useEffect(() => {
        fetch('/api/income/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setIncomes(data) })
    }, [globalRefresh, refresh])

    const handleDelete = (items) => {
        apiDelete('/api/income/', { items })
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
            SetSelected(incomes.map(expense => expense.id))
            setAllSelected(true)
        }
    }

    return (
        <div className="list-section">
            <h3 className="list-header">All Income</h3>
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
                    {incomes.map((income) => (
                        <tr key={income.id}>
                            <td>{income.income_date}</td>
                            <td>{income.income_amount}</td>
                            <td>{income.income_category}</td>
                            <td>{income.income_notes}</td>
                            <td><input type="checkbox"
                                value={income.id}
                                checked={selected.includes(income.id)}
                                onChange={() => handleChange(income.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default IncomeList