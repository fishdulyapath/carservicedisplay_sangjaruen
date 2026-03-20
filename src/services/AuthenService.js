import { instanceApi } from '@/services/ProviderService'

export default {
    login(username, password) {
        return instanceApi(false).get(`/authentication?provider_name=data&database_name=data2&user_code=${username}&password=${password}`);
    },


}

