# Financial Planner — Dev Notes
**Date:** April 24, 2026

---

## Auth Flow

### Login
- Wrapped fields in a `<form>` tag and used `onSubmit` instead of `onClick` on the button
- Added `e.preventDefault()` in the handler to stop the browser from reloading the page on submit
- Added `onChange={() => setMessage('')}` on the form so the error message clears whenever the user starts typing again
- `handleLogin` sends a POST fetch request to `/api/login/`
- If `response.ok` (status 200–299), navigates to `/dashboard` using `useNavigate`
- If not ok, parses the JSON and calls `setMessage(data.Message)` to show the error

```javascript
fetch('/api/login/', requestOptions)
    .then((response) => {
        if (response.ok) navigate('/dashboard')
        return response.json()
    })
    .then((data) => setMessage(data.Message))
```

### Register
- Same structure as Login with an additional `.then` to handle two types of error responses:
  - `data.Message` — a plain string message (e.g. "Email already exists")
  - `serializer.errors` — an object like `{ username: ["A user with that username already exists."] }`
- To handle both, checks if `data.Message` exists first, otherwise drills into the error object:

```javascript
.then((data) => {
    if (data.Message) {
        setMessage(data.Message)
    } else {
        setMessage(Object.values(data)[0][0])
    }
})
```

- Added `required` attribute to all HTML inputs for basic browser validation
- Also enforced required fields in the serializer by explicitly declaring them:

```python
first_name = serializers.CharField(required=True)
last_name = serializers.CharField(required=True)
email = serializers.EmailField(required=True)
```

This is necessary because Django's built-in `User` model has these fields as optional by default, so the serializer inherits that unless overridden.

- Email and username uniqueness checked manually in the view:

```python
if User.objects.filter(email=email).exists():
    return Response({'Message': 'Email already exists'}, status=400)
```

Username uniqueness is enforced automatically by Django's `User` model.

- Added `<Link to="/register">` and `<Link to="/login">` for navigation between pages
- `Link` must be imported from `react-router-dom`, NOT from `@mui/material` — importing from MUI caused the link to not work at all

---

## Routing (React Router)

- `BrowserRouter` wraps the entire app in `App.jsx`
- Routes are defined with `<Route path="..." element={<Component />} />`
- An `AuthCheck` component sits on the `/` route — it calls `/api/check-auth/` on load and redirects to `/dashboard` or `/login` based on whether the user is authenticated

```jsx
const AuthCheck = () => {
    const navigate = useNavigate()
    useEffect(() => {
        fetch('/api/check-auth/')
            .then(res => res.json())
            .then(data => {
                if (data.isAuthenticated) navigate('/dashboard')
                else navigate('/login')
            })
    }, [])
    return null
}
```

- `useEffect` runs code after the component renders. The empty `[]` dependency array means it only runs once — when the component first loads. Without `[]`, it would run on every re-render, causing infinite loops.

---

## Dashboard

- Currently contains buttons that open MUI `Dialog` components
- Each dialog renders a different component (e.g. `CreateExpenseCategory`, `UploadFiles`)
- Each dialog is controlled by its own `useState` boolean:

```jsx
const [isCategoryOpen, setIsCategoryOpen] = useState(false)

<button onClick={() => setIsCategoryOpen(true)}>Add Category</button>
<Dialog open={isCategoryOpen} onClose={() => setIsCategoryOpen(false)}>
    <CreateExpenseCategory />
</Dialog>
```

Note: MUI `Dialog` uses `open`, not `isOpen`.

---

## API Helper (`utils/api.js`)

Most POST requests require two things:
1. The CSRF token (Django protection against cross-site attacks)
2. The session cookie (so Django knows who the user is)

CSRF is only required for requests that **modify data** — POST, PUT, DELETE. GET requests are safe and don't need it.

```javascript
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const apiPost = (url, data = null) => {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        ...(data && { body: JSON.stringify(data) })
    })
}
```

- `credentials: 'include'` tells the browser to send cookies (including `sessionid`) with the request
- `getCookie('csrftoken')` reads the CSRF token Django sets after login
- `...(data && { body: ... })` only adds the body if data is provided — handles cases where no data needs to be sent (e.g. logout)

---

## File Upload

### Why a separate helper?
Files can't be sent as JSON — JSON only handles text. Binary data like files must be sent as `FormData`. This also means `Content-Type` must NOT be set manually — the browser sets it automatically with the correct boundary for multipart data.

```javascript
export const apiPostFile = (url, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body: formData
    })
}
```

### How the file is read in Django
When Django receives the file, it's an `UploadedFile` object — not a path string. So `open()` can't be used. Instead:

```python
decoded = file.read().decode('utf-8-sig')
records = csv.DictReader(io.StringIO(decoded))
```

- `file.read()` reads the raw bytes from the uploaded file
- `.decode('utf-8-sig')` converts bytes to a string and strips the BOM (`\ufeff`) — a hidden character some programs (like Excel) add to the start of CSV files
- `io.StringIO(decoded)` wraps the string in a file-like object so `csv.DictReader` can iterate over it line by line as if it were a real file
- `csv.DictReader` uses the first row as keys, so each row becomes a dictionary like `{ 'Transaction Date': '2024-01-15', 'Amount': '50.00', ... }`

### ImportExpenses view
```python
for transaction in data:
    serializer = ExpenseSerializer(data=transaction)
    if serializer.is_valid():
        serializer.save(user=user)
```

The view reuses the serializer directly instead of calling `CreateExpense` view — views handle HTTP, shared logic belongs in serializers.

---

## Displaying Expenses

- `useEffect` with `[]` fetches expenses once on component load
- Stored in state with `useState([])`
- Rendered with `.map()` — this loops over the array and returns a JSX element for each item

```jsx
{expenses.map((expense) => (
    <tr key={expense.id}>
        <td>{expense.expense_date}</td>
        <td>{expense.expense_amount}</td>
        <td>{expense.expense_notes}</td>
    </tr>
))}
```

`key` is required by React to track which items changed — use a unique value like `id`.

---

## Problems Encountered & Fixes

| Problem | Cause | Fix |
|---|---|---|
| `useNavigate` error | `Login` not inside `BrowserRouter` | Routes must be children of `BrowserRouter` in `App.jsx` |
| `Link` not working | Imported from MUI instead of `react-router-dom` | `import { Link } from 'react-router-dom'` |
| 403 on POST requests | Missing CSRF token, CORS config incomplete | Added `getCookie`, `CORS_ALLOW_CREDENTIALS`, `CSRF_TRUSTED_ORIGINS` |
| Too many re-renders | `onChange={setMessage('')}` called directly | Changed to `onChange={() => setMessage('')}` |
| File is `None` in view | `formData` defined outside handler, got reset on re-render | Moved `FormData` construction inside the submit handler, stored file in state |
| CSV headers had BOM | Excel adds `\ufeff` to CSV files | Used `utf-8-sig` encoding to strip it |
| Serializer error on `user` field | Serializer expected `user` from request body | Added `read_only_fields = ('user',)` and used `serializer.save(user=request.user)` |
| Table rows not rendering | Used `{}` in `.map()` without `return` | Changed to `()` for implicit return |
| `MUI Dialog` not opening | Used `isOpen` instead of `open` | MUI prop is `open`, not `isOpen` |

---

## Planned Next Steps
- Complete expense display with category column
- Add delete/edit for expenses
- Income, Assets, Liabilities pages
- Net Worth dashboard
- CSV date format handling (dropdown for user to select format)
- Auto-categorization based on previous user choices
