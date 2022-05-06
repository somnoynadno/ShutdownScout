CREATE TABLE IF NOT EXISTS public.CountryTopSites(
country_name varchar not null unique,
top_sites varchar not null);

CREATE TABLE IF NOT EXISTS public.PingRecord(
timestamp timestamp NOT NULL DEFAULT NOW(),
user_ip varchar not null,
user_region varchar not null,
pinged_county varchar not null,
ping integer not null,
availability real not null,
provider varchar not null);

CREATE TABLE IF NOT EXISTS public.ProxyPingRecord(
timestamp timestamp NOT NULL DEFAULT NOW(),
proxy_protocol varchar not null,
proxy_ip varchar not null,
proxy_port integer not null,
proxy_region varchar not null,
pinged_county varchar not null,
ping integer not null,
availability real not null);

CREATE TABLE "public"."lookup" (
    "IP" character varying NOT NULL,
    "LookupRes" character varying NOT NULL,
    "LookupServer" character varying NOT NULL
) WITH (oids = false);

