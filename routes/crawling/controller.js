const express = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const mysql = require("mysql");
const mysqlInfo = require("../../config/mysqlInfo");


const connection = mysql.createConnection({
    host     : mysqlInfo.host,
    user     : mysqlInfo.user,
    password : mysqlInfo.password,
    database : mysqlInfo.database
});

const querySelectSync = async(sql) => {
    await connection.connect();
    const results = await connection.query(sql, (error, results, fields) => {
        if (error) {
            return error;
        }
        return results;
    });
    await connection.end();
    return results;
};

const getHtml = async (url) => {
    try {
        return await axios.get(url);
    } catch (error) {
        console.error(error);
    }
};

const getSteamSaleListAmountPages = async (url) => {
    return await getHtml(url)
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

const getSteamSaleListUrl = async (url) => {
    return await getHtml(url)
        .then(html => {
            let ulList = [];
            const $ = cheerio.load(html.data);
            const $bodyList = $("div#search_resultsRows").children("a");
            $bodyList.each(function (i, elem) {
                const price = $(this).find('div.search_price').text().replace(/,/gi, "")
                    .replace(/ /gi, "").split("₩");
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
                    amount_review = null;
                }
                const title = $(this).find('span.title').text().replace(/[™®]/g, "")
                ulList[i] = {
                    title: title,
                    sale_percentage: $(this).find('div.search_discount span').text().replace(/[-%]/g,""),
                    original_price: price[1],
                    sale_price: price[2],
                    url: $(this).attr('href'),
                    url_img: $(this).find('div.col.search_capsule img').attr('src'),
                    amount_review: amount_review,
                };
            });
            return ulList.filter(n => n.title);
        });
};

const getSteamSaleList = async () => {
    const urlFirst = 'https://store.steampowered.com/search/?specials=1&ignore_preferences=1';
    const amountPages = await getSteamSaleListAmountPages(urlFirst);
    let ulList = [];
    for(let i=1;i<=amountPages;i++)
    {
        const url = 'https://store.steampowered.com/search/?ignore_preferences=1&specials=1&page=' + i;
        const list = await getSteamSaleListUrl(url);
        ulList = await ulList.concat(list);
        //console.log(list);
    }
    console.log(amountPages);
    console.log(ulList);
    return ulList;
};


exports.getSteamTest = (req,res,next) => {
    getSteamSaleList()
        .then(ulList => {
            res.render('index',{title:ulList});
        });
};
