const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('I can see blog create form', async () => {
    const text = await page.getContentsOf('form label');
    expect(text).toEqual('Blog Title');
  });

  describe('And when using valid inputs', async () => {
    beforeEach(async () => {
      // Emulate filling the form
      await page.type('.title input', 'Whatever title');
      await page.type('.content input', 'Whatever page');
      await page.click('form button');
    });
    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });
    test('Submitting and saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      // Won't there be other posts with the same class of '.card-title' & 'p'?
      // No. Because we generate a new user everytime we call login function.
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('Whatever title');
      expect(content).toEqual('Whatever page');
    });
  });

  describe('And when using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('The form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

// describe('When User is Not logged in', async () => {
//   test('User cannot create blog posts', async () => {
//     const result = await page.evaluate(() => {
//       return fetch('/api/blogs', {
//         method: 'POST',
//         credentials: 'same-origin',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           title: 'pong',
//           content: 'pongPong'
//         })
//       }).then(res => res.json());
//     });
//     expect(result).toEqual({ error: 'You must log in!' });
//   });

//   test('User cannot get a list of blog posts', async () => {
//     const result = await page.evaluate(() => {
//       return fetch('/api/blogs', {
//         method: 'GET',
//         credentials: 'same-origin',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }).then(res => res.json());
//     });
//     expect(result).toEqual({ error: 'You must log in!' });
//   });
// });
