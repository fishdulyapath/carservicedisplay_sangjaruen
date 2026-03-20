import { instanceApi } from '@/services/ProviderService'

export default {

    importTable(data) {
        return instanceApi(true).post(`/import/category`, data).then(res => res.data);
    },
    getTableList() {
        return instanceApi(true).get(`/restaurant/table?limit=50000`).then(res => res.data);
    },

    delTable(data) {
        return instanceApi(true).delete(`/import/category`, { data: data }).then(res => res.data);
    },
    importPrinter(data) {
        return instanceApi(true).post(`/restaurant/printer/bulk`, data).then(res => res.data);
    },
    getPrinterList() {
        return instanceApi(true).get(`/restaurant/printer?limit=50000`).then(res => res.data);
    },
    delPrinter(data) {
        return instanceApi(true).delete(`/restaurant/printer/${data}`).then(res => res.data);
    },
    importZone(data) {
        return instanceApi(true).post(`/restaurant/zone/bulk`, data).then(res => res.data);
    },
    getZoneList() {
        return instanceApi(true).get(`/restaurant/zone?limit=50000`).then(res => res.data);
    },
    delZone(data) {
        return instanceApi(true).delete(`/restaurant/zone/${data}`).then(res => res.data);
    },
    importTable(data) {
        return instanceApi(true).post(`/restaurant/table/bulk`, data).then(res => res.data);
    },
    delTable(data) {
        return instanceApi(true).delete(`/restaurant/table/${data}`).then(res => res.data);
    },
    importKitchen(data) {
        return instanceApi(true).post(`/restaurant/kitchen/bulk`, data).then(res => res.data);
    },
    getKitchenList() {
        return instanceApi(true).get(`/restaurant/kitchen?limit=50000`).then(res => res.data);
    },
    
}
