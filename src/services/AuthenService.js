import { instanceApi } from '@/services/ProviderService'

export default {
    login(provider,dbname,username, password) {
        return instanceApi(false).get(`/authentication?provider_name=${provider}&database_name=${dbname}&user_code=${username}&password=${password}`);
    },
    getListShop() {
        return instanceApi(true).get(`/list-shop`).then(res => res.data);
    },
    selectShop() {
        return instanceApi(true).post(`/select-shop`, { "shopid": localStorage.shopid }).then(res => res.data);
    }

}

