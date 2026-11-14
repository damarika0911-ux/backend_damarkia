/** Row/result shapes returned by promisePool.query (see database/connection.ts). */
export type RowDataPacket = Record<string, any>;
export type ResultSetHeader = { affectedRows: number; insertId: any };
