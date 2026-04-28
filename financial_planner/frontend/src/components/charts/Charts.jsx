import { useState, useEffect } from "react"
import { PieChart } from '@mui/x-charts/PieChart';

function Charts({ type, globalRefresh }) {
    const [expenseData, setExpenseData] = useState({})
    const [expenseCategories, setExpenseCategories] = useState({})

    useEffect(() => {
        fetch(`/api/${type}/`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setExpenseData(data))
    }, [globalRefresh])
    useEffect(() => {
        fetch(`/api/${type}-category/`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setExpenseCategories(data) })
    }, [globalRefresh])
    const processData = () => {
        const categories = Object.values(expenseCategories).map(category => category[`${type}_category`])
        const getColors = (count) => {
            const colors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#E7E9ED', '#71B37C',
                '#A78BFA', '#F87171', '#34D399', '#60A5FA'
            ]
            return Array.from({ length: count }, (_, i) => colors[i % colors.length])
        }
        const colors = getColors(categories.length)
        const categoryColors = categories.map((category, index) => { category: colors[index] })
        const totalExpense = Object.values(expenseData).reduce((total, expense) => total + -parseFloat(expense[`${type}_amount`]), 0)
        const data = categories.flatMap((category) => {
            const categoryTotalAmount = Object.values(expenseData)
                .filter((expense) => expense[`${type}_category`] === category)
                .reduce((total, expense) => total + parseFloat(expense[`${type}_amount`]), 0);
            if (categoryTotalAmount > 0) {
                return {
                    id: category,
                    label: `${category}`,
                    value: categoryTotalAmount,
                    percentage: (categoryTotalAmount / totalExpense) * 100,
                    color: categoryColors[category]
                }
            }

        })
        return data.filter(Boolean)
    }

    return (
        <div style={{ height: '300px', width: 'auto' }}>
            <h2>{type.toUpperCase()}</h2>
            <PieChart
                series={[
                    {
                        data: processData(),
                        innerRadius: 50,
                        outerRadius: 100,
                        paddingAngle: .5,
                        cornerRadius: 5,
                        startAngle: 0,
                        endAngle: 360,
                        cx: 150,
                        cy: 150,

                    }
                ]}
            />
        </div>
    )
}

export default Charts