drop table if exists sale_info;

create table sale_info(
    id int auto_increment primary key,
    game_id int not null,
    site_id int not null,
    start_date datetime,
    end_date datetime,
    sale_percentage int not null,
    sale_price decimal(10,2) not null,
    FOREIGN KEY (game_id) REFERENCES game (id),
    FOREIGN KEY (site_id) REFERENCES site (id)
);