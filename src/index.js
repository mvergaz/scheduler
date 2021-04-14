"use strict"
/* istanbul ignore file */

const fs = require("fs")
    , path = require("path")
    , app = require('express')()
    , configFile = path.resolve(process.env.PWD, "config.json")
    , schedulerRunner = require('./lib/runScheduler')
    , logger = require('./lib/logger')

let listenerPort = 3000;

if (fs.existsSync(configFile)) {
    fs.writeFileSync('service.log','')
    fs.writeFileSync('error.log','')
    logger("index.js: config file found. Search for a valid port number > 3000...")
    let config = require(configFile)
    const port = config.find(c => c.key === 'port number').value || 3000
    if (port > 3000)
        listenerPort = port

    let interval = config.find(c => c.key === 'interval').value || 60000
    setInterval(schedulerRunner, interval)
} else {    
    logger("index: no config file found... exit", 'error')
    process.exit(0)
}

//require('./routes')(app);
const server = app.listen(process.env.PORT || listenerPort, () =>
    console.log("logger microservice listening on http://localhost:" + listenerPort)
)
module.exports = server