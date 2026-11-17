import api from './api';
export const ownerApi = {
    async getDashboard() {
        const { data } = await api.get('/owner/dashboard');
        return data.data;
    },
    async getRatings(params) {
        const { data } = await api.get('/owner/ratings', {
            params,
        });
        return data;
    },
};
