create table game(
    id int auto_increment primary key,
    title char(200) not null,
    amount_review int not null,
    url_steam char(200) default null,
    url_steam_img char(200) default null,
    url_direct char(200) default null,
    url_direct_img char(200) default null,
    url_humble char(200) default null,
    url_humble_img char(200) default null,
    original_price int not null,
    now_sale bool default false
);