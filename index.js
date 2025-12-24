import session from "express-session";
import Database from "better-sqlite3";

export {ExpressSessionStore};

class ExpressSessionStore extends session.Store {
    #location;
    #dbConn(location, callback){
        let db = null;
        try {
            db = new Database(location, {verbose: console.log});
        }catch(e) {
            callback(e);
        }
        return db;
    }

    constructor(options) {
        super(options);
        this.#location = options.dbPath || './sessions.db';
        const db = this.#dbConn(this.#location, (err)=>{ throw err});
        db.exec(`
            create table if not exists express-session (
                sid text primary key,
                sess text not null,
                expire integer not null
            );
        `);
        db.close();
    }
    get(sid, callback=null){

    }
    set(sid, sessionData, callback=null){

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
