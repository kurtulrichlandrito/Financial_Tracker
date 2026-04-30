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
    const [reportData, setReportData] = useState({
        total_expense: 0,
        total_income: 0,
        categoryTotals: {}
    })
    const [filters, setFilters] = useState({
        account_id: 'all',
        date_start: getDatePresetISO('this_month'),
        orderby: '-transaction_date'
    })

    const params = new URLSearchParams()
    useEffect(() => {
        getAccounts()
    }, [])

    const resetData = () => {
        setReportData({
            total_expense: 0,
            total_income: 0,
            categoryTotals: {}
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

    const getCategories = () => {
        fetch('/api/categories/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setTransactionCategories(data))
    }

    const handleSearch = () => {
        const params = new URLSearchParams(filters)
        fetch(`/api/reports/?${params.toString()}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => { setReportData(data); console.log(data) })
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
            <select onChange={(e) => {
                resetData()
                setFilters((filter) => ({ ...filter, date_start: e.target.value }))
            }}>
                <option value={getDatePresetISO('this_month')}>
                    {new Date(new Date().setMonth(new Date().getMonth()))
                        .toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                <option value={getDatePresetISO('last_month')}>{new Date(new Date().setMonth(new Date().getMonth() - 1))
                    .toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                <option value={getDatePresetISO('last_3_months')}>Last 3 Months</option>
                <option value={getDatePresetISO('this_year')}>This Year</option>
                <option value="">Custom Range</option>
            </select>

            <p>Accounts</p>
            <select defaultValue={"all"}
                onChange={(e) => {
                    resetData()
                    setFilters((filter) => ({ ...filter, account_id: e.target.value }))
                }}>
                <option value="all" >All Accounts</option>

                {accounts.map((account) => {
                    return <option key={account.id} value={account.id}>{account.account_nickname}</option>
                })}
            </select>
            <button onClick={() => handleSearch()}>Click</button>
            <h3>Total Expenses</h3>
            <p>{reportData.total_expense}</p>
            <h3>Total Income</h3>
            <p>{reportData.total_income}</p>
            <div className="list-section">
                <table className="table-wrapper">
                    <thead>
                        <tr>
                            <td>Category Totals</td>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(reportData.categoryTotals).map(([category, total]) =>
                        (<tr>
                            <td>{category === "null" ? "Uncategorized" : category}</td>
                            <td>{total}</td>
                        </tr>)
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


export default Reports
