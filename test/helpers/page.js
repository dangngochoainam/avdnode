const puppeteer = require('puppeteer');
const Keygrid = require("keygrip");
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false
        })
        const page = await browser.newPage()

        const customPage = new CustomPage(page, browser);

        return new Proxy(customPage, {
            get (target, property)  {
                return customPage[property] || page[property] || browser[property];
            }
        })
    }

    constructor(page, browser) {
        this.page = page;
        this.browser = browser;
    }

    close() {
        this.browser.close();
    }

    async login() {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user)

        await this.page.setCookie({name: 'session', value: session})
        await this.page.setCookie({name: 'session.sig', value: sig})
        await this.page.goto('localhost:3000');

        await this.page.waitFor('a[href="/auth/logout"]')
    }

    getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
}
module.exports = CustomPage
