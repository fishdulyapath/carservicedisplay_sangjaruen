import { instanceApi } from "@/services/ProviderService";
import axios from "axios";
export default {
  getDisplayMain(docdate) {
    return instanceApi(true)
      .get(`/getDisplayMain?dbname=data1&provider=DATA&docdate=${docdate}`)
      .then((res) => res.data);
  },
  getDisplayCustomer(docdate, custcode) {
    return instanceApi(true)
      .get(`/getDisplayCustomer?dbname=data1&provider=DATA&docdate=${docdate}&custcode=${custcode}`)
      .then((res) => res.data);
  },
  getDisplayHistory(docdate, custcode) {
    return instanceApi(true)
      .get(`/getDisplayHistory?dbname=data1&provider=DATA&custcode=${custcode}`)
      .then((res) => res.data);
  },
  getCarDocDetail(doc_no) {
    return instanceApi(true)
      .get(`/getCarDocDetail?dbname=data1&provider=DATA&doc_no=${doc_no}`)
      .then((res) => res.data);
  },
  updateCarDoc(doc_no, status,doctime) {
    return instanceApi(true)
      .get(`/updateCarDoc?dbname=data1&provider=DATA&docno=${doc_no}&status=${status}&doctime=${doctime}`)
      .then((res) => res.data);
  },
};

//data1

//demo
//DEMO
