// THis is a helper function to be used whenever a post, put and delete request is made

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const fileApiPost = (url, formData) => {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData

    })
}

export default fileApiPost