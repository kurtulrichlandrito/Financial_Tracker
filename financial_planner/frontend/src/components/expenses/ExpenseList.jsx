import { useState, useEffect } from "react"

function ExpenseList(props) {
    const [state, setState] = useState('')
    const [expenses, setExpenses] = useState([])

    useEffect(() => {
        fetch('/api/expense/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setExpenses(data) })
    }, [props.refresh])
    return (
        <div>
            <h3>All Expenses</h3>
            <table>
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Amount</td>
                        <td>Category</td>
                        <td>Notes</td>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id}>
                            <td>{expense.expense_date}</td>
                            <td>{expense.expense_amount}</td>
                            <td>{expense.expense_category}</td>
                            <td>{expense.expense_notes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default ExpenseList