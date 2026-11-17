/** Route paths for role-based redirects. */
export const ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_DETAIL: (id) => `/admin/users/${id}`,
    ADMIN_STORES: '/admin/stores',
    ADMIN_ADD_USER: '/admin/add-user',
    ADMIN_ADD_STORE: '/admin/add-store',
    USER_STORES: '/user/stores',
    USER_STORE_DETAIL: (id) => `/user/stores/${id}`,
    OWNER_DASHBOARD: '/owner/dashboard',
    OWNER_RATINGS: '/owner/ratings',
};
/** Role-based home routes. */
export const ROLE_HOME = {
    SYSTEM_ADMIN: ROUTES.ADMIN_DASHBOARD,
    NORMAL_USER: ROUTES.USER_STORES,
    STORE_OWNER: ROUTES.OWNER_DASHBOARD,
};
export const ROLE_LABELS = {
    SYSTEM_ADMIN: 'System Admin',
    NORMAL_USER: 'Normal User',
    STORE_OWNER: 'Store Owner',
};
export const ROLES = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
