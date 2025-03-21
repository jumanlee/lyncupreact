import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// this code taken from https://github.com/veryacademy/YT-Django-DRF-Simple-Blog-Series-JWT-Part-3/blob/master/react/blogapi/src/axios.js

const baseURL = 'http://localhost:8080/api/';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        Authorization: localStorage.getItem('access_token')
            //IMPORTANT, for JWT token, it starts with Bearer, NOT Jwt as previously placed!! Remember to also update other Jwt below! This caused me a lot of problems with API failed requests, which automatically appended :<int> to api link! 
            ? `Bearer ${localStorage.getItem('access_token')}`
            : null,
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

//Intercept the request before it's being sent! This part is IMPORTANT, is to ensure this interceptor to make sure to always use latest token. e.g. When user logs in and gets a new token, the previously expired token must be replaced, therefore this:
axiosInstance.interceptors.request.use(
    //config is an object that contains all the details of the hhtp request before it is sent.
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  

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
            window.location.href = '/';
            return Promise.reject(error);
        }

        if (
            error.response.data &&
            (error.response.data as { code?: string }).code === 'token_not_valid' &&
            error.response.status === 401 &&
            error.response.statusText === 'Unauthorized'
        ) {
            //refreshToken in base64url format: <Header>.<Payload>.<Signature>
            const refreshToken = localStorage.getItem('refresh_token');


            //NOTE: refresh token is a JWT in base64url format, not plain base64!! When we call atob on its payload, it would fail because atob expects standard base64 encoding. We need to convert the token payload from base64url to base64 before decoding it. This wasn't an issue with access_token cuz it never tried to manually decode it in the code using atob(). acess_token was just sent in the Authorization header, which doesn’t require decoding. DRF + SimpleJWT automatically reads acess_token from the Authorization: Bearer <token> header, decodes it, verifies its signature and expiry, and sets the authenticated user (request.user) all without needing to decode or parse the token manually. Note that Every HTTP request we send from the frontend includes headers.
            //On the other hand refresh_token is never sent in the header and is not used to authenticate requests, it is only meant to be sent manually in the body of a POST request to /api/token/refresh/ in order to obtain a new access token. Because of that, the frontend is responsible for managing its storage, checking its expiry if needed, and calling the refresh endpoint.

            if(refreshToken) {
                const tokenPartsArray = refreshToken.split('.');
                if(tokenPartsArray.length != 3) {
                    console.error("invalid refresh token format");
                    window.location.href = '/';
                    return Promise.reject(error);
                }

                //convert base64url to base64
                let base64Url = tokenPartsArray[1];
                let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4 !== 0){
                    //atop only works for multiples of 4. we need multiple of 4, note that = is just padding, doesn't affect data.
                    base64 += "=";
                }

                let tokenPayload;
                try {
                    tokenPayload = JSON.parse(atob(base64));
                } catch (error) {
                    console.error("error decoding refresh token", error);
                    window.location.href = "/";
                    return Promise.reject(error);
                }

                //expiry date in token is in seconds
                const now = Math.ceil(Date.now() / 1000);
                if(tokenPayload.exp > now) {
                    try {
                        const response = await axiosInstance.post('/token/refresh/', {
                            refresh: refreshToken,
                          });
                        
                          if (response.data) {
                            localStorage.setItem("access_token", response.data.access);
                            localStorage.setItem('refresh_token', response.data.refresh);

                            axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
                            if(!originalRequest.headers){
                                originalRequest.headers = {};
                            }
                            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                            return axiosInstance(originalRequest);
                          } 
                    } catch (error) {
                        console.error(error);
                        window.location.href = '/';
                        return Promise.reject(error);
                            
                    }
                } else {
                    console.log('refresh token is expired', tokenPayload.exp, now);
                    window.location.href = '/';
                }
            } else {
                console.log('refresh token not available.');
                window.location.href = '/';
            }

        //     if (refreshToken) {
        //         const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));

        //         // exp date in token is expressed in seconds, while now() returns milliseconds:
        //         const now = Math.ceil(Date.now() / 1000);

        //         if (tokenParts.exp > now) {
        //             try {
        //                 const response = await axiosInstance.post('/token/refresh/', {
        //                     refresh: refreshToken,
        //                 });

        //                 if (response.data) {
        //                     localStorage.setItem('access_token', response.data.access);
        //                     localStorage.setItem('refresh_token', response.data.refresh);

        //                     axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;

        //                     //initialise headers if it doesn't exist
        //                     if (!originalRequest.headers) {
        //                         originalRequest.headers = {}; //initialise headers if it doesn't exist
        //                     }
        //                     originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

        //                     return axiosInstance(originalRequest);
        //                 }
        //             } catch (err) {
        //                 console.log(err);
        //                 window.location.href = '/';
        //                 return Promise.reject(err);
        //             }
        //         } else {
        //             console.log('Refresh token is expired', tokenParts.exp, now);
        //             window.location.href = '/';
        //         }
        //     } else {
        //         console.log('Refresh token not available.');
        //         window.location.href = '/';
        //     }
        }

        // specific error handling done elsewhere
        return Promise.reject(error);
    }
);

export default axiosInstance;
