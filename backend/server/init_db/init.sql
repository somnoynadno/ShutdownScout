CREATE TABLE IF NOT EXISTS public.CountryTopSites(
country_name varchar not null unique,
top_sites varchar not null);