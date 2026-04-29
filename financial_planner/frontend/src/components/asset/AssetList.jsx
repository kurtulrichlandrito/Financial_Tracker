import { useState, useEffect } from "react"

function AssetList({ globalRefresh, onRefresh }) {
    const [state, setState] = useState('')
    const [assets, setAssets] = useState([])

    useEffect(() => {
        fetch('/api/asset/', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => { setAssets(data) })
    }, [globalRefresh])
    return (
        <div>
            <h3>All Asset</h3>
            <table>
                <thead>
                    <tr>
                        <td>Asset Name</td>
                        <td>Amount</td>

                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset) => (
                        <tr key={asset.id}>
                            <td>{asset.asset_name}</td>
                            <td>{asset.asset_amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AssetList