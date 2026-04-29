const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const apiRequest = (url, method, data = null) => {
    return fetch(url, {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        ...(data && { body: JSON.stringify(data) })
    })
}

export const apiPost = (url, data = null) => apiRequest(url, 'POST', data)
export const apiPatch = (url, data = null) => apiRequest(url, 'PATCH', data)
export const apiDelete = (url, data = null) => apiRequest(url, 'DELETE', data)

export default apiPost