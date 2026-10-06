import * as migration_20261006_101311_init from './20261006_101311_init';
import * as migration_20261006_104516_catalog_pages from './20261006_104516_catalog_pages';
import * as migration_20261006_111453_shelf_follows from './20261006_111453_shelf_follows';
import * as migration_20261006_120000_unique_follows from './20261006_120000_unique_follows';
import * as migration_20261007_090000_seo_h1_templates from './20261007_090000_seo_h1_templates';

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
    name: '20261006_120000_unique_follows'
  },
  {
    up: migration_20261007_090000_seo_h1_templates.up,
    down: migration_20261007_090000_seo_h1_templates.down,
    name: '20261007_090000_seo_h1_templates',
  },
];
