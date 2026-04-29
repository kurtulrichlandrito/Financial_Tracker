import { useEffect, useState } from "react"
import apiPost from '../../utils/api'
import '../categories.css'
import getDatePresetISO from '../../utils/dateHelper'
import '../lists.css'
import TransactionsList from '../transactions/TransactionsList'

function SearchTransactions() {
    const [transactionCategories, setTransactionCategories] = useState([])
    const [message, setMessage] = useState('')
    const [accounts, setAccounts] = useState([])
    const [allSelected, setAllSelected] = useState(false)
    const [selected, SetSelected] = useState([])
    const [type, setType] = useState('all')
    const [filters, setFilters] = useState({
        search_value: '',
        account_id: 'all',
        category: 'all',
        type: 'all',
        date_start: getDatePresetISO('this_month')
    })
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const params = new URLSearchParams()
    useEffect(() => {
        getAccounts()
        getCategories()
    }, [])


    const getCategories = () => {
        fetch('/api/categories/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => {
                setTransactionCategories(data)
            })
    }

    const getAccounts = () => {
        fetch('/api/account/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setAccounts(data))
    }

    const handleSearch = () => {
        const params = new URLSearchParams(filters)
        fetch(`/api/search?${params.toString()}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => { setFilteredTransactions(data); console.log(data) })
    }
    const handleSelectAll = () => {
        if (allSelected) {
            SetSelected([])
            setAllSelected(false)
        } else {
            SetSelected(filteredTransactions.map(transaction => transaction.id))
            setAllSelected(true)
        }
    }

    return (
        <div className="account-page">
            <h1>Transactions</h1>
            <input type="text"
                placeholder="Search"
                onChange={(e) => {
                    setFilteredTransactions([])
                    setFilters((filter) => ({ ...filter, search_value: e.target.value }))
                }} />
            <button onClick={() => handleSearch()}>Search</button>
            <p>Accounts</p>
            <select defaultValue={"all"}
                onChange={(e) => {
                    setFilteredTransactions([])
                    setFilters((filter) => ({ ...filter, account: e.target.value }))
                }}>
                <option value="all" >All Accounts</option>
                {accounts.map((account) => {
                    return <option key={account.id} value={account.id}>{account.account_nickname}</option>
                })}
            </select>
            <p>Categories</p>
            <select onChange={(e) => {
                setFilteredTransactions([])
                setFilters((filter) => ({ ...filter, category: e.target.value }))
            }}>
                <option value="all">All Categories</option>
                {transactionCategories.map((category) => {
                    if (filters.type !== 'all' && category.transaction_type !== filters.type) return

                    return <option key={`${category.id}${category.transaction_category}`}
                        value={category.id}>{category.transaction_category}</option>
                })}
            </select>
            <p>Types</p>
            <select onChange={(e) => {
                setFilteredTransactions([])
                setFilters((filter) => ({ ...filter, type: e.target.value }))
            }}
                defaultValue={"all"}>
                <option value="all">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
            </select>
            <p>Date</p>
            <select onChange={(e) => { setFilters((filter) => ({ ...filter, date_start: e.target.value })) }}>
                <option value={getDatePresetISO('this_month')}>This Month</option>
                <option value={getDatePresetISO('last_month')}>Last Month</option>
                <option value={getDatePresetISO('last_3_months')}>Last 3 Months</option>
                <option value={getDatePresetISO('this_year')}>This Year</option>
                <option value="">Custom Range</option>
            </select>

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
                        {filteredTransactions.map((transaction) => (
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
        </div>
    )
}


export default SearchTransactions