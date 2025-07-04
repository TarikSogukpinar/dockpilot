import { auth } from '../stores/auth';
import { get } from 'svelte/store';
import { config } from '../config';

const API_URL = config.apiBaseUrl;

/**
 * @typedef {Object} ApiOptions
 * @property {string} [method]
 * @property {Record<string, string>} [headers]
 * @property {string} [body]
 */

/**
 * @param {string} endpoint
 * @param {ApiOptions} [options={}]
 */
async function fetchWithAuth(endpoint, options = {}) {
    const authState = get(auth);
    /** @type {Record<string, string>} */
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (authState.token) {
        headers['Authorization'] = `Bearer ${authState.token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            auth.logout();
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const api = {
    auth: {
        /**
         * @param {string} email
         * @param {string} password
         */
        login: async (email, password) => {
            const data = await fetchWithAuth('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            return data;
        },
        /**
         * @param {string} email
         * @param {string} password
         * @param {string} name
         */
        register: async (email, password, name) => {
            const data = await fetchWithAuth('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name })
            });
            return data;
        },
        /**
         * Fetch current user profile data 
         * @returns {Promise<Object>} User profile data
         */
        me: async () => {
            const data = await fetchWithAuth('/users/me');
            return data;
        }
    },
    users: {
        /**
         * Update user profile
         * @param {Object} profileData - Profile data to update
         * @returns {Promise<Object>} Updated user data
         */
        updateProfile: (profileData) => fetchWithAuth('/users/profile', {
            method: 'POST',
            body: JSON.stringify(profileData)
        })
    },
    containers: {
        list: () => fetchWithAuth('/containers'),
        /**
         * @param {Object} containerData
         */
        create: (containerData) => fetchWithAuth('/containers', {
            method: 'POST',
            body: JSON.stringify(containerData)
        }),
        /**
         * @param {string} id
         */
        delete: (id) => fetchWithAuth(`/containers/${id}`, {
            method: 'DELETE'
        }),
        /**
         * @param {string} id
         */
        start: (id) => fetchWithAuth(`/containers/${id}/start`, {
            method: 'POST'
        }),
        /**
         * @param {string} id
         */
        stop: (id) => fetchWithAuth(`/containers/${id}/stop`, {
            method: 'POST'
        }),
        /**
         * @param {string} id
         */
        restart: (id) => fetchWithAuth(`/containers/${id}/restart`, {
            method: 'POST'
        })
    },
    connections: {
        list: () => fetchWithAuth('/connections'),
        /**
         * @param {Object} connectionData
         */
        create: (connectionData) => fetchWithAuth('/connections', {
            method: 'POST',
            body: JSON.stringify(connectionData)
        }),
        /**
         * @param {string} id
         */
        delete: (id) => fetchWithAuth(`/connections/${id}`, {
            method: 'DELETE'
        })
    }
}; 