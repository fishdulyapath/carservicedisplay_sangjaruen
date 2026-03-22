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
  updateCarDoc(doc_no, status, doctime) {
    return instanceApi(true)
      .get(`/updateCarDoc?dbname=data2&provider=DATA&docno=${doc_no}&status=${status}&doctime=${doctime}`)
      .then((res) => res.data);
  },
  // Document list (จัดการสถานะ)
  getDocList(from_date, to_date, search = "", status = "") {
    return instanceApi(true)
      .get(`/getDocList?dbname=data2&provider=DATA&from_date=${from_date}&to_date=${to_date}&search=${search}&status=${status}`)
      .then((res) => res.data);
  },
  // Document history list (สรุปผลการดำเนินการ)
  getDocHistoryList(from_date, to_date, search = "", status = "") {
    return instanceApi(true)
      .get(`/getDocHistoryList?dbname=data2&provider=DATA&from_date=${from_date}&to_date=${to_date}&search=${search}&status=${status}`)
      .then((res) => res.data);
  },

  // Employee list
  getEmployee() {
    return instanceApi(true)
      .get(`/getEmployee?dbname=data2&provider=DATA`)
      .then((res) => res.data);
  },

  // รับงาน
  updateGetJob(docno, usercode) {
    return instanceApi(true)
      .get(`/updateGetJob?dbname=data2&provider=DATA&docno=${docno}&usercode=${usercode}`)
      .then((res) => res.data);
  },
  // ปิดงาน (complete)
  updateCompleteJob(docno, usercode, remark = "") {
    return instanceApi(true)
      .get(`/updateCompleteJob?dbname=data2&provider=DATA&docno=${docno}&usercode=${usercode}&remark=${encodeURIComponent(remark)}`)
      .then((res) => res.data);
  },

  // เสร็จงาน (close)
  updateCloseJob(docno) {
    return instanceApi(true)
      .get(`/updateCloseJob?dbname=data2&provider=DATA&docno=${docno}`)
      .then((res) => res.data);
  },
};

//demo

//demo
//DEMO
