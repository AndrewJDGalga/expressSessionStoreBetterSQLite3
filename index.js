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
    get(sid, callback=null){
        let res = null;
        try {
            
        }catch(e){
            if(callback) callback(e);
        }
    }
    set(sid, sessionData, callback=null){
        try {
            const expire = Date.now() + (sessionData.cookie.maxAge || this.#defaultAge);
            this.#dbConnection.prepare(`
                insert or replace into ${this.#tableName} (sid, sess, expire)
                    values(?,?,?)
            `).run(sid, JSON.stringify(sessionData), expire);
        }catch(e){
            if(callback) callback(e);
        }
    }
    destroy(sid, callback=null){

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
