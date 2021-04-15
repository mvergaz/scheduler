"use strict"

const fs = require('fs')
    , path = require('path')
    , schedulerFile = path.resolve(process.env.PWD, 'schedules.json')
    , logger = require('./logger')

//Nota: sería interesante usar fast-json-stringify para la serialización a disco
//porque es sensiblemente más rápido que JSON.stringify y poque admite trabajar con ajv

/**
    Esto debería ser validado por la librería ajv (https://ajv.js.org/)
*/
const parseSchedule = (v) => {
    return {
        name: v.name,
        endPoint: {
            protocol: v.endPoint.protocol || "http:",
            hostname: v.endPoint.hostname || "localhost",
            port: v.endPoint.port || 80,
            path: v.endPoint.path || "/get",
            method: v.endPoint.method || "GET",
            headers: v.endPoint.headers || {}
        },
        data: v.data || null,
        every: {
            minute: v.every.minute || null,
            hour: v.every.hour || null,
            day: v.every.day || null,
            weekday: v.every.weekday || null,
            month: v.every.month || null,
            year: v.every.year || null
        },
        enabled: v.enabled || false
    }
}

/** 
 * Wrap arround schedules.json
 */
module.exports = {
    all: function () {
        let _schedules = fs.readFileSync(schedulerFile).toString()
        try {
            return Array.from(JSON.parse(_schedules))
        } catch (e) {
            logger('schedules - JSONSyntaxError: ' + e.message, 'error')
            return []
        }
    },

    find: function (name) {
        let _schedule = this.all().find(s => s.name === name)
        if (_schedule)
            return _schedule

        logger(`No schedule ${name} found`, 'error')
        return null
    },

    push: function (schedule) {
        if (!schedule.name  || !schedule.endPoint)
            return 'ko'

        let _schedules = this.all()
            , position = _schedules.findIndex(s => s.name === schedule.name)
        if (position < 0)
            _schedules.push(parseSchedule(schedule))
        else
            _schedules[position] = parseSchedule(schedule)
        fs.writeFileSync(schedulerFile, JSON.stringify(_schedules))
        return 'ok'
    },

    splice: function (name) {
        let _schedules = this.all()
            , position = _schedules.findIndex(s => s.name === name)
        _schedules.splice(position, 1)
        fs.writeFileSync(schedulerFile, JSON.stringify(_schedules))
        return 'ok'
    }
}
