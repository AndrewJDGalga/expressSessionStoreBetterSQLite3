import assert from 'node:assert';
import { ExpressSessionStore } from '../index.js';

describe('Database connection', ()=>{
    describe('haults when', ()=>{
        it('a location issue arises', ()=>{
            assert.throws(()=>new ExpressSessionStore('../jimmies/db.db'));
        });
    });
});