import api from './api';
export const storeApi = {
    async getStores(params) {
        const { data } = await api.get('/stores', {
            params,
        });
        return data;
    },
    async getStore(id) {
        const { data } = await api.get(`/stores/${id}`);
        return data.data;
    },
    async submitRating(storeId, rating) {
        await api.post(`/stores/${storeId}/rating`, { rating });
    },
    async updateRating(storeId, rating) {
        await api.put(`/stores/${storeId}/rating`, { rating });
    },
};
