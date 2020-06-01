import axios from 'axios'
import Vue from 'vue'

import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

// axios.defaults.baseURL = 'http://106.12.11.162:8888/api/private/v1/';
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/"

// 请求拦截器, 展示进度条 NProgress.start();
axios.interceptors.request.use(function (config) {
  NProgress.start();
  // 添加请求头和token
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

  // 响应拦截器, 隐藏进度条 NProgress.done();
axios.interceptors.response.use(function (config) {
  NProgress.done();
  // 对响应数据做点什么
    return config;
  }, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  });

Vue.prototype.$http = axios;






// export function request(config) {
//   const instance = axios.create({
//     // baseURL: 'http://127.0.0.1:8888/api/private/v1/',
//     baseURL: 'http://timemeetyou.com:8889/api/private/v1/',
//     timeout: 5000,
//     method: config.type
//   })
//
//   // 请求拦截器
//   instance.interceptors.request.use(function (config) {
//     // 添加请求头和token
//     config.headers.Authorization = window.sessionStorage.getItem('token');
//     return config;
//   }, function (error) {
//     // 对请求错误做些什么
//     return Promise.reject(error);
//   });
//
//   // 响应拦截器
//   instance.interceptors.response.use(function (config) {
//     // 对响应数据做点什么
//     return config;
//   }, function (error) {
//     // 对响应错误做点什么
//     return Promise.reject(error);
//   });
//
//   return instance(config);
// }


