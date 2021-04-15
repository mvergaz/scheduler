"use strict"

const fs = require('fs')
    , path = require("path")
    , supertest = require("supertest")
    , schedules = require('../lib/schedules')
    , serviceLogFile = path.resolve(process.env.PWD, 'service.log')
    , errorLogFile = path.resolve(process.env.PWD, 'error.log')
    , responsesLogFile = path.resolve(process.env.PWD, 'responses.log')
let server

describe('service integration tests', () => {

    beforeAll(async () => {
        fs.writeFileSync(serviceLogFile, '')
        fs.writeFileSync(errorLogFile, '')
        fs.writeFileSync(responsesLogFile, '')
        fs.copyFileSync(
            path.resolve(process.env.PWD, 'trash', 'schedules.json'),
            path.resolve(process.env.PWD, 'schedules.json')
        )
        server = require('../index')
    })

    afterAll(async () => {
        await server.close()
    })

    test('expects error after error', async () => {
        const response = await supertest(server).get('/500')
        expect(response.status).toBe(500)
    })


    test('expects pong after ping', async () => {
        const response = await supertest(server).get('/ping')
        expect(response.body).toMatchObject({ message: "pong" })
    })

    test('expects GET /schedules to return all schedules ', async () => {
        let response = await supertest(server).get('/schedules')
        expect(response.body).toStrictEqual(schedules.all())
    })

    test('expects GET /schedule/httpbin to return httpbin schedule ', async () => {
        let response = await supertest(server).get('/schedule/httpbin')
        expect(response.body).toStrictEqual(schedules.find('httpbin'))
    })

    test('expects PUT /schedule to update httpbin schedule ', async () => {
        let httpbin = schedules.find('httpbin')
        httpbin.enabled = true
        await supertest(server).put('/schedule').send(httpbin)
        let schedule = schedules.find('httpbin')
        httpbin.enabled = false
        schedules.push(httpbin)
        expect(schedule.enabled).toBe(true)
    })

    test('expects PUT /schedule to create new schedule ', async () => {
        let newSchedule = {
            name: "new",
            endPoint:{},
            every:{}
        }
        await supertest(server).put('/schedule').send(newSchedule)
        let schedule = schedules.find('new')
        expect(schedule.name).toBe("new")
    })

    test('expects DELETE /schedule/new to delete the "new" schedule ', async () => {
        await supertest(server).delete('/schedule/new')
        let newSchedule = schedules.find('new')
        expect(newSchedule).toBeNull()
    })


})