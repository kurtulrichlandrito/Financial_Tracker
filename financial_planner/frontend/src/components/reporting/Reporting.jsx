import { useEffect, useState } from "react"
import apiPost from '../../utils/api'
import '../categories.css'
import getDatePresetISO from '../../utils/dateHelper'
import '../lists.css'

function SearchTransactions() {
    const [expenseCategories, setExpenseCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])
    const [type, setType] = useState('all')
    const [accounts, setAccounts] = useState([])
    const [message, setMessage] = useState('')
    const [allSelected, setAllSelected] = useState(false)
    const [selected, SetSelected] = useState([])
    const allCategories = [...expenseCategories, ...incomeCategories]
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
        getExpenseCategories()
        getIncomeCategories()
    }, [])


    const getExpenseCategories = () => {
        fetch('/api/expense-category/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => {
                setExpenseCategories(data)
            })
    }
    const getIncomeCategories = () => {
        fetch('/api/income-category/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => {
                setIncomeCategories(data)
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
            .then((data) => setFilteredTransactions(data))
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
            <h1>Reporting</h1>
            <input type="text" placeholder="Search" onChange={(e) => { setFilters((filter) => ({ ...filter, search_value: e.target.value })) }} />
            <button onClick={() => handleSearch()}>Search</button>
            <p>Accounts</p>
            <select defaultValue={"all"}
                onChange={(e) => { setFilters((filter) => ({ ...filter, account: e.target.value })) }}>
                <option value="all" >All Accounts</option>
                {accounts.map((account) => {
                    return <option key={account.id} value={account.id}>{account.account_nickname}</option>
                })}
            </select>
            <p>Categories</p>
            <select onChange={(e) => { setFilters((filter) => ({ ...filter, category: e.target.value })) }}>
                <option value="all">All Categories</option>
                {(type === "all" ? allCategories : type === 'expense' ? expenseCategories : incomeCategories).map((category) => {
                    return <option key={`${category.id}${category.expense_category || category.income_category}`} value={category.id}>{category.expense_category || category.income_category}</option>
                })}
            </select>
            <p>Types</p>
            <select onChange={(e) => { setFilters((filter) => ({ ...filter, type: e.target.value })) }}
                defaultValue={"all"}>
                <option value="all" >All Types</option>
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
                                <td>{transaction.expense_date || transaction.income_date}</td>
                                <td>{transaction.expense_amount || transaction.income_amount}</td>
                                <td>{transaction.expense_category || transaction.income_category}</td>
                                <td>{transaction.expense_notes || transaction.income_notes}</td>
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