import { useEffect, useState } from "react"
import apiPost from '../../utils/api'
import '../categories.css'
import getDatePresetISO from '../../utils/dateHelper'
import '../lists.css'
import TransactionsList from '../transactions/TransactionsList'

function Reports() {
    const [transactionCategories, setTransactionCategories] = useState([])
    const [message, setMessage] = useState('')
    const [accounts, setAccounts] = useState([])
    const [allSelected, setAllSelected] = useState(false)
    const [selected, SetSelected] = useState([])
    const [filters, setFilters] = useState({
        type: 'all',
        date_start: getDatePresetISO('this_month')
    })
    const params = new URLSearchParams()
    useEffect(() => {
        getAccounts()
        getCategories()
    }, [])


    const getCategories = () => {
        fetch('/api/reports/', {
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
            <h1>Reports</h1>
            <p>Date</p>
            <select onChange={(e) => { setFilters((filter) => ({ ...filter, date_start: e.target.value })) }}>
                <option value={getDatePresetISO('this_month')}>This Month</option>
                <option value={getDatePresetISO('last_month')}>Last Month</option>
                <option value={getDatePresetISO('last_3_months')}>Last 3 Months</option>
                <option value={getDatePresetISO('this_year')}>This Year</option>
                <option value="">Custom Range</option>
            </select>

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
            <button onClick={() => getCategories()}>asdfa</button>
        </div>
    )
}


export default Reports