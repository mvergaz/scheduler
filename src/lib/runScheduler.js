"use strict"

const schedules = require('./schedules')
    , logger = require('../lib/logger')
    , week = {
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
        7: "Sun"
    }

let year, month, day, dayW, hour, minute

const processTrigger = (now) => {

    year = now.getFullYear()
    month = (now.getMonth() + 1).toString().padStart(2, '0')
    day = now.getDate().toString().padStart(2, '0')
    dayW = week[now.getDay()]
    hour = now.getHours().toString().padStart(2, '0')
    minute = now.getMinutes().toString().padStart(2, '0')

    return `${year} ${month} ${day} ${dayW} ${hour} ${minute}`
}

const processEvery = (every) => {

    let everyMinute = every.minute || minute
        , everyHour = every.hour || hour
        , everyDay = every.day || day
        , everyDayW = every.weekday || dayW
        , everyMonth = every.month || month
        , everyYear = every.year || year

    return `${everyYear} ${everyMonth} ${everyDay} ${everyDayW} ${everyHour} ${everyMinute}`
}

/**
 * 
 * Runs scheduler
 */
module.exports = () => {
    let triggerPattern = ''
        , schedulePattern = ''

    triggerPattern = processTrigger(new Date())

    for (let s of schedules.all()) {

        if (!s.every || !s.endPoint || !s.enabled || !/http:|https:/.test(s.endPoint.protocol))
            continue

        schedulePattern = processEvery(s.every)
        if (schedulePattern === triggerPattern) {
            let http = (s.endPoint.protocol === "http:")
                ? require('http')
                : require('https')
                , data = ''
                , request
                , options = {}

            Object.assign(options, s.endPoint)

            if (s.data) {
                data = JSON.stringify(s.data)
                options.headers['Content-Length'] = data.length
            }

            try {
                request = http.request(options, (res) => {
                    res.on('data', (data) => 
                        logger(`runScheduler (${s.name}). Response: ${data}`, 'responses')
                    )
                    logger(`runScheduler (${s.name}). Status: ${res.statusCode}`, 'service')
                })                
                request.on('error', (e) =>
                    logger(`runScheduler (${s.name}). ResponseError: ${e.message}`, 'error')
                )
                request.write(data)
                request.end()
            } catch (e) /*istanbul ignore next*/ {
                logger(`runScheduler (${s.name}). RequestError: ${e.message}`, 'error')                
            }
        }
    }
}