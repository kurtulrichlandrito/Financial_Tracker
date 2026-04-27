import { useState, useEffect, Fragment } from "react"
import { apiPost, apiPatch } from '../../utils/api'

function CreateExpenseCategory(props) {
    const [expense_category, setExpenseCategory] = useState('')
    const [message, setMessage] = useState('')
    const [expense_categories, setExpenseCategories] = useState([])
    const [expenses, setExpenses] = useState([])
    const [groupedExpenses, setGroupExpenseCategory] = useState({})
    const [expandedRow, setExpandedRow] = useState(null)
    const [categorizedExpense, setCategorizedExpense] = useState({})
    const [submitMessage, setSubmitMessage] = useState('')
    const [refresh, setRefresh] = useState(false)


    const handleAddButton = () => {
        apiPost('/api/expense-category/', { expense_category })
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.Message)
                getCategories()
            })
    }


    const getCategories = () => {
        fetch('/api/expense-category/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setExpenseCategories(data))
    }

    useEffect(() => {
        getCategories()
    }, [])

    useEffect(() => {
        fetch('/api/get-grouped-expenses/', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                setGroupExpenseCategory(data)
                console.log(data)
                const suggestedCategories = {}
                Object.entries(data).forEach(([key, group]) => {
                    if (group.suggested_category) {
                        suggestedCategories[key] = group.suggested_category
                    }
                })
                setCategorizedExpense(suggestedCategories)
            })
    }, [refresh])

    const handleSubmit = () => {
        const categorizedData = Object.entries(categorizedExpense).map(([expenseGroupKey, category]) => ({
            category,
            expenseIds: (groupedExpenses[expenseGroupKey].expense || []).map(expense => expense.id)
        }))
        apiPatch('/api/expense/', categorizedData)
            .then(response => response.json())
            .then((data) => {
                setSubmitMessage(data.Message)
                setRefresh(!refresh)
            })
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
            <h2>Categorize Expenses</h2>
            <p>Expenses have been grouped automatically (Add choice later to separate)</p>
            <table>

                {Object.entries(groupedExpenses).map(([key, expenseGroup]) => (
                    <tbody key={key}>
                        <tr key={key} onClick={() => setExpandedRow(expandedRow === key ? null : key)}>
                            <td>{expandedRow === key ? '▼' : '▶'}</td>
                            <td>{key}</td>
                            <td>{expenseGroup.expense.length} transactions</td>
                            <td>
                                <select onClick={(e) => e.stopPropagation()} onChange={(e) => {
                                    setCategorizedExpense({
                                        ...categorizedExpense,
                                        [key]: e.target.value
                                    })
                                    setSubmitMessage('')
                                }
                                }
                                    defaultValue={expenseGroup.suggested_category ? expenseGroup.suggested_category : ''}>
                                    <option value="" disabled hidden>Please choose...</option>
                                    {expense_categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.expense_category}>
                                            {category.expense_category}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        {expandedRow === key && expenseGroup.expense.map((expense) => (
                            <tr key={expense.id}>
                                <td></td>
                                <td>{expense.expense_date}</td>
                                <td>{expense.expense_amount}</td>
                            </tr>
                        ))}
                    </tbody>
                ))}

            </table>
            {Object.keys(groupedExpenses).length > 0 ? (
                <>
                    {submitMessage && <p>{submitMessage}</p>}
                    <button onClick={handleSubmit}>Submit</button>
                </>
            ) : (
                <p>All expenses are categorized!</p>
            )}
        </div>
    )
}


export default CreateExpenseCategory