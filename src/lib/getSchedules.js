"use strict"

const fs = require('fs')
    , path = require('path')

/**
 * 
 * @returns Schedules files content
 */
module.exports = () => {
    let schedulerFile = path.resolve(process.env.PWD, 'schedules.json')
    return fs.readFileSync(schedulerFile).toString()
}