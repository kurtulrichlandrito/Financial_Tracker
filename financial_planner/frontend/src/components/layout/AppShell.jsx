import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import apiPost from "../../utils/api"

const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Accounts', path: '/accounts' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Categories', path: '/categories' },
    { label: 'Assets', path: '/assets' },
    { label: 'Liabilities', path: '/liabilities' },
    { label: 'Net Worth', path: '/net-worth' },
    { label: 'Reports', path: '/reports' },
    { label: 'Charts', path: '/charts' },
]

function AppShell() {
    const [globalRefresh, setGlobalRefresh] = useState(false)
    const navigate = useNavigate()

    const reload = () => setGlobalRefresh((current) => !current)

    const handleLogout = () => {
        apiPost('/api/logout/')
            .then((response) => response.json())
            .then((data) => {
                if (data.Message === 'Logout Successful') navigate('/login')
            })
    }

    const navClass = ({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="app-brand">
                    <p className="eyebrow">Finance</p>
                    <h1 className="app-brand__title">Planner</h1>
                </div>
                <nav className="app-nav">
                    {navItems.map((item) => (
                        <NavLink key={item.path} to={item.path} className={navClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="app-main">
                <header className="app-topbar">
                    <div className="app-topbar__row">
                        <div>
                            <p className="eyebrow">Personal finance</p>
                            <h2 className="app-topbar__title">Money dashboard</h2>
                        </div>
                        <button className="button-secondary" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                    <nav className="app-mobile-nav">
                        {navItems.map((item) => (
                            <NavLink key={item.path} to={item.path} className={navClass}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </header>

                <main className="page-content">
                    <Outlet context={{ globalRefresh, reload }} />
                </main>
            </div>

            <nav className="app-bottom-nav">
                {navItems.slice(0, 5).map((item) => (
                    <NavLink key={item.path} to={item.path} className={navClass}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}

export default AppShell
