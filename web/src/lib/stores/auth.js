import { writable } from 'svelte/store';
import { browser } from '$app/environment';

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

// Initial state from localStorage if available
const storedAuth = browser ? localStorage.getItem('auth') : null;

/** @type {AuthState} */
const initialState = storedAuth ? JSON.parse(storedAuth) : {
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
            if (browser) {
                localStorage.setItem('auth', JSON.stringify(authState));
            }
            set(authState);
        },
        logout: () => {
            if (browser) {
                localStorage.removeItem('auth');
            }
            set({ isAuthenticated: false, token: null, user: null });
        },
        /**
         * @param {User} user
         */
        updateUser: (user) => {
            update(state => {
                const newState = { ...state, user };
                if (browser) {
                    localStorage.setItem('auth', JSON.stringify(newState));
                }
                return newState;
            });
        }
    };
};

export const auth = createAuthStore(); 