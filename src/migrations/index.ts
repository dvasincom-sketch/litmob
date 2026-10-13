import * as migration_20261006_101311_init from './20261006_101311_init';
import * as migration_20261006_104516_catalog_pages from './20261006_104516_catalog_pages';
import * as migration_20261006_111453_shelf_follows from './20261006_111453_shelf_follows';
import * as migration_20261006_120000_unique_follows from './20261006_120000_unique_follows';
import * as migration_20261007_090000_seo_h1_templates from './20261007_090000_seo_h1_templates';
import * as migration_20261007_093800_reviews_and_fejri from './20261007_093800_reviews_and_fejri';
import * as migration_20261013_110000_db_session_timeouts from './20261013_110000_db_session_timeouts';
import * as migration_20261013_180000_reset_idle_session_timeout from './20261013_180000_reset_idle_session_timeout';

export const migrations = [
  {
    up: migration_20261006_101311_init.up,
    down: migration_20261006_101311_init.down,
    name: '20261006_101311_init',
  },
  {
    up: migration_20261006_104516_catalog_pages.up,
    down: migration_20261006_104516_catalog_pages.down,
    name: '20261006_104516_catalog_pages',
  },
  {
    up: migration_20261006_111453_shelf_follows.up,
    down: migration_20261006_111453_shelf_follows.down,
    name: '20261006_111453_shelf_follows',
  },
  {
    up: migration_20261006_120000_unique_follows.up,
    down: migration_20261006_120000_unique_follows.down,
    name: '20261006_120000_unique_follows',
  },
  {
    up: migration_20261007_090000_seo_h1_templates.up,
    down: migration_20261007_090000_seo_h1_templates.down,
    name: '20261007_090000_seo_h1_templates',
  },
  {
    up: migration_20261007_093800_reviews_and_fejri.up,
    down: migration_20261007_093800_reviews_and_fejri.down,
    name: '20261007_093800_reviews_and_fejri',
  },
  {
    up: migration_20261013_110000_db_session_timeouts.up,
    down: migration_20261013_110000_db_session_timeouts.down,
    name: '20261013_110000_db_session_timeouts',
  },
  {
    up: migration_20261013_180000_reset_idle_session_timeout.up,
    down: migration_20261013_180000_reset_idle_session_timeout.down,
    name: '20261013_180000_reset_idle_session_timeout',
  },
];
