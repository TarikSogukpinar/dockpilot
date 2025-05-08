/**
 * Uygulama genelinde kullanılan yapılandırma değerleri
 */
export const config = {
    /**
     * API endpoint'leri için temel URL
     */
    apiBaseUrl: 'http://localhost:5000/api/v1',
    
    /**
     * Auth ile ilgili endpoint'ler
     */
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        user: '/users/me',
        me: '/users/me'
    },
    
    /**
     * Kullanıcı ile ilgili endpoint'ler
     */
    user: {
        profile: '/users/profile',
        updateProfile: '/users/profile',
        changePassword: '/users/change-password'
    },
    
    /**
     * Cookie isimleri
     */
    cookies: {
        authToken: 'auth_token'
    }
};

/**
 * Tam API URL'i oluşturmak için yardımcı fonksiyon
 * @param {string} endpoint - Endpoint yolu
 * @returns {string} Tam API URL'i
 */
export function getApiUrl(endpoint) {
    // Endpoint zaten / ile başlıyorsa olduğu gibi kullan
    if (endpoint.startsWith('/')) {
        return `${config.apiBaseUrl}${endpoint}`;
    }
    // Aksi taktirde / ekle
    return `${config.apiBaseUrl}/${endpoint}`;
} 