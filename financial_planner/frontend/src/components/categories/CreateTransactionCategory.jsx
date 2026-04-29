import { useState, useEffect, Fragment } from "react"
import { apiPost, apiPatch } from '../../utils/api'
import '../global.css'
import '../categories.css'
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
    const apiBase = `/api/categories/?type=${type}`
    const groupedApi = `/api/get-grouped-transactions/?type=${type}`

    const handleAddButton = () => {
        apiPost(apiBase, {
            'transaction_category': transaction_category,
            'transaction_type': type
        })
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.Message)
                setAddedCategory(transaction_category)
                setTransactionCategory('')
                getCategories()
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
            <input id="input"
                type="text"
                value={transaction_category}
                onChange={(e) => {
                    setTransactionCategory(e.target.value)
                    setMessage('')
                }} />
            <button className="btn"
                onClick={handleAddButton}
                style={{ width: '100%', justifyContent: 'center' }}
            >Add
            </button>

            {message && <p>{message}: {addedCategory}</p>}

            <h2>Categorize transactions</h2>
            <p>transactions have been grouped automatically (Add choice later to separate)</p>
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
                                    setCategorizedTransaction({
                                        ...categorizedTransaction,
                                        [key]: e.target.value
                                    })
                                    setSubmitMessage('')
                                }
                                }
                                    defaultValue={transactionGroup.suggested_category ?
                                        transactionGroup.suggested_category : ''}>
                                    <option value="" disabled hidden>Please choose...</option>
                                    {transaction_categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.transaction_category}>
                                            {category.transaction_category}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        {expandedRow === key && transactionGroup.transaction.map((transaction) => (
                            <tr key={transaction.id}>
                                <td></td>
                                <td>{transaction.transaction_notes}</td>
                                <td>{transaction.transaction_date}</td>
                                <td>{transaction.transaction_amount}</td>

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