import { useState, useEffect } from "react"
import { apiPost, apiPatch } from '../../utils/api'
import '../global.css'
import '../categories.css'
import currencyFormatter from '../../utils/currencyFormatter'
function CreateTransactionCategory({ type, globalRefresh, onRefresh }) {
    const [transaction_category, setTransactionCategory] = useState('')
    const [message, setMessage] = useState('')
    const [transaction_categories, setTransactionCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [groupedTransactions, setGroupTransactionCategory] = useState({})
    const [expandedRow, setExpandedRow] = useState(null)
    const [categorizedTransaction, setCategorizedTransaction] = useState({})
    const [submitMessage, setSubmitMessage] = useState('')
    const [refresh, setRefresh] = useState(false)
    const [addedCategory, setAddedCategory] = useState('')
    const [addingCategoryFor, setAddingCategoryFor] = useState(null)
    const apiBase = `/api/categories/?type=${type}`
    const groupedApi = `/api/get-grouped-transactions/?${new URLSearchParams({
        type,
        orderby: '-transaction_date'
    }).toString()}`

    const handleAddButton = (transactionGroupKey) => {
        const newCategory = transaction_category.trim()

        if (!newCategory) return

        apiPost(apiBase, {
            'transaction_category': newCategory,
            'transaction_type': type
        })
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.Message)
                setAddedCategory(newCategory)

                if (ok) {
                    setTransactionCategories((categories) => {
                        const exists = categories.some((category) =>
                            category.transaction_category === newCategory)

                        if (exists) return categories

                        return [
                            ...categories,
                            {
                                id: `new-${newCategory}`,
                                transaction_category: newCategory,
                                transaction_type: type
                            }
                        ]
                    })
                    setCategorizedTransaction((current) => ({
                        ...current,
                        [transactionGroupKey]: newCategory
                    }))
                    setAddingCategoryFor(null)
                    setTransactionCategory('')
                    getCategories()
                    onRefresh?.()
                }
            })
    }


    const getCategories = () => {
        fetch(apiBase, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setTransactionCategories(data))
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
                setGroupTransactionCategory(data)
                const suggestedCategories = {}
                Object.entries(data).forEach(([key, group]) => {
                    if (group.suggested_category) {
                        suggestedCategories[key] = group.suggested_category
                    }
                })
                setCategorizedTransaction(suggestedCategories)
            })
    }, [globalRefresh, refresh])

    const handleSubmit = () => {
        const categorizedData = Object.entries(categorizedTransaction)
            .map(([transactionGroupKey, category]) => ({
                category,
                ['transaction_Ids']: (groupedTransactions[transactionGroupKey]['transaction'] || [])
                    .map(transaction => transaction.id)
            }))

        apiPatch('/api/categorize-transactions/', categorizedData)
            .then(response => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setSubmitMessage(data.Message)

                if (ok) {
                    setRefresh((current) => !current)
                    onRefresh?.()
                }
            })
    }

    return (
        <div className="category-page">
            <h2>Categorize transactions</h2>
            <p>transactions have been grouped automatically (Add choice later to separate)</p>
            {message && <p>{message}: {addedCategory}</p>}
            <table className="category-table-wrapper">

                {Object.entries(groupedTransactions).map(([key, transactionGroup]) => (
                    <tbody key={key}>
                        <tr key={key}
                            onClick={() => setExpandedRow(expandedRow === key ? null : key)}
                            className="expandable-row">
                            <td className="expand-icon">{expandedRow === key ? '▼' : '▶'}</td>
                            <td>{key}</td>
                            <td>{transactionGroup['transaction'].length} transactions</td>
                            <td>
                                <select onClick={(e) => e.stopPropagation()} onChange={(e) => {
                                    if (e.target.value === 'add_new') {
                                        setAddingCategoryFor(key)
                                        setTransactionCategory('')
                                        return
                                    }

                                    setCategorizedTransaction({
                                        ...categorizedTransaction,
                                        [key]: e.target.value
                                    })
                                    setAddingCategoryFor(null)
                                    setSubmitMessage('')
                                }
                                }
                                    value={categorizedTransaction[key] || ''}>
                                    <option value="" disabled hidden>Please choose...</option>
                                    {transaction_categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.transaction_category}>
                                            {category.transaction_category}
                                        </option>
                                    ))}
                                    <option value="add_new">Add new category...</option>
                                </select>
                                {addingCategoryFor === key && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <input
                                            id="input"
                                            type="text"
                                            value={transaction_category}
                                            onChange={(e) => {
                                                setTransactionCategory(e.target.value)
                                                setMessage('')
                                            }} />
                                        <button className="btn"
                                            onClick={() => handleAddButton(key)}
                                            style={{ width: '50%', justifyContent: 'center' }}
                                        >Add
                                        </button>
                                        <button className="btn"
                                            onClick={() => {
                                                setAddingCategoryFor(null)
                                                setTransactionCategory('')
                                                setMessage('')
                                            }}
                                            style={{ width: '50%', justifyContent: 'center' }}
                                        >Cancel
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                        {expandedRow === key && transactionGroup.transaction.map((transaction) => (
                            <tr key={transaction.id}>
                                <td></td>
                                <td>{transaction.transaction_notes}</td>
                                <td>{transaction.transaction_date}</td>
                                <td>{currencyFormatter.format(transaction.transaction_amount)}</td>

                            </tr>
                        ))}
                    </tbody>
                ))}

            </table>
            {Object.keys(groupedTransactions).length > 0 ? (
                <>
                    {submitMessage && <p>{submitMessage}</p>}
                    <button className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => { handleSubmit(); }}>Submit</button>
                </>
            ) : (
                <p>All transactions are categorized!</p>
            )}
        </div>
    )
}


export default CreateTransactionCategory
