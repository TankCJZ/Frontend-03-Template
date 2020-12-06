var assert = require('assert');

// const sum = require('./index');
import { sum } from './index.js';

describe('test sum function', function () {
    it('1 + 2 = 3', function () {
        assert.equal(sum(1, 2), 3);
    });
});