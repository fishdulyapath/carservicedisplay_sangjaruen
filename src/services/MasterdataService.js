import { instanceApi } from "@/services/ProviderService";
import axios from "axios";
export default {
  getDisplayMain(docdate) {
    return instanceApi(true)
      .get(`/getDisplayMain?dbname=data2&provider=DATA&docdate=${docdate}`)
      .then((res) => res.data);
  },
  getDisplayCustomer(docdate, custcode) {
    return instanceApi(true)
      .get(`/getDisplayCustomer?dbname=data2&provider=DATA&docdate=${docdate}&custcode=${custcode}`)
      .then((res) => res.data);
  },
  getDisplayHistory(docdate, custcode) {
    return instanceApi(true)
      .get(`/getDisplayHistory?dbname=data2&provider=DATA&custcode=${custcode}`)
      .then((res) => res.data);
  },
  getCarDocDetail(doc_no) {
    return instanceApi(true)
      .get(`/getCarDocDetail?dbname=data2&provider=DATA&doc_no=${doc_no}`)
      .then((res) => res.data);
  },
  getDocList(from_date, to_date, search = "") {
    return instanceApi(true)
      .get(`/getDocList?dbname=data2&provider=DATA&from_date=${from_date}&to_date=${to_date}&search=${search}`)
      .then((res) => res.data);
  },
  updateCarDoc(doc_no, status, usercode) {
    return instanceApi(true)
      .get(`/updateCarDoc?dbname=data2&provider=DATA&docno=${doc_no}&status=${status}&usercode=${usercode}`)
      .then((res) => res.data);
  },
};

//demo

//demo
//DEMO
