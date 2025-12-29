import assert from 'node:assert';
import sinon from 'sinon';
import { ExpressSessionStore } from '../index.js';

describe('ExpressSessionStore object', ()=>{
    let store;
    let mockDB;

    beforeEach(()=>{
        mockDB = {
            exec: sinon.stub(),
            prepare: sinon.stub().returns({
                get: sinon.stub(),
                run: sinon.stub(),
                all: sinon.stub(),
                pluck: sinon.stub()
            })
        };
        store = new ExpressSessionStore({ db: mockDB });
    });

    afterEach(()=>{
        sinon.restore();
    });

    describe('get method', ()=>{
        const sid = 'test-sess-id';
        
        describe('retrieves session data', ()=>{    
            it('success', (done)=>{
                const sessData = { userId: 123, cookie: { maxAge: 1 }};
                const row = {sess: JSON.stringify(sessData)};
                mockDB.prepare().get.withArgs(sid).returns(row);

                store.get(sid, (err, data)=>{
                    assert.strictEqual(err, null);
                    assert.deepStrictEqual(data, sessData);
                    done();
                });
            });
        });

        describe('fails to retrieve session data', ()=>{
            it('no match and null', (done)=>{
                mockDB.prepare().get.withArgs(sid).returns(null);
                store.get(sid, (err, data)=>{
                    assert.strictEqual(err, null);
                    assert.strictEqual(data, null);
                    done();
                })
            });
            it('database error', (done)=>{
                const error = new Error('Database Error');
                mockDB.prepare().get.withArgs(sid).throws(error);
    
                store.get(sid, (err, data)=>{
                    assert.strictEqual(error, err);
                    assert.strictEqual(data, null);
                    done();
                });
            });
        });
    });

    describe('set method', ()=>{
        describe('new entry', ()=>{

        });

        describe('failed entry', ()=>{
            
            it('database error', ()=>{
                const sid = 'test-sess-id';
                const sessData = { userId: 123, cookie: { maxAge: 1 }};
                const error = new Error('Database Error');
                const strified = JSON.stringify(sessData);
                const expire = Date.now() + 1;
                mockDB.prepare().run.withArgs(sid, strified, expire).throws(error);

                store.set(sid, sessData, (err)=>{
                    assert.strictEqual(error, err);
                });
            });
        });
    });

    describe('destroy method', ()=>{

    });

    describe('all method', ()=>{

    });

    describe('length method', ()=>{

    });

    describe('clear method', ()=>{

    });

    describe('touch method', ()=>{

    });
});