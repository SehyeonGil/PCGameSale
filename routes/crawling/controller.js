
const steam = require("./steam");
const humble = require("./humble");
const database = require("./database");

exports.getSteamTest = async (req,res,next) => {
    res.send("parsing~");
    const gameList = await steam.getSteamSaleList();
    await database.checkGame(gameList);
    console.log("steam end");
    const gameListHumble = await humble.getHumbleSaleList();
    await database.checkGame(gameListHumble);
    console.log("End");
};