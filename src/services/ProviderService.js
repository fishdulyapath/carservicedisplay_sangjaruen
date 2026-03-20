import axios from 'axios'
// import source from '@/store/modules/endpoint'
// import { useAuthen } from '@/stores/authen'

import { useAuthen } from "@/stores/authen.js"

const instanceApi = (authentication = true) =>{


    const store = useAuthen();

    // console.log("API URL : ", process.env.VUE_APP_API);

    //http://43.240.113.43:8776/stockcardServiceAPI/service/stockservice/
//http://wrh01.dyndns.org:8088/stockcardServiceAPI//service/stockservice/
    const http = axios.create({ baseURL: 'http://localhost:8084/CarServiceRESTService/service/carservice/'});
    http.defaults.headers.common['Content-Type'] = 'application/json';

    http.interceptors.response.use(
        function (response) {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            return response;
        },
        error => {
            // console.log("Error In Interceptor")
            // console.log(error);
            if (!error.response) {
                console.log("network error")
            }
            else {
                if (error.response.status) {
                    switch (error.response.status) {
                        case 401:
                            //alert("session expired");
                            console.log("session expire")
                            store.directLogout()
                            
                            break;
                        default:
                            return Promise.reject(error);
                    }
                }
            }
        }
    )

    return http;
}



export default {
    instanceApi
}

export {
    instanceApi
}
