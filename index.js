import session from "express-session";
import Database from "better-sqlite3";

export {ExpressSessionStore};

class ExpressSessionStore extends session.Store {
    #defaultTableName = 'express-session';
    #defaultLocation = './sessions.db';
    #defaultAge = 86400000; //24hrs
    #dbConnection;
    #tableName;

    /**
     * @access public
     * @param {Object} options 
     */
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
    
    /**
     * Get SessionData by ID
     * @access public
     * @param {string} sid 
     * @param {function({null | Error}, {null | Object})} callback
     */
    get(sid, callback){
        try {
            const row = this.#dbConnection.prepare(`
                select sess from ${this.#tableName}
                    where sid = ?
            `).get(sid);
            const sessData = row ? JSON.parse(row.sess) : null;
            callback(null, sessData);
        }catch(e){
            callback(e, null);
        }
    }

    /**
     * Set SessionData
     * @access public
     * @param {string} sid 
     * @param {Object} sessionData
     * @param {null | function({null | Error})} callback
     */
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

    /**
     * Remove session
     * @param {string} sid 
     * @param {null | function({null | Error})} callback 
     */
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

    /**
     * Retrieve all sessions
     * @param {function({null | Error}, {null | Object[]})} callback 
     */
    all(callback) {
        try {
            const allRows = this.#dbConnection.prepare(`
                select sess from ${this.#tableName};
            `).all();
            const sessData = allRows ? allRows.map(row => JSON.parse(row.sess)) : null;
            callback(null, sessData);
        }catch(e){
            callback(e, null);
        }
    }

    /**
     * Count of sessions
     * @param {function({null | Error}, {null | Object[]})} callback 
     */
    length(callback){
        try{
            const numRows = this.#dbConnection.prepare(`
                select count(*) from ${this.#tableName}
            `).pluck();
            callback(null, numRows);
        }catch(e){
            callback(e, null);
        }
    }

    /**
     * Remove all sessions
     * @param {null | function({null | Error})} callback 
     */
    clear(callback=null){
        try{
            this.#dbConnection.prepare(`
                delete from ${this.#tableName}
            `).run();
            callback?.(null);
        }catch(e){
            callback?.(e);
        }
    }

    /**
     * Update session expiration
     * @param {string} sid 
     * @param {Object} sessionData 
     * @param {null | function({null | Error})} callback 
     */
    touch(sid, sessionData, callback=null){
        try{
            const expire = Date.now() + (sessionData.cookie.maxAge || this.#defaultAge);
            this.#dbConnection.prepare(`
                update ${this.#tableName}
                set expire = ?
                where sid = ?
            `).run(expire, sid);
            callback?.(null);
        }catch(e){
            callback?.(e);
        }
    }
}
