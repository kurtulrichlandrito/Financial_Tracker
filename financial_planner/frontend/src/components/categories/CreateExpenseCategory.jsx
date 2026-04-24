import { useState } from "react"
import apiPost from '../../utils/api'

function CreateExpenseCategory() {
    const [expense_category, setExpenseCategory] = useState('')
    const [message, setMessage] = useState('')

    const handleAddButton = () => {
        apiPost('/api/create-expense-category', { expense_category })
            .then((response) => response.json())
            .then((data) => setMessage(data.Message))
            .catch()
    }
    return (
        <div>
            <h1>Add An Expense Category</h1>
            <input type="text" onChange={(e) => {
                setExpenseCategory(e.target.value)
                setMessage('')
            }} />
            <button onClick={handleAddButton}>Add</button>
            {message && <p>{message}: {expense_category}</p>}
        </div>
    )
}


export default CreateExpenseCategory