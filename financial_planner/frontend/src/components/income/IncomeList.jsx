import { useState, useEffect } from "react"

function IncomeList(props) {
    const [state, setState] = useState('')
    const [incomes, setIncomes] = useState([])

    useEffect(() => {
        fetch('/api/income/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setIncomes(data) })
    }, [props.refresh])
    return (
        <div>
            <h3>All Income</h3>
            <table>
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Amount</td>
                        <td>Category</td>
                        <td>Notes</td>
                    </tr>
                </thead>
                <tbody>
                    {incomes.map((income) => (
                        <tr key={income.id}>
                            <td>{income.income_date}</td>
                            <td>{income.income_amount}</td>
                            <td>{income.income_category}</td>
                            <td>{income.income_notes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default IncomeList