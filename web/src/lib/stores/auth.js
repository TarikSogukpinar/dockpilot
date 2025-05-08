import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { config, getApiUrl } from '../config';

// Types
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
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
         * @param {User} user
         */
        login: (token, user) => {
            const authState = { isAuthenticated: true, token, user };
            set(authState);
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