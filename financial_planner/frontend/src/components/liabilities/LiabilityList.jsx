import { useState, useEffect } from "react"

function LiabilityList({ globalRefresh, onRefresh }) {
    const [liabilities, setLiabilities] = useState([])

    useEffect(() => {
        fetch('/api/liability/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setLiabilities(data) })
    }, [globalRefresh])
    return (
        <div>
            <h3>All Liabilities</h3>
            <table>
                <thead>
                    <tr>
                        <td>Liability Name</td>
                        <td>Amount</td>

                    </tr>
                </thead>
                <tbody>
                    {liabilities.map((liability) => (
                        <tr key={liability.id}>
                            <td>{liability.liability_name}</td>
                            <td>{liability.liability_amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default LiabilityList