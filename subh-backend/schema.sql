create table categories (
id serial primary key, 
name text unique not null, 
description text, 
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
image text
)