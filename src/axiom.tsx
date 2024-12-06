import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// this code taken from https://github.com/veryacademy/YT-Django-DRF-Simple-Blog-Series-JWT-Part-3/blob/master/react/blogapi/src/axios.js

const baseURL = 'http://localhost:8080/api/';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        Authorization: localStorage.getItem('access_token')
            ? `JWT ${localStorage.getItem('access_token')}`
            : null,
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

//Handle Token Expiry and Refresh Automatically, Handle Network or CORS Errors, Retry the Original Request, Centralized Error Handling
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async function (error: AxiosError): Promise<any> {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config || {};

        if (!error.response) {
            alert(
                'A server/network error occurred. ' +
                'Looks like CORS might be the problem. ' +
                'Sorry about this - we will get it fixed shortly.'
            );
            return Promise.reject(error);
        }

        if (
            error.response.status === 401 &&
            originalRequest.url === baseURL + 'token/refresh/'
        ) {
            window.location.href = '/login/';
            return Promise.reject(error);
        }

        if (
            error.response.data &&
            (error.response.data as { code?: string }).code === 'token_not_valid' &&
            error.response.status === 401 &&
            error.response.statusText === 'Unauthorized'
        ) {
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));

                // exp date in token is expressed in seconds, while now() returns milliseconds:
                const now = Math.ceil(Date.now() / 1000);

                if (tokenParts.exp > now) {
                    try {
                        const response = await axiosInstance.post('/token/refresh/', {
                            refresh: refreshToken,
                        });

                        if (response.data) {
                            localStorage.setItem('access_token', response.data.access);
                            localStorage.setItem('refresh_token', response.data.refresh);

                            axiosInstance.defaults.headers['Authorization'] = `JWT ${response.data.access}`;

                            //initialise headers if it doesn't exist
                            if (!originalRequest.headers) {
                                originalRequest.headers = {}; //initialise headers if it doesn't exist
                            }
                            originalRequest.headers['Authorization'] = `JWT ${response.data.access}`;

                            return axiosInstance(originalRequest);
                        }
                    } catch (err) {
                        console.log(err);
                        window.location.href = '/login/';
                        return Promise.reject(err);
                    }
                } else {
                    console.log('Refresh token is expired', tokenParts.exp, now);
                    window.location.href = '/login/';
                }
            } else {
                console.log('Refresh token not available.');
                window.location.href = '/login/';
            }
        }

        // specific error handling done elsewhere
        return Promise.reject(error);
    }
);

export default axiosInstance;
