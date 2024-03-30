import axios from "axios";
import {ElMessage} from "element-plus";


/**
 * 创建自定义的axios对象，实现请求拦截器和响应拦截器
 *
 */
const request = axios.create({
    // 超时时间
    timeout: 10000,
    // 格式为json数据；字符编码utf-8
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    }
})


request.defaults.baseURL = "http://localhost:6767/"
// request.defaults.baseURL = location.href

/**
 * 请求拦截器
 */
request.interceptors.request.use(req => {
        return req;
    }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(resp => {
        // http的响应状态码会进入这里
        let result = resp.data;
        if (result.code === 200) {
            return resp;
        }

        if (result.code === 401) {
            return Promise.reject(401)
        }

        if (!result.code || result.code === 500) {
            // 代码执行下来，说明code不为200，或者result有问题【使用弹窗提示,可能为空白】
            // ElMessage({
            //     type: "error",
            //     message: result.message ? result.message : '系统异常'
            // });
            // 代码中提示
        }
        // 使请求不进入正常的响应处理函数
        return Promise.reject(result.message)
    },

    /**
     * 当
     * http的状态码不为200时
     * @param error
     */
    error => {

        console.error("发生异常：", error)

        // 到达前端axios设置的超时时间
        if (error.code === 'ECONNABORTED') {
            // 弹窗提示
            ElMessage({
                message: '网络超时',
                type: 'error',
                duration: 2000
            })
            // 使请求不进入正常的响应处理函数
            return Promise.reject("time out")
        }
        // 网络不通，无法访问后端，或者服务器不在线
        if (error.code === 'ERR_NETWORK') {
            // 弹窗提示
            ElMessage({
                message: '系统异常,请稍后重试',
                type: 'error',
                duration: 2000
            })
            // 使请求不进入正常的响应处理函数
            return Promise.reject(() => {
            })
        }

        // 获取后端返回的错误信息
        if (error.response.data) {
            error.message = error.response.data.message;
        }

        if (error.response.status === 404) {
            error.message = "资源未找到";
        }

        // 弹窗提示，3秒
        ElMessage({
            message: error.message,
            type: 'error',
            duration: 3000
        })

        // 使请求不进入正常的响应处理函数
        return Promise.reject(error)
    })

/**
 * 暴露自定义的axios
 */
export default request;
