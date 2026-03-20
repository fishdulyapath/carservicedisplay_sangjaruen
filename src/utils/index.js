import Numeral from "numeral"

const newGuid = (head) => {
    return head + 'xxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 8 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const captcha = () => {
    return 'xxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 8 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const formatNumber = (val, digit = 0) => {
    if (val == 0) {
        return "0"
    }

    else if (val < 0) {
        return Numeral(val).format('(0,0.0)')
    } else {
        return Numeral(val).format('0,0.0')
    }

}

const formatMoney = (val, digit = 0) => {
    if (val == 0) {
        return "0"
    }

    else if (val < 0) {
        return Numeral(val).format('(0,0.00)')
    } else {
        return Numeral(val).format('0,0.00')
    }

}

const uuidv4 = () => {
    return "xxxxxx"
        .replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        })
        .toUpperCase();
};


const getFormatDateTime = (format) => {

    var d = new Date(format).toISOString();

    return d
}

const remove_duplicates_array = (arr) => {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    return ret_arr;
}

const getDocNoDate = (format) => {

    var d = new Date(),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return format + "-" + [year, month, day].join("") + uuidv4();
}
const getYear = () => {

    var d = new Date(),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return year;
}
const getDateFormatPG = (date) => {

    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}

const getDateFormatPure = (date) => {

    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("");
}

const getDateFormatThai = (date) => {

    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [day, month, year].join("-");
}

const getDateTimeFormatPG = (date) => {

    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minute = d.getMinutes();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-") + " " + hour + ":" + minute;
}

const getTimeFormatPG = (date) => {
    var date = new Date(date);
    var showDate =
        date.getHours() +
        ":" +
        date.getMinutes();
    return showDate;
}

const getDateFromYear = (date) => {

    var d = new Date(),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = date;

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}

const getDateTimeFormat = (date) => {
    var date = new Date(date);
    var showDate =
        date.getDate() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        date.getFullYear() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes();
    return showDate;
}
const getDateTimeFromDate = (date) => {

    var d = new Date(date);

    return d;
}
const getDateDisplayFromDate = (date) => {

    var d = new Date(date);
    var showDate =
        date.getDate() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        date.getFullYear();
    return showDate;
}
const getDateTime = () => {

    var d = new Date(),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return d;
}
const isEmpty = (value) => {
    return (value != undefined && value != null && value.toString().trim().length > 0) ? true : false
}


const formatCurrency = (value) => {
    if (value == null || value == 0) {
        return 0;
    }
    return value.toLocaleString();
}
export default {
    newGuid,
    isEmpty,
    formatNumber,
    formatMoney,
    captcha,
    uuidv4,
    getDocNoDate,
    getDateTime,
    getYear,
    getFormatDateTime,
    getDateFromYear,
    getDateTimeFromDate,
    getDateDisplayFromDate,
    getDateTimeFormat,
    formatCurrency,
    remove_duplicates_array,
    getDateFormatPG,
    getDateFormatPure,
    getTimeFormatPG,
    getDateTimeFormatPG,
    getDateFormatThai
}