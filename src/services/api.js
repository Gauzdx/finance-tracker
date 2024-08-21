import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:1433/data-api/rest',
    headers: {
        'Content-Type': 'application/json'
    }
})

export default {
    getData() {
        return apiClient.get('/personaltransactions')
    },
    post(endpoint, data) {
        return apiClient.post(endpoint, data)
    }
}
