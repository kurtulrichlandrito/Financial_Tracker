import { useEffect, useState } from "react"
import '../categories.css'
import getDatePresetISO from '../../utils/dateHelper'
import '../lists.css'
import currencyFormatter from '../../utils/currencyFormatter'

function Reports() {
    const [accounts, setAccounts] = useState([])
    const [reportData, setReportData] = useState({
        total_expense: 0,
        total_income: 0,
        expenseCategoryTotals: {},
        incomeCategoryTotals: {}
    })
    const [filters, setFilters] = useState({
        account_id: 'all',
        date_start: getDatePresetISO('this_month'),
        orderby: '-transaction_date'
    })

    useEffect(() => {
        getAccounts()
    }, [])

    const getAccounts = () => {
        fetch('/api/account/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setAccounts(data))
    }

    useEffect(() => {
        const params = new URLSearchParams(filters)
        fetch(`/api/reports/?${params.toString()}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setReportData(data))
    }, [filters])

    return (
        <div className="account-page">
            <h1>Reports</h1>
            <p>Date</p>
            <select
                value={filters.date_start}
                onChange={(e) => {
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
            <select
                value={filters.account_id}
                onChange={(e) => {
                    setFilters((filter) => ({ ...filter, account_id: e.target.value }))
                }}>
                <option value="all" >All Accounts</option>

                {accounts.map((account) => {
                    return <option key={account.id} value={account.id}>{account.account_nickname}</option>
                })}
            </select>
            <h3>Total Expenses</h3>
            <p>{currencyFormatter.format(reportData.total_expense || 0)}</p>
            <h3>Total Income</h3>
            <p>{currencyFormatter.format(reportData.total_income || 0)}</p>
            <div className="list-section">
                <table className="table-wrapper">
                    <thead>
                        <tr>
                            <td>Expense Category Totals</td>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(reportData.expenseCategoryTotals || {}).map(([category, total]) =>
                        (<tr>
                            <td>{category === "null" ? "Uncategorized" : category}</td>
                            <td>{currencyFormatter.format(total || 0)}</td>
                        </tr>)
                        )}
                    </tbody>
                </table>
            </div>
            <div className="list-section">
                <table className="table-wrapper">
                    <thead>
                        <tr>
                            <td>Income Category Totals</td>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(reportData.incomeCategoryTotals || {}).map(([category, total]) =>
                        (<tr>
                            <td>{category === "null" ? "Uncategorized" : category}</td>
                            <td>{currencyFormatter.format(total || 0)}</td>
                        </tr>)
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


export default Reports
