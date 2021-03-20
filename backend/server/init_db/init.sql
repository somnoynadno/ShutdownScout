CREATE TABLE IF NOT EXISTS public.CountryTopSites(
country_name varchar not null unique,
top_sites varchar not null);

CREATE TABLE IF NOT EXISTS public.PingRecord(
timestamp timestamp NOT NULL DEFAULT NOW() unique,
user_ip varchar not null,
user_region varchar not null,
pinged_county varchar not null,
ping integer not null,
availability real not null);
