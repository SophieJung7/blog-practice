const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  // This build() function combines puppeteer Page class with CustomPage class here.
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
    this.page.setDefaultTimeout(10000);

    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });

    // Page reload
    await this.page.goto('http://localhost:3000/blogs');

    // Make Jest wait till 'a[href="/auth/logout"]' appears. --> Meaning Login was successful!
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
