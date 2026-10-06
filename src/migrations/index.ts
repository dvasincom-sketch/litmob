import * as migration_20261006_101311_init from './20261006_101311_init';
import * as migration_20261006_120000_unique_follows from './20261006_120000_unique_follows';

export const migrations = [
  {
    up: migration_20261006_101311_init.up,
    down: migration_20261006_101311_init.down,
    name: '20261006_101311_init'
  },
  {
    up: migration_20261006_120000_unique_follows.up,
    down: migration_20261006_120000_unique_follows.down,
    name: '20261006_120000_unique_follows'
  },
];
