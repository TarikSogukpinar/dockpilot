import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { config, getApiUrl } from '../config';

// Types
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} [role]
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {string|null} token
 * @property {User|null} user
 */

/** @type {AuthState} */
const initialState = {
    isAuthenticated: false,
    token: null,
    user: null
};

const createAuthStore = () => {
    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,
        /**
         * @param {string} token
         * @param {any} user - User data from API
         */
        login: (token, user) => {
            // Normalize user object structure
            const normalizedUser = {
                id: user.id || user.uuid || '',
                email: user.email || '',
                name: user.name || '',
                role: user.role || 'USER',
                // Other fields can be added here if needed
            };
            
            const authState = { isAuthenticated: true, token, user: normalizedUser };
            set(authState);
            console.log('Auth store updated with user:', normalizedUser);
        },
        /**
         * Set token without user data (for API calls before user data is loaded)
         * @param {string} token - Auth token
         */
        setToken: (token) => {
            update(state => ({ ...state, token, isAuthenticated: !!token }));
            console.log('Token set in auth store');
        },
        logout: () => {
            // Send request to logout endpoint to clear the cookie
            if (browser) {
                fetch(getApiUrl(config.auth.logout), {
                    method: 'POST',
                    credentials: 'include'
                }).catch(err => console.error('Logout error:', err));
            }
            set({ isAuthenticated: false, token: null, user: null });
        },
        /**
         * @param {User} user
         */
        updateUser: (user) => {
            update(state => {
                const newState = { ...state, user };
                return newState;
            });
        }
    };
};

export const auth = createAuthStore(); 