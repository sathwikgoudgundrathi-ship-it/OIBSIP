const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api(path, options = {}){
    const token = localStorage.getItem('pizzaToken');
    const response = await fetch(`${API_URL}${path}`, {
        method:options.method || 'GET',
        headers:{
            'Content-Type':'application/json',
            ...(token ? { Authorization:`Bearer ${token}` } : {})
        },
        body:options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    if(!response.ok){
        throw new Error(data.message || 'Request failed');
    }
    return data;
}
