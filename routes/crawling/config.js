const axios = require("axios");
const puppeteer = require('puppeteer');


exports.getHtml = async (url) => {
    try {
        return await axios.get(url);
    } catch (error) {
        console.error(error);
        return null;
    }
};

exports.getHtmlPuppeteer = async (url) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url);
        const contents = await page.content();
        await browser.close();
        return contents;
    } catch (error) {
        console.error(error);
        return null;
    }
};
