"use strict"

const fs = require('fs')
    , path = require("path")
    , schedulesDb = require('../lib/schedules')
    , logger = require('../lib/logger')
    , schedulerRunner = require('../lib/runScheduler')
    , configFilePath = path.resolve(process.env.PWD, "config.json")
    , config = require(configFilePath)
    , schedulesFile = path.resolve(process.env.PWD, 'schedules.json')
    , serviceLogFile = path.resolve(process.env.PWD, 'service.log')
    , errorLogFile = path.resolve(process.env.PWD, 'error.log')
    , responsesLogFile = path.resolve(process.env.PWD, 'responses.log')

describe('service unit tests', () => {

    beforeAll(async () => {
        fs.writeFileSync(serviceLogFile, '')
        fs.writeFileSync(errorLogFile, '')
        fs.writeFileSync(responsesLogFile, '')

    })

    test('expects the config file to exist', async () => {
        expect(fs.existsSync(configFilePath)).toBe(true)
    })

    test('expects port number to be > 3000', async () => {
        const port = config.find(c => c.key === "port number").value
        expect(port).toBeGreaterThan(3000)
    })

    test('expects interval to be > 1000', async () => {
        const interval = config.find(c => c.key === "interval").value
        expect(interval).toBeGreaterThan(1000)
    })

    test('expects logger to grab service logs', async () => {
        let message = "this is a message"
            , regExp = new RegExp(message, "g")
        logger(message)
        let logContents = fs.readFileSync(serviceLogFile).toString()
        expect(logContents).toMatch(regExp)
    })

    test('expects logger to grab error logs', async () => {
        let message = "this is a error"
            , regExp = new RegExp(message, "g")
        logger(message, 'error')
        let logContents = fs.readFileSync(errorLogFile).toString()
        expect(logContents).toMatch(regExp)
    })

    test('expects scheduler to detect JSON Syntax Error in schedules.json', async () => {
        let expectedError = 'runScheduler - JSONSyntaxError: Unexpected token } in JSON';
        let schedulesJsonContent = fs.readFileSync(schedulesFile).toString()
        fs.appendFileSync(schedulesFile, "}")
        schedulerRunner()
        fs.writeFileSync(schedulesFile, schedulesJsonContent)
        let errorLogContents = fs.readFileSync(errorLogFile).toString()
        expect(errorLogContents).toMatch(new RegExp(expectedError, "g"))
    })

    test('expects scheduler to run httpbin', (done) => {
        fs.writeFileSync(serviceLogFile, '')
        let httpbin = schedulesDb.find('httpbin')
        httpbin.enabled = true
        schedulesDb.push(httpbin)

        schedulerRunner()

        httpbin.enabled = false
        schedulesDb.push(httpbin)
        setTimeout(() => {
            let expectedLog = 'Status: 200';
            let serviceLogContents = fs.readFileSync(serviceLogFile).toString()
            expect(serviceLogContents).toMatch(new RegExp(expectedLog, "g"))
            done()

        }, 1000)
    })

    test('expects scheduler to run anything', (done) => {

        let anything = schedulesDb.find('anything')
        anything.enabled = true
        schedulesDb.push(anything)

        schedulerRunner()

        anything.enabled = false
        schedulesDb.push(anything)
        setTimeout(() => {
            let expectedLog = 'Status: 200';
            let serviceLogContents = fs.readFileSync(serviceLogFile).toString()
            expect(serviceLogContents).toMatch(new RegExp(expectedLog, "g"))
            done()

        }, 1000)
    })

    test('expects scheduler to catch ECONNREFUSED', (done) => {
        fs.writeFileSync(errorLogFile, '')
        let httpbin = schedulesDb.find('httpbin')
        httpbin.enabled = true
        httpbin.endPoint.hostname = 'localhost'
        schedulesDb.push(httpbin)

        schedulerRunner()

        httpbin.enabled = false
        httpbin.endPoint.hostname = 'httpbin.org'
        schedulesDb.push(httpbin)
        setTimeout(() => {
            let errorLogContents = fs.readFileSync(errorLogFile).toString()
            expect(errorLogContents).toMatch(new RegExp('ECONNREFUSED', 'g'))
            done()
        }, 1000)
    })

    test('expects schedulesDb.all() to return []', async () => {
        let destinationFile = path.resolve(process.env.PWD, 'schedules.json.temp')
        fs.copyFileSync(schedulesFile, destinationFile)
        fs.writeFileSync(schedulesFile, ".")
        let schedules = schedulesDb.all()        
        fs.copyFileSync(destinationFile, schedulesFile)
        expect(schedules).toEqual([])
    })



    test('expects schedulesDb to find httpbin object', async () => {
        let httpbin = schedulesDb.find('httpbin')
        expect(httpbin.name).toBe('httpbin')
        expect(httpbin.endPoint.hostname).toBe('httpbin.org')
        expect(httpbin.data).toBeDefined()
        expect(httpbin.every).toBeDefined()
        expect(httpbin.every.year).toBeNull()
        expect(httpbin.enabled).toBeDefined()
    })

    test('expects schedulesDb to push httpbin object', async () => {
        let httpbin = schedulesDb.find('httpbin')
        httpbin.enabled = true
        schedulesDb.push(httpbin)

        let schedules = JSON.parse(fs.readFileSync(schedulesFile).toString())
            , schedule = schedules.find(s => s.name === 'httpbin')

        httpbin.enabled = false
        schedulesDb.push(httpbin)
        expect(schedule.enabled).toBe(true)
    })

    test('expects schedulesDb to create and drop schedule', async () => {
        let newSchedule = {
            name: "new"
        }
        schedulesDb.push(newSchedule)

        let schedules = JSON.parse(fs.readFileSync(schedulesFile).toString())
            , scheduleFound = schedules.find(s => s.name === 'new')

        schedulesDb.splice(newSchedule.name)
        expect(scheduleFound.name).toBe('new')
    })

    test('expects find an "No schedule found" error', async () => {
        schedulesDb.find('httpbinn')
        let errorLog = fs.readFileSync(errorLogFile).toString()
        expect(errorLog).toMatch(new RegExp('No schedule httpbinn found', "g"))
    })

})