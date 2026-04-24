import { useState } from "react"
import apiPost from '../../utils/api'

function CreateIncomeCategory() {
    const [income_category, setIncomeCategory] = useState('')
    const [message, setMessage] = useState('')

    const handleAddButton = () => {
        apiPost('/api/create-income-category', { income_category })
            .then((response) => response.json())
            .then((data) => setMessage(data.Message))
    }
    return (
        <div>
            <h1>Add An Income Category</h1>
            <input type="text" onChange={(e) => {
                setIncomeCategory(e.target.value)
                setMessage('')
            }} />
            <button onClick={handleAddButton}>Add</button>
            {message && <p>{message}: {income_category}</p>}
        </div>
    )
}


export default CreateIncomeCategory