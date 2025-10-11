import type { createDB } from './db/db';

export { READER } from './db/channel/getChannel';
export { createDB } from './db/db';
export type DBHandler = ReturnType<typeof createDB>;
