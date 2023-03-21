import axios from 'axios';
const server = axios.create({
    baseURL: import.meta.env.ENV_NODE_URL_BASE,
    timeout: 5000
});
//请求拦截器
server.interceptors.request.use(config => {
    return config;
}), (error: Error) => {
    return Promise.reject(error);
};
//响应拦截器
server.interceptors.response.use((response) => {
    return response.data;
}), (error: Error) => {
    return Promise.reject(error);
};

export default server;