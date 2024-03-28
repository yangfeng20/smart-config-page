import axios from "axios";
import ElementPlus from "element-plus";
import Moment from "moment";


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

let router = {}


/**
 * 全局的url 【指定了全局url之后, mock的模拟请求前面也需要这个前缀】
 * @type {string}
 */
if (process.env.NODE_ENV === 'production') {
    // http://smartcourse.ltd：9090【使用nginx代理转发到8090】
    // 直接使用ip地址减少dns解析时间【现在长的时候解析要11秒】
    request.defaults.baseURL = 'http://43.138.246.37:9090/'
} else {
    request.defaults.baseURL = 'http://localhost:8090/'
}

/**
 * 请求拦截器
 */
request.interceptors.request.use(req => {
        let authorization = localStorage.getItem('authorization');
        // 请求时携带token
        if (authorization) {
            req.headers['Authorization'] = authorization;
        }
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
            formatDate(result)
            return resp;
        }

        // 创建更新时间格式 todo 后端处理了时间
        function formatDate(result) {
            let formatStr = 'YYYY-MM-DD HH:mm:ss'
            if (result?.data?.createdDate) {
                result.data.createdDate = new Moment(result.data.createdDate).format(formatStr)
            }
            if (result?.data?.updatedDate) {
                result.data.updatedDate = new Moment(result.data.updatedDate).format(formatStr)
            }

            if (result?.data?.content && result.data.content instanceof Array) {
                result.data.content.forEach(item => {
                    if (item?.createdDate) {
                        item.createdDate = new Moment(item.createdDate).format(formatStr)
                    }
                    if (item?.updatedDate) {
                        item.updatedDate = new Moment(item.updatedDate).format(formatStr)
                    }
                })
            }
        }

        if (result.code === 401) {
            let goToRouter = '/login?redirect_url=' + location.pathname + location.search
            ElementPlus.Message.error({
                message: result.message + ` : <a href=${goToRouter}>点击登录</a>`,
                dangerouslyUseHTMLString: true,
            });
            return Promise.reject(result.message)
        }

        if (!result.code || result.code === 500) {
            // 代码执行下来，说明code不为200，或者result有问题【使用弹窗提示,可能为空白】
            ElementPlus.Message.error(result.message ? result.message : '系统异常');
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
            ElementPlus.Message({
                message: '网络超时',
                type: 'error',
                duration: 2000
            })
            // 使请求不进入正常的响应处理函数
            return Promise.reject(() => {
            })
        }
        // 网络不通，无法访问后端，或者服务器不在线
        if (error.code === 'ERR_NETWORK') {
            // 弹窗提示
            ElementPlus.Message({
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

        if (error.response.status === 401) {
            // 无权限，路由致登录页
            router.push('/login');
        }

        if (error.response.status === 404) {
            error.message = "资源未找到";
        }

        // 弹窗提示，3秒
        ElementPlus.Message({
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
