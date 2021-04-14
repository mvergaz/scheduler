"use strict"

const fs = require('fs')
    , path = require('path')
    , week = {
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
        7: "Sun"
    }

let year, month, day, dayW, hour, minute, second

const processNow = (now) => {

    year = now.getFullYear()
    month = (now.getMonth() + 1).toString().padStart(2, '0')
    day = now.getDate().toString().padStart(2, '0')
    dayW = week[now.getDay()]
    hour = now.getHours().toString().padStart(2, '0')
    minute = now.getMinutes().toString().padStart(2, '0')
    second = now.getSeconds().toString().padStart(2, '0')

    return `${year}-${month}-${day}|${dayW}|${hour}:${minute}:${second}`
}

module.exports = (message, file = 'service') => {
    let now = processNow(new Date())
    fs.appendFileSync(path.resolve(process.env.PWD, `${file}.log`), `[${now}];"${message}"\n`)
}