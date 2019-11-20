
const steam = require("./steam");
const database = require("./database");

exports.getSteamTest = async (req,res,next) => {
    res.send("parsing~");
    const gameList = await steam.getSteamSaleList();
    await database.checkGame(gameList);
    console.log("End");
};