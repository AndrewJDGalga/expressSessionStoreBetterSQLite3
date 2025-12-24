import session from "express-session";
import Database from "better-sqlite3";

export {ExpressSessionStore};

class ExpressSessionStore extends session.Store {
    #location;
    #tableName = 'express-session';
    #defaultLocation = './sessions.db';
    #dbConn(){
        return new Database(this.#location, {verbose: console.log});
    }

    constructor(options) {
        super(options);
        this.#location = options.dbPath || this.#defaultLocation;
        const db = this.#dbConn();
        db.exec(`
            create table if not exists ${this.#tableName} (
                sid text primary key,
                sess text not null,
                expire integer not null
            );
        `);
        db.close();
    }
    get(sid, callback=null){
        let res = null;
        try {
            
        }catch(e){
            if(callback) callback(e);
        }
    }
    set(sid, sessionData, callback=null){
        let res = null;
        try {
            const db = this.#dbConn();
            
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
