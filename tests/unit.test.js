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
        describe('retrieves session data', ()=>{
            const sid = 'test-sess-id';
            
            it('match and data', (done)=>{
                const sessData = { userId: 123, cookie: { maxAge: 1 }};
                const row = {sess: JSON.stringify(sessData)};
                mockDB.prepare().get.withArgs(sid).returns(row);

                store.get(sid, (err, data)=>{
                    assert.strictEqual(err, null);
                    assert.deepStrictEqual(data, sessData);
                    done();
                });
            });

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