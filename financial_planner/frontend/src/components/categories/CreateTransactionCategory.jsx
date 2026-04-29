import { useState, useEffect, Fragment } from "react"
import { apiPost, apiPatch } from '../../utils/api'
import '../global.css'
import '../categories.css'
function CreateTransactionCategory({ type, globalRefresh, onRefresh }) {
    const [expense_category, setExpenseCategory] = useState('')
    const [message, setMessage] = useState('')
    const [expense_categories, setExpenseCategories] = useState([])
    const [expenses, setExpenses] = useState([])
    const [groupedExpenses, setGroupExpenseCategory] = useState({})
    const [expandedRow, setExpandedRow] = useState(null)
    const [categorizedExpense, setCategorizedExpense] = useState({})
    const [submitMessage, setSubmitMessage] = useState('')
    const [refresh, setRefresh] = useState(false)
    const [addedCategory, setAddedCategory] = useState('')
    const apiBase = `/api/${type}-category/`
    const groupedApi = `/api/get-grouped-${type}s/`
    const updateApi = `/api/categorize-${type}s/`

    const handleAddButton = () => {
        apiPost(apiBase, { [`${type}_category`]: expense_category })
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.Message)
                setAddedCategory(expense_category)
                setExpenseCategory('')
                getCategories()
            })
    }


    const getCategories = () => {
        fetch(apiBase, {
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
        fetch(groupedApi, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                setGroupExpenseCategory(data)
                const suggestedCategories = {}
                Object.entries(data).forEach(([key, group]) => {
                    if (group.suggested_category) {
                        suggestedCategories[key] = group.suggested_category
                    }
                })
                setCategorizedExpense(suggestedCategories)
            })
    }, [globalRefresh, refresh])

    const handleSubmit = () => {
        const categorizedData = Object.entries(categorizedExpense).map(([expenseGroupKey, category]) => ({
            category,
            [`${type}Ids`]: (groupedExpenses[expenseGroupKey][`${type}`] || []).map(expense => expense.id)
        }))
        console.log(categorizedData)
        apiPatch(updateApi, categorizedData)
            .then(response => response.json())
            .then((data) => {
                setSubmitMessage(data.Message)
                setRefresh(!refresh)
                onRefresh()
            })
    }

    return (
        <div className="category-page">
            <h1>Add An {type.toUpperCase()} Category</h1>
            <input id="input" type="text" value={expense_category} onChange={(e) => {
                setExpenseCategory(e.target.value)
                setMessage('')
            }} />
            <button className="btn"
                onClick={handleAddButton}
                style={{ width: '100%', justifyContent: 'center' }}>Add</button>
            {message && <p>{message}: {addedCategory}</p>}
            <h2>Categorize Expenses</h2>
            <p>Expenses have been grouped automatically (Add choice later to separate)</p>
            <table className="category-table-wrapper">

                {Object.entries(groupedExpenses).map(([key, expenseGroup]) => (
                    <tbody key={key}>
                        <tr key={key} onClick={() => setExpandedRow(expandedRow === key ? null : key)} className="expandable-row">
                            <td className="expand-icon">{expandedRow === key ? '▼' : '▶'}</td>
                            <td>{key}</td>
                            <td>{expenseGroup[`${type}`].length} transactions</td>
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
                                            value={category[`${type}_category`]}>
                                            {category[`${type}_category`]}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        {expandedRow === key && expenseGroup[`${type}`].map((expense) => (
                            <tr key={expense.id}>
                                <td></td>
                                <td>{expense[`${type}_notes`]}</td>
                                <td>{expense[`${type}_date`]}</td>
                                <td>{expense[`${type}_amount`]}</td>

                            </tr>
                        ))}
                    </tbody>
                ))}

            </table>
            {Object.keys(groupedExpenses).length > 0 ? (
                <>
                    {submitMessage && <p>{submitMessage}</p>}
                    <button className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => { handleSubmit(); }}>Submit</button>
                </>
            ) : (
                <p>All expenses are categorized!</p>
            )}
        </div>
    )
}


export default CreateTransactionCategory