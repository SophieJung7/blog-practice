const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  // This build() function combines puppeteer Page class with CustomPage class here.
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }
  constructor(page) {
    this.page = page;
  }
  async login() {
    // ******* Make a new user and save it to mongoDB ******* //
    const user = await userFactory();
    // ******* Make Fake Session to mock Auth Process ******* //
    const { session, sig } = sessionFactory(user);
    // Set the session and session signature as cookies.
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    // Page reload
    await this.page.goto('localhost:3000/blogs');
    // Make Jest wait till 'a[href="/auth/logout"]' appears. --> Meaning Login was successful!
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
