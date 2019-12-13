const mysql = require("mysql");
const mysqlInfo = require("../../config/mysqlInfo");
const dateFormat = require('dateformat');

const opts = {
    host     : mysqlInfo.host,
    user     : mysqlInfo.user,
    password : mysqlInfo.password,
    database : mysqlInfo.database
};

const connection = mysql.createConnection(opts);

exports.checkGame = async (gameList) => {
    let i=0;
    for (const game of gameList) {
        try{
            await checkExistGame(game,i);
            await checkExistSaleInfo(game,i);
        }catch (e) {
            console.log(e);
        }
        i++;
    }
};

const checkExistGame = async (game) => {
    if(!game)
        return 0;
    if(!game.original_price)
        return 0;
    if(game.site==="humble"){
        game.original_price = game.exchange_original_price;
    }
    const minOriginalPrice = game.original_price - game.original_price * 0.2;
    const maxOriginalPrice = +game.original_price + (game.original_price * 0.2);
    const sqlSelect = 'select count(*) from game where title="' + game.title + '" ' +
        'and (original_price <= "' + maxOriginalPrice + '"' +
        ' and original_price >= "' + minOriginalPrice + '")';

    const sqlInsert= 'insert into game (title, amount_review, url_'+game.site+', url_'+game.site+'_img, original_price) values ' +
        '("'+game.title+'", "'+game.amount_review+'", "'+
        game.url+'", "'+ game.url_img+'", "'+game.original_price+'")';
    return new Promise(async (resolve, reject) => {
        await connection.query(sqlSelect, async (error, results)=> {

            if (error) {
                console.log(error);
            }
            const result =await Object.values( JSON.parse( JSON.stringify(results[0])))[0];

            if(result===0) {
                await connection.query(sqlInsert);
                await connection.commit();
                resolve();
            }
            else {
                let sqlUpdate;
                if(game.site==="steam"){
                    sqlUpdate = 'UPDATE game ' +
                        'SET amount_review = "'+game.amount_review+'", ' +
                        'original_price = "'+game.original_price +'", '+
                        'url_'+game.site+'= "'+game.url +'", '+
                        'url_'+game.site+'_img = "'+game.url_img+'" '+
                        'WHERE title="' + game.title + '" and (original_price <= ' +
                        '"' + maxOriginalPrice + '" and original_price >= "'
                        + minOriginalPrice + '")';
                } else if(game.site==="humble"){
                    sqlUpdate = 'UPDATE game ' +
                        'SET url_'+game.site+'= "'+game.url +'", '+
                        'url_'+game.site+'_img = "'+game.url_img+'" '+
                        'WHERE title="' + game.title + '" and (original_price <= ' +
                        '"' + maxOriginalPrice + '" and original_price >= "'
                        + minOriginalPrice + '")';
                } else {
                    sqlUpdate = 'UPDATE game ' +
                        'SET original_price = "'+game.original_price +'", '+
                        'url_'+game.site+'= "'+game.url +'", '+
                        'url_'+game.site+'_img = "'+game.url_img+'" '+
                        'WHERE title="' + game.title + '" and (original_price <= ' +
                        '"' + maxOriginalPrice + '" and original_price >= "'
                        + minOriginalPrice + '")';
                }
                await connection.query(sqlUpdate);
                await connection.commit();
                resolve();
            }
        });
    })
};

const checkExistSaleInfo = async (game,index) => {
    if(!game)
        return;
    if(!game.sale_percentage)
        return;
    const sql = 'select id from sale_info ' +
        'where game_id=(select id from game where url_'+game.site+'="'+game.url+'") ' +
        'and (DATE(end_date)>="'+await dateFormat(Date.now(), "yyyy-mm-dd")+'" and DATE(start_date)<="'+await dateFormat(Date.now(), "yyyy-mm-dd")+'")'+
        'and sale_price="'+game.sale_price+'"';
    return new Promise(async (resolve, reject) => {
        await connection.query(sql, async (error, results)=> {
            if (error) {
                console.log(error);
                resolve();
                return;
            }
            if(!results) {
                return;
            }
            const saleInfoLength = results.length;
            if(saleInfoLength===0)
            {
                const sql = 'select id from game where ' +
                    'game.title="'+game.title+'" and game.url_'+game.site+'="'+game.url+'"';
                await connection.query(sql, async (err, results) => {
                    if(err){
                        console.log(err);
                        return;
                    }
                    if(!results[0]){
                        return;
                    }
                    const game_id = await Object.values(results[0])[0];
                    const sql = 'select id from site where name="'+game.site+'"';
                    await connection.query(sql, async (err, results) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        const site_id = await Object.values(results[0])[0];
                        let date = new Date();
                        await date.setDate(date.getDate()+1);
                        await dateFormat(date, "yyyy-mm-dd HH:MM:ss");
                        const sql = 'insert into sale_info (game_id, site_id, start_date, end_date, sale_percentage, sale_price) values ' +
                            '("' + game_id + '", "' + site_id + '", "' +
                            await dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss") + '", "' + await dateFormat(date, "yyyy-mm-dd") + ' 02:00:00", "'
                            + game.sale_percentage + '", "' + game.sale_price + '")';
                        await connection.query(sql);
                        await connection.commit();
                        resolve();
                    });
                });
            }
            else
            {
                if(!results[0]){
                    return;
                }
                let date = new Date();
                await date.setDate(date.getDate()+1);
                await dateFormat(date, "yyyy-mm-dd HH:MM:ss");
                const sql = 'update sale_info set end_date="'+await dateFormat(date, "yyyy-mm-dd")+' 02:00:00" ' +
                    'where id="'+Object.values(results[0])[0]+'"';
                await connection.query(sql);
                await connection.commit();
                resolve();
            }

        });
    });
};