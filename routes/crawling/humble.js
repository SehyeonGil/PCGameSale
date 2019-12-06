const cheerio = require("cheerio");
const config = require("./config");

const getHumbleSaleListAmountPages = async (url) => {
    return await config.getHtmlPuppeteer(url)
        .then(html => {
            let ulList = [];
            //const $ = cheerio.load(html.data);
            const $ = cheerio.load(html);
            const $bodyList = $("h1.js-title-text");
            $bodyList.each(function (i, elem) {
                ulList[i] = {
                    pageNum : $(this).text().replace(/[^0-9]/g, ""),
                };
            });
            return Math.ceil(ulList[0].pageNum/20);
        });
};

const getExchangeRateUSD = async (url) => {
    return await config.getHtmlPuppeteer(url)
        .then(html => {
            let ulList = [];
            //const $ = cheerio.load(html.data);
            const $ = cheerio.load(html);
            const $bodyList = $("span.spt_con").children("strong");
            $bodyList.each(function (i, elem) {
                ulList[i] = {
                    USD : $(this).text().replace(/[,]/g, ""),
                };
            });
            return ulList[0].USD;
        });
};
const getHumbleSaleListUrl = async (url,index,USD) => {
    return await config.getHtmlPuppeteer(url)
        .then(html => {
            let ulList = [];
            if(!html){
                console.log("Cant "+index+" parsing ******************************");
                return;
            }
            else
            {
                console.log("page "+index+" parsing");
            }
            const $ = cheerio.load(html);
            const $bodyList = $("li.entity-block-container");
            $bodyList.each(function (i, elem) {
                let sale_price = parseFloat($(this).find('span.store-discounted-price').text().replace(/[$]/gi, "")
                    .replace(/ /gi, ""));
                let original_price = $(this).find('span.breakdown-full-price').text().replace(/[$]/gi, "")
                    .replace(/ /gi, "");
                //let positive_review;
                let amount_review = 0;
                const title = $(this).find('span.entity-title').text().replace(/[™®🐻🌀]/g, "").replace(/["]/g, "'");
                let url = "https://www.humblebundle.com" + $(this).find('a.entity-link').attr('href');
                ulList[i] = {
                    title: title,
                    sale_percentage: $(this).find('span.store-discount').text().replace(/[-%]/g,""),
                    original_price: original_price,
                    sale_price: sale_price,
                    url: url,
                    url_img: $(this).find('img.entity-image').attr('src'),
                    amount_review: amount_review,
                    site : "humble",
                    exchange_original_price : USD * original_price,
                    exchange_sale_price : USD * sale_price,
                };
            });
            return ulList.filter(n => n.title);
        });
};

exports.getHumbleSaleList = async () => {
    const urlFirst = 'https://www.humblebundle.com/store/search?sort=bestselling&filter=onsale&hmb_source=store_navbar';
    const amountPages = await getHumbleSaleListAmountPages(urlFirst);
    //const amountPages = 2;
    const urlExchangeRate ='https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%ED%99%98%EC%9C%A8';
    const USD = await getExchangeRateUSD(urlExchangeRate);
    let gameList = [];
    for(let i=0;i<amountPages;i++)
    {
        const url = 'https://www.humblebundle.com/store/search?sort=bestselling&filter=onsale&hmb_source=store_navbar&page=' + i;
        const list = await getHumbleSaleListUrl(url,i,USD);
        gameList = await gameList.concat(list);
    }
    return gameList;
};
