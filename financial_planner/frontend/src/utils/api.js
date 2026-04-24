// THis is a helper function to be used whenever a post, put and delete request is made

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const apiPost = (url, data = null) => {
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

export default apiPost