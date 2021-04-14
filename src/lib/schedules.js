"use strict"

const fs = require('fs')
    , path = require('path')
    , schedulerFile = path.resolve(process.env.PWD, 'schedules.json')
    , logger = require('./logger')

/**
 * 
 * Wrap arround schedules.json
 */
module.exports = {
    all: function () {
        let _schedules = fs.readFileSync(schedulerFile).toString()
        try {
            return Array.from(JSON.parse(_schedules))
        } catch (e) {            
            return []
        }
    },

    find: function (name) {
        
        let _schedule = this.all().find(s => s.name === name)
        if(_schedule)
            return _schedule
        
        logger(`No schedule ${name} found`, 'error')
        return null        
    },

    push: function (schedule) {
        let _schedules = this.all()
            , position = _schedules.findIndex(s => s.name === schedule.name)
        if (position < 0)
            _schedules.push(schedule)
        else
            _schedules[position] = schedule
        fs.writeFileSync(schedulerFile, JSON.stringify(_schedules))
    },

    splice: function(name) {
        let _schedules = this.all()
            , position = _schedules.findIndex(s => s.name === name)
        _schedules.splice(position, 1)
        fs.writeFileSync(schedulerFile, JSON.stringify(_schedules))
    }
}