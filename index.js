import session from "express-session";
import Database from "better-sqlite3";

export {ExpressSessionStore};

class ExpressSessionStore extends session.Store {
    #defaultTableName = 'express-session';
    #defaultLocation = './sessions.db';
    #defaultAge = 86400000; //24hrs
    #dbConnection;
    #tableName;

    #typecheck(received, expected, functionName){
        if(typeof(received) !== expected) throw new Error(`${functionName} expected ${expected} and recieved ${typeof(received)}`);
    }

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
     * @param {Function({null | Error}, {null | Object})} callback
     */
    get(sid, callback){
        this.#typecheck(sid, 'string', 'get');
        this.#typecheck(callback, 'function', 'get');
        
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
     * @param {null | Function({null | Error})} callback
     */
    set(sid, sessionData, callback=null){
        this.#typecheck(sid, 'string', 'set');
        this.#typecheck(sessionData, 'object', 'set');
        if(callback !== null) this.#typecheck(callback, 'function', 'set');

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
     * @param {null | Function({null | Error})} callback 
     */
    destroy(sid, callback=null){
        this.#typecheck(sid, 'string', 'destroy');
        if(callback !== null) this.#typecheck(callback, 'function', 'destroy');

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
     * @param {Function({null | Error}, {null | Object[]})} callback 
     */
    all(callback) {
        this.#typecheck(callback, 'function', 'all');

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
     * @param {Function({null | Error}, {null | Object[]})} callback 
     */
    length(callback){
        this.#typecheck(callback, 'function', 'length');

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
     * @param {null | Function({null | Error})} callback 
     */
    clear(callback=null){
        if(callback !== null) this.#typecheck(callback, 'function', 'clear');

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
     * @param {null | Function({null | Error})} callback 
     */
    touch(sid, sessionData, callback=null){
        this.#typecheck(sid, 'string', 'touch');
        this.#typecheck(sessionData, 'object', 'touch');
        if(callback !== null) this.#typecheck(callback, 'function', 'touch');

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

    /**
     * @access public
     * @param {{null | Function({null | Error})}} callback 
     */
    cleanup(callback=null){
        if(callback !== null) this.#typecheck(callback, 'function', 'cleanup');

        try {
            this.#dbConnection.prepare(`
                delete from ${this.#tableName} where expire < ?
            `).run(Date.now());
            callback?.(null);
        }catch(e){
            callback?.(e);
        }
    }
}
