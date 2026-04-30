import { useState, useEffect } from "react"
import { PieChart } from '@mui/x-charts/PieChart';
import currencyFormatter from "../../utils/currencyFormatter";

const chartColors = [
    '#ff4326', '#ffcf48', '#6c45f5', '#36A2EB',
    '#9966FF', '#FF9F40', '#E7E9ED', '#71B37C',
    '#A78BFA', '#F87171', '#34D399', '#60A5FA'
]



function Charts({ type, globalRefresh }) {
    const [transactions, setTransactions] = useState([])
    const [dateView, setDateView] = useState('all')

    useEffect(() => {
        const params = new URLSearchParams({
            type,
            orderby: '-transaction_date'
        })

        fetch(`/api/transactions/?${params.toString()}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setTransactions(data))
    }, [globalRefresh, type])

    const isInSelectedDateView = (transaction) => {
        if (dateView === 'all') return true

        const transactionDate = new Date(`${transaction.transaction_date}T00:00:00`)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (dateView === 'monthly') {
            return transactionDate.getFullYear() === today.getFullYear()
                && transactionDate.getMonth() === today.getMonth()
        }

        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        return transactionDate >= weekStart && transactionDate <= weekEnd
    }

    const processData = () => {
        const categoryTotals = transactions
            .filter(isInSelectedDateView)
            .reduce((totals, transaction) => {
                const category = transaction.transaction_category_name || 'Uncategorized'
                const amount = Math.abs(parseFloat(transaction.transaction_amount || 0))

                return {
                    ...totals,
                    [category]: (totals[category] || 0) + amount
                }
            }, {})

        return Object.entries(categoryTotals)
            .filter(([, amount]) => amount > 0)
            .map(([category, amount], index) => ({
                id: category,
                label: category,
                value: amount,
                color: chartColors[index % chartColors.length]
            }))
    }

    const chartData = processData()
    const totalAmount = chartData.reduce((total, item) => total + item.value, 0)

    return (
        <div style={{
            width: '320px',
            minHeight: '320px',
            margin: '0 auto',
            textAlign: 'center'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
            }}>
                <h2 style={{ margin: 0 }}>{type.toUpperCase()}</h2>
                <select
                    value={dateView}
                    onChange={(event) => setDateView(event.target.value)}>
                    <option value="all">All Time</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                </select>
            </div>

            <div style={{ position: 'relative', height: '220px' }}>
                <PieChart
                    hideLegend
                    width={320}
                    height={220}
                    margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                    series={[
                        {
                            data: chartData,
                            innerRadius: 82,
                            outerRadius: 98,
                            paddingAngle: 1,
                            cornerRadius: 12,
                            startAngle: -115,
                            endAngle: 115,
                            cx: 160,
                            cy: 120,
                        }
                    ]}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '180px',
                    transform: 'translate(-50%, -50%)',
                    width: '190px',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        fontSize: '2.15rem',
                        lineHeight: 1,
                        fontWeight: 700,
                        letterSpacing: '-0.04em',
                        textAlign: 'center',
                        width: '190px'
                    }}>
                        {totalAmount === 0 ? "" : currencyFormatter.format(totalAmount)}
                    </div>
                    <div style={{
                        marginTop: '0.55rem',
                        color: '#555',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        width: '190px'
                    }}>
                        {totalAmount === 0 ? "" : dateView === 'all' ? 'All Time' : dateView === 'weekly' ? 'This Week' : 'This Month'}
                    </div>
                </div>
            </div>

            <div className="legend-row" >
                {chartData.map((item) => (
                    <span key={item.id} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: item.color }} />
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default Charts
