
const puppeteer = require("puppeteer")

let browser, page;

beforeEach(async() => {
     browser = await puppeteer.launch({
        headless: false
    })
    page = await browser.newPage()
    await page.goto("localhost:3000")
})

afterEach(async() => {
    await browser.close()
})

test.only("When signed in, show logout button", async() => {
    const id = '6738b68a9b58850e90b321e4'

    const sessionObject = {
        passport: {
            user: id
        }
    }
    const Buffer = require('safe-buffer').Buffer
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64')

    const Keygrid = require('keygrip')
    const keys = require('../config/keys')
    const keygrid = new Keygrid([keys.cookieKey])
    const sig = keygrid.sign('session=' + sessionString)

    await page.setCookie({name: 'session', value: sessionString})
    await page.setCookie({name: 'session.sig', value: sig})
    await page.goto('localhost:3000');

    await page.waitFor('a[href="/auth/logout"]')
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

    expect(text).toEqual('Logout')
})
