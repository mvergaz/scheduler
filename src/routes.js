"use strict"

const router = require('express').Router()
    , fs = require('fs')
    , schedules = require('./lib/schedules')


module.exports = (app) => {
    app.use(require('express').json())

    /**
     * Usually, to check service status
     */
    router.get('/ping', (req, res) =>
        res.json({
            message: "pong"
        })
    )
    /**
     * For development & test approach only
     */

    router.get('/500', (req, res) => { throw new Error("Error") })

    /**
     * returns the schedules file content
     */
    router.get('/schedules', (req, res) => {
        res.send(schedules.all())
    })

    router.get('/schedule/:schedule', (req, res) => {
        res.send(schedules.find(req.params.schedule))
    })

    router.put('/schedule', (req, res) => {        
        res.send(schedules.push(req.body))
    })

    router.delete('/schedule/:schedule', (req, res) => {        
        res.send(schedules.splice(req.params.schedule))
    })

    app.use(router)

    app.use((err, req, res, next) => {
        let stackLines = err.stack.split("\n");
        let errMessage = stackLines[0] + "; " + stackLines[1].trim() + "\n";
        res.status(500).send(errMessage)
    })
}
