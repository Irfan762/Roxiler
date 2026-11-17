import api from './api';
export const adminApi = {
    async getDashboard() {
        const { data } = await api.get('/admin/dashboard');
        return data.data;
    },
    async getUsers(params) {
        const { data } = await api.get('/admin/users', { params });
        return data;
    },
    async createUser(body) {
        const { data } = await api.post('/admin/users', body);
        return data.data;
    },
    async getUserDetails(id) {
        const { data } = await api.get(`/admin/users/${id}`);
        return data.data;
    },
    async getStores(params) {
        const { data } = await api.get('/admin/stores', {
            params,
        });
        return data;
    },
    async createStore(body) {
        await api.post('/admin/stores', body);
    },
};
