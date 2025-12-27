import session from "express-session";
import Database from "better-sqlite3";

export {ExpressSessionStore};

class ExpressSessionStore extends session.Store {
    #defaultTableName = 'express-session';
    #defaultLocation = './sessions.db';
    #defaultAge = 86400000; //24hrs
    #dbConnection;
    #tableName;

    constructor(options) {
        super(options);
        this.#dbConnection = options.db ?? new Database(options.dbPath || this.#defaultLocation);
        this.#tableName = options.tableName || this.#defaultTableName;

        this.#dbConnection.exec(`
            create table if not exists ${this.#tableName} (
                sid text primary key,
                sess text not null,
                expire integer not null
            );
        `);
    }
    get(sid, callback){
        try {
            const row = this.#dbConnection.prepare(`
                select sess from ${this.#tableName}
                    where sid = ?
            `).run(sid);
            const sessData = row ? JSON.parse(row.sess) : null;
            callback(null, sessData);
        }catch(e){
            callback(e, null);
        }
    }
    set(sid, sessionData, callback=null){
        try {
            const expire = Date.now() + (sessionData.cookie.maxAge || this.#defaultAge);
            this.#dbConnection.prepare(`
                insert or replace into ${this.#tableName} (sid, sess, expire)
                    values(?,?,?)
            `).run(sid, JSON.stringify(sessionData), expire);
            callback?.(null);
        }catch(e){
            callback?.(e);
        }
    }
    //abstract destroy(sid: string, callback?: (err?: any) => void): void;
    destroy(sid, callback=null){
        try {
            this.#dbConnection.prepare(`
                delete from ${this.#tableName} where sid = ?
            `).run(sid);
            callback?.(null);
        }catch(e){
            callback?.(e);
        }
    }
    all(callback=null) {

    }
    length(callback=null){

    }
    clear(callback=null){

    }
    touch(sid, sessionData, callback=null){

    }
}
