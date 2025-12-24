
/**
 * Get connection to SQlite3 DB, and creates if not present.
 * @access private
 * 
 * @returns {(Database | null)}
 */
function dbConnection(location, logObj) {
    let db = false;
    try {
        db = new Database(location, {verbose: console.log});
        db.pragma('foreign_keys = on');
    }catch(e) {
        logArr
    }
    return db;
}