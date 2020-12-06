var assert = require('assert');

// const sum = require('./index');
import { parseHTML } from '../src/Parser';

describe('parseHtml function:', function () {
    it('<a>abc</a>', function () {
        let tree = parseHTML('<a>abc</a>');

        assert.equal(tree.children[0].tagName, 'a');
    });

    it('<a href="//baidu.com">abc</a>', function () {
        let tree = parseHTML('<a href="//baidu.com">abc</a>');

        assert.equal(tree.children[0].attributes.length, 1);
        assert.equal(tree.children[0].attributes[0].name, 'href');
        assert.equal(tree.children[0].attributes[0].value, '//baidu.com');
    });

    it('<a disabled >abc</a>', function () {
        let tree = parseHTML('<a disabled >abc</a>');

        assert.equal(tree.children[0].attributes.length, 1);
        assert.equal(tree.children[0].attributes[0].name, 'disabled');
    });

    it('<a disabled id>abc</a>', function () {
        let tree = parseHTML('<a disabled id>abc</a>');

        assert.equal(tree.children[0].attributes.length, 2);
        assert.equal(tree.children[0].attributes[0].name, 'disabled');
        assert.equal(tree.children[0].attributes[1].name, 'id');
    });

    it('<a href="a" id>abc</a>', function () {
        let tree = parseHTML('<a href="a" id>abc</a>');

        // assert.equal(tree.children[0].attributes.length, 2);
        // assert.equal(tree.children[0].attributes[0].name, 'id');
        // assert.equal(tree.children[0].attributes[1].name, 'class');
    });

    it('<a id=abc>abc</a>', function () {
        let tree = parseHTML('<a id=abc>abc</a>');

        assert.equal(tree.children[0].attributes.length, 1);
        assert.equal(tree.children[0].attributes[0].name, 'id');
    });

    it('<img src/>', function () {
        let tree = parseHTML('<img src/>');

        console.log(tree)
    });

    it('<a id=\'abc\'><a/>', function () {
        let tree = parseHTML('<a id=\'abc\'><a/>');

    });
    it('<a />', function () {
        let tree = parseHTML('<a />');

    });
    it('<A /> upper case', function () {
        let tree = parseHTML('<A />');

    });
    it('<>', function () {
        let tree = parseHTML('<>');
        console.log(tree)
    });

});