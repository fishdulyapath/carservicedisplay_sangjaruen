import { instanceApi } from '@/services/ProviderService'

export default {
    getBalanceSheet(accountgroup, enddate) {
        return instanceApi(true).get(`/gl/report/balancesheet?accountgroup=${accountgroup}&enddate=${enddate}`).then(res => res.data);
    },
    getProfitandloss(accountgroup, startdate, enddate) {
        return instanceApi(true).get(`/gl/report/profitandloss?accountgroup=${accountgroup}&startdate=${startdate}&enddate=${enddate}`).then(res => res.data);
    },
    getTrialBalanceSheet(accountgroup, startdate, enddate) {
        return instanceApi(true).get(`/gl/report/trialbalancesheet?accountgroup=${accountgroup}&startdate=${startdate}&enddate=${enddate}`).then(res => res.data);
    }
}