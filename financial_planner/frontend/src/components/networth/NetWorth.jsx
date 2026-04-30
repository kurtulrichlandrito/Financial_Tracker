import { useEffect, useState } from "react"
import apiPost from '../../utils/api'
import '../categories.css'

function NetWorth({ globalRefresh }) {
    const [assets, setAssets] = useState([])
    const [liabilities, setLiabilities] = useState([])
    const [netWorth, setNetWorth] = useState({})
    const [message, setMessage] = useState('')

    const getAssets = () => {
        fetch('/api/asset/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setAssets(data))
    }
    const getLiabilities = () => {
        fetch('/api/liability/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setLiabilities(data))
    }
    const getNetWorth = () => {
        fetch('/api/net-worth/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setNetWorth(data))
    }
    useEffect(() => {
        getAssets()
        getLiabilities()
        getNetWorth()
    }, [globalRefresh])

    return (
        <div className="account-page">
            <h1>Net Worth</h1>
            <button>+ Add Asset</button>
            <button>+ Add Liability</button>
            <div>
                <table>
                    <thead>
                        <tr>
                            <td>Net Worth</td>
                            <td>Total Asset</td>
                            <td> Net Liabilities</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{netWorth.net_worth}</td>
                            <td>{netWorth.total_assets}</td>
                            <td>{netWorth.total_liabilities}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <p>Net worth over time</p>

            </div>
            <div>
                <table >
                    <thead>
                        <tr>
                            <td>ASSETS</td>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => {
                            return <tr key={asset.id} className="text-center">
                                <td><h4>{asset.asset_name}</h4></td>
                                <td><h4>{asset.asset_amount}</h4></td>
                            </tr>
                        })}
                    </tbody>
                </table>

            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <td>LIABILITIES</td>
                        </tr>
                    </thead>
                    <tbody>
                        {liabilities.map((liability) => {
                            return <tr key={liability.id} className="text-center">
                                <td><h4>{liability.liability_name}</h4></td>
                                <td><h4>-{liability.liability_amount}</h4></td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


export default NetWorth
