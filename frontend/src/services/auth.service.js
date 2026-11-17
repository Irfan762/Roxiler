import api from './api';
export const authApi = {
    async login(email, password) {
        const { data } = await api.post('/auth/login', {
            email,
            password,
        });
        return data.data;
    },
    async signup(body) {
        const { data } = await api.post('/auth/signup', body);
        return data.data;
    },
    async changePassword(currentPassword, newPassword, confirmPassword) {
        const { data } = await api.post('/auth/change-password', {
            currentPassword,
            newPassword,
            confirmPassword,
        });
        return data.data;
    },
    async logout() {
        await api.post('/auth/logout');
    },
    async me() {
        const { data } = await api.get('/auth/me');
        return data.data;
    },
};
