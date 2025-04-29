declare module 'better-sqlite3' {
  class Database {
    constructor(filename: string, options?: any);
    prepare(sql: string): Statement;
    transaction(fn: Function): Function;
    pragma(source: string, options?: { simple?: boolean }): any;
    checkpoint(databaseName?: string): void;
    close(): void;
    exec(sql: string): void;
  }

  interface Statement {
    run(...params: any[]): any;
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): IterableIterator<any>;
  }

  export default Database;
} 