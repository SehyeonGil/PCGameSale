const cheerio = require("cheerio");
const config = require("./config");

const getSteamSaleListAmountPages = async (url) => {
    return await config.getHtml(url)
        .then(html => {
            let ulList = [];
            const $ = cheerio.load(html.data);
            const $bodyList = $("div.search_pagination_right").children("a");
            $bodyList.each(function (i, elem) {
                ulList[i] = {
                    pageNum : $(this).text(),
                };
            });
            return ulList[ulList.length-2].pageNum;
        });
};

const getSteamSaleListUrl = async (url,index) => {
    return await config.getHtml(url)
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
            const $ = cheerio.load(html.data);
            const $bodyList = $("div#search_resultsRows").children("a");
            $bodyList.each(function (i, elem) {
                let price = $(this).find('div.search_price').text().replace(/,/gi, "")
                    .replace(/ /gi, "").split("₩");
                if(price.length===2 && price[1].search("Free")!==-1){
                    price[1]=price[1].replace(/[^0-9]/g, "");
                    price=price.concat("0");
                }
                //let positive_review;
                let amount_review;
                let review= $(this).find('div.search_reviewscore span').attr('data-tooltip-html');
                if(review){
                    review = review.split("%");
                    //positive_review = review[0].replace(/[^0-9]/g,"");
                    amount_review = review[1].replace(/[^0-9]/g, "");
                }
                else{
                    //positive_review = null;
                    amount_review = 0;
                }
                const title = $(this).find('span.title').text().replace(/[™®🐻🌀❤]/g, "")
                    .replace(/["]/g, "'").trim();
                let url = $(this).attr('href');
                url=url.substring(0, url.indexOf('?'));
                ulList[i] = {
                    title: title,
                    sale_percentage: $(this).find('div.search_discount span').text().replace(/[-%]/g,""),
                    original_price: price[1],
                    sale_price: price[2],
                    url: url,
                    url_img: $(this).find('div.col.search_capsule img').attr('src'),
                    amount_review: amount_review,
                    site : "steam",
                };
            });
            return ulList.filter(n => n.title);
        });
};

exports.getSteamSaleList = async () => {
    const urlFirst = 'https://store.steampowered.com/search/?specials=1&ignore_preferences=1';
    const amountPages = await getSteamSaleListAmountPages(urlFirst);
    //const amountPages = 100;
    let gameList = [];
    for(let i=1;i<=amountPages;i++)
    {
        const url = 'https://store.steampowered.com/search/?ignore_preferences=1&specials=1&page=' + i;
        const list = await getSteamSaleListUrl(url,i);
        gameList = await gameList.concat(list);
    }
    return gameList;
};
