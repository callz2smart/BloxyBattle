-- ============================================================
-- PE:INF Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- ── Pets table ──────────────────────────────────────────────
create table if not exists pets (
  id              int primary key,
  name            text        not null,
  image_filename  text        not null,
  value_numeric   numeric     not null,
  value_display   text        not null,
  demand          numeric     not null,
  exists_count    text,
  trend           text        not null check (trend in ('rising', 'stable', 'falling')),
  rarity          text        not null default 'huge',
  is_hot          boolean     not null default false,
  created_at      timestamptz default now()
);

-- ── User watchlist ───────────────────────────────────────────
create table if not exists user_watchlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  pet_id     int  not null references pets(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, pet_id)
);

-- ── User inventory ───────────────────────────────────────────
create table if not exists user_inventory (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  pet_id     int  not null references pets(id) on delete cascade,
  quantity   int  not null default 1,
  created_at timestamptz default now(),
  unique (user_id, pet_id)
);

-- ── RLS ─────────────────────────────────────────────────────
alter table pets           enable row level security;
alter table user_watchlist enable row level security;
alter table user_inventory enable row level security;

-- Pets are public read
create policy "Pets are viewable by everyone"
  on pets for select using (true);

-- Watchlist
create policy "Users can view their own watchlist"
  on user_watchlist for select using (auth.uid() = user_id);
create policy "Users can manage their watchlist"
  on user_watchlist for all using (auth.uid() = user_id);

-- Inventory
create policy "Users can view their own inventory"
  on user_inventory for select using (auth.uid() = user_id);
create policy "Users can manage their inventory"
  on user_inventory for all using (auth.uid() = user_id);

-- ── Seed data ────────────────────────────────────────────────
insert into pets (id, name, image_filename, value_numeric, value_display, demand, exists_count, trend, rarity, is_hot)
values
  (17, 'Huge Basket Nightmare Cat',  'HugeBasketNightmare',      115000000, '115M',  10,   '7',   'rising',  'huge', true),
  (1,  'Huge Starlight Hamster',     'HugeStarlightHamster',      69000000, '69M',   10,   '9',   'rising',  'huge', true),
  (12, 'Huge Onyx Gem Golem',        'HugeOnyxGolem',             66000000, '66M',    9,   '5',   'rising',  'huge', true),
  (41, 'Huge Crystal Pegasus',       'crystalpegasus',            50000000, '50M',    9,   '4',   'stable',  'huge', false),
  (42, 'Huge Gubert',                'gubertcat',                 40000000, '40M',    9,   '6',   'stable',  'huge', false),
  (10, 'Huge Broken Mining Robot',   'HugeBrokenMiningRobot',     21500000, '21.5M',  7,   '6',   'rising',  'huge', true),
  (4,  'Huge Empyrean Scorpion',     'HugeEmpyreanScorpion',      19000000, '19M',    8,   '6',   'falling', 'huge', false),
  (47, 'Huge Pixel Archgelus',       'pixelarchgelus',            18000000, '18M',    9,   '10',  'rising',  'huge', true),
  (40, 'Huge Abyss Dragon',          'abyssdragon',               17500000, '17.5M',  8,   '12',  'stable',  'huge', false),
  (8,  'Huge Sensei Cat',            'HugeSenseiCat_Basic',       15500000, '15.5M',  6,   '8',   'rising',  'huge', true),
  (5,  'Huge Hellish Dominus',       'HugeHellishDominus',        15000000, '15M',    8,   '10',  'falling', 'huge', false),
  (7,  'Huge Painted Bunny',         'HugePaintedBunny',          13500000, '13.5M',  7,   '5',   'rising',  'huge', true),
  (9,  'Huge Kaiju Bearserker',      'HugeKaijuBerserker_Basic',  10000000, '10M',    5,   '10',  'rising',  'huge', true),
  (2,  'Huge Mining Kraken',         'HugeMiningKraken',           8500000, '8.5M',   8,   '9',   'rising',  'huge', true),
  (14, 'Huge Gift Mining Cat',       'HugeGiftMiningCat',          8000000, '8M',     6.5, '14',  'rising',  'huge', true),
  (50, 'Huge Venom Corgi',           'venomcorgi',                 7500000, '7.5M',   8,   null,  'rising',  'huge', true),
  (3,  'Huge Celestial Fox',         'HugeStarlightHamster',       7000000, '7M',     7,   '15',  'stable',  'huge', false),
  (6,  'Huge Frost Dragon',          'abyssdragon',                6500000, '6.5M',   8,   '18',  'rising',  'huge', true),
  (11, 'Huge Shadow Wolf',           'HugeEmpyreanScorpion',       6000000, '6M',     7,   '20',  'stable',  'huge', false),
  (13, 'Huge Neon Phoenix',          'pixelarchgelus',             5500000, '5.5M',   6,   '22',  'falling', 'huge', false),
  (15, 'Huge Cosmic Bear',           'HugeMiningKraken',           5000000, '5M',     7,   '25',  'rising',  'huge', false),
  (16, 'Huge Dusk Unicorn',          'crystalpegasus',             4500000, '4.5M',   6,   '30',  'stable',  'huge', false),
  (18, 'Huge Volcanic Griffin',      'HugeOnyxGolem',              4000000, '4M',     5,   '35',  'falling', 'huge', false),
  (19, 'Huge Arctic Panther',        'HugePaintedBunny',           3800000, '3.8M',   6,   '40',  'rising',  'huge', false),
  (20, 'Huge Obsidian Drake',        'HugeHellishDominus',         3500000, '3.5M',   5,   '45',  'stable',  'huge', false),
  (21, 'Huge Thunder Serpent',       'HugeBrokenMiningRobot',      3200000, '3.2M',   7,   '28',  'rising',  'huge', true),
  (22, 'Huge Galaxy Cat',            'HugeSenseiCat_Basic',        3000000, '3M',     6,   '50',  'stable',  'huge', false),
  (23, 'Huge Prism Owl',             'gubertcat',                  2800000, '2.8M',   5,   '55',  'falling', 'huge', false),
  (24, 'Huge Magma Golem',           'HugeOnyxGolem',              2600000, '2.6M',   4,   '60',  'falling', 'huge', false),
  (25, 'Huge Storm Eagle',           'pixelarchgelus',             2400000, '2.4M',   6,   '65',  'rising',  'huge', false),
  (26, 'Huge Crystal Turtle',        'crystalpegasus',             2200000, '2.2M',   5,   '70',  'stable',  'huge', false),
  (27, 'Huge Inferno Lion',          'HugeEmpyreanScorpion',       2000000, '2M',     4,   '80',  'falling', 'huge', false),
  (28, 'Huge Ocean Serpent',         'HugeMiningKraken',           1800000, '1.8M',   5,   '90',  'stable',  'huge', false),
  (29, 'Huge Jade Panda',            'gubertcat',                  1600000, '1.6M',   4,   '100', 'falling', 'huge', false),
  (30, 'Huge Nebula Bunny',          'HugePaintedBunny',           1400000, '1.4M',   5,   '110', 'rising',  'huge', false),
  (31, 'Huge Dawn Phoenix',          'abyssdragon',                1200000, '1.2M',   4,   '120', 'stable',  'huge', false),
  (32, 'Huge Sapphire Wolf',         'HugeKaijuBerserker_Basic',   1000000, '1M',     5,   '130', 'rising',  'huge', false),
  (33, 'Huge Ember Tiger',           'HugeHellishDominus',          900000, '900K',   4,   '140', 'stable',  'huge', false),
  (34, 'Huge Moon Rabbit',           'HugePaintedBunny',            800000, '800K',   4,   '150', 'falling', 'huge', false),
  (35, 'Huge Prismatic Cat',         'HugeSenseiCat_Basic',         700000, '700K',   3,   '160', 'falling', 'huge', false),
  (36, 'Huge Stone Golem',           'HugeOnyxGolem',               600000, '600K',   3,   '170', 'stable',  'huge', false),
  (37, 'Huge Tidal Wave',            'HugeMiningKraken',            500000, '500K',   4,   '180', 'rising',  'huge', false),
  (38, 'Huge Aurora Bear',           'HugeKaijuBerserker_Basic',    400000, '400K',   3,   '200', 'stable',  'huge', false),
  (39, 'Huge Iron Drake',            'abyssdragon',                 350000, '350K',   3,   '220', 'falling', 'huge', false),
  (43, 'Huge Toxic Slime',           'HugeEmpyreanScorpion',        300000, '300K',   3,   '250', 'stable',  'huge', false),
  (44, 'Huge Rune Fox',              'HugeStarlightHamster',        250000, '250K',   2,   '280', 'falling', 'huge', false),
  (45, 'Huge Lunar Cat',             'HugeSenseiCat_Basic',         200000, '200K',   3,   '300', 'rising',  'huge', false),
  (46, 'Huge Spooky Pup',            'HugeKaijuBerserker_Basic',    150000, '150K',   2,   '350', 'stable',  'huge', false),
  (48, 'Huge Cloud Bunny',           'HugePaintedBunny',            120000, '120K',   2,   '400', 'falling', 'huge', false),
  (49, 'Huge Basic Cat',             'HugeSenseiCat_Basic',         100000, '100K',   2,   '500', 'stable',  'huge', false)
on conflict (id) do nothing;