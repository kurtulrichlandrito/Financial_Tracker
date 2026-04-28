import { useState, useEffect } from "react"
import { apiDelete } from "../../utils/api"
import '../lists.css'
function ExpenseList(globalRefresh, onRefresh) {
    const [expenses, setExpenses] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [selected, SetSelected] = useState([])
    const [allSelected, setAllSelected] = useState(false)

    const handleDelete = (items) => {
        apiDelete('/api/expense/', { items })
            .then(response => response.json())
            .then(data => setRefresh(!refresh))
    }
    useEffect(() => {
        fetch('/api/expense/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setExpenses(data))
    }, [globalRefresh, refresh])

    const handleChange = (id) => {
        SetSelected(selectedItems => selectedItems.includes(id) ?
            selectedItems.filter((item) => item !== id) : [...selectedItems, id])
    }

    const handleSelectAll = () => {
        if (allSelected) {
            SetSelected([])
            setAllSelected(false)
        } else {
            SetSelected(expenses.map(expense => expense.id))
            setAllSelected(true)
        }
    }


    return (
        <div className="list-section">
            <h3 className="list-header">All Expenses</h3>
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
                    {expenses.map((expense) => (
                        <tr key={expense.id}>
                            <td>{expense.expense_date}</td>
                            <td>{expense.expense_amount}</td>
                            <td>{expense.expense_category}</td>
                            <td>{expense.expense_notes}</td>
                            <td><input type="checkbox"
                                value={expense.id}
                                checked={selected.includes(expense.id)}
                                onChange={() => handleChange(expense.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}
export default ExpenseList