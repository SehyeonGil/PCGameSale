create table sale_info(
    id int auto_increment primary key,
    game_id int not null,
    site_id int not null,
    start_day datetime,
    end_day datetime,
    sale_percentage int not null,
    sale_price int not null,
    FOREIGN KEY (game_id) REFERENCES game (id),
    FOREIGN KEY (site_id) REFERENCES site (id)
);