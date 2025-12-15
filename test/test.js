import { loadTable, deleteItem } from '../js/comments.js';

QUnit.module('comments page', function(hooks) {

    hooks.beforeEach(function() {
        document.body.innerHTML = `
            <button id="load-data"></button>
            <p id="lambda-info"></p>
        `;
    });

    QUnit.test('loadTable creates a table when data is returned', function(assert) {
        const done = assert.async();

        // Mock XMLHttpRequest
        const mockResponse = JSON.stringify([
            { id: "1", name: "Amazing!", price: 5 }
        ]);

        class MockXHR {
            open() {}
            setRequestHeader() {}
            send() {
                this.status = 200;
                this.responseText = mockResponse;
                this.onload();
            }
        }

        window.XMLHttpRequest = MockXHR;

        loadTable();

        setTimeout(() => {
            const table = document.querySelector('table');
            assert.ok(table, 'Table was created');
            assert.ok(
                document.getElementById('lambda-info').textContent.includes('Amazing!'),
                'Comment text rendered'
            );
            done();
        });
    });

    QUnit.test('loadTable shows error message on bad JSON', function(assert) {
        const done = assert.async();

        class MockXHR {
            open() {}
            setRequestHeader() {}
            send() {
                this.responseText = 'INVALID_JSON';
                this.onload();
            }
        }

        window.XMLHttpRequest = MockXHR;

        loadTable();

        setTimeout(() => {
            assert.ok(
                document.getElementById('lambda-info').textContent.includes('Error loading data'),
                'Error message shown'
            );
            done();
        });
    });

    QUnit.test('deleteItem sends DELETE request when confirmed', function(assert) {
        const done = assert.async();

        window.confirm = () => true;

        let deleteCalled = false;

        class MockXHR {
            open(method, url) {
                if (method === 'DELETE' && url.includes('/items/123')) {
                    deleteCalled = true;
                }
            }
            setRequestHeader() {}
            send() {
                this.status = 204;
                this.onload();
            }
        }

        window.XMLHttpRequest = MockXHR;

        deleteItem('123');

        setTimeout(() => {
            assert.ok(deleteCalled, 'DELETE request was sent');
            done();
        });
    });

    QUnit.test('deleteItem does nothing if user cancels', function(assert) {
        window.confirm = () => false;

        let xhrCreated = false;

        class MockXHR {
            constructor() {
                xhrCreated = true;
            }
            open() {}
            send() {}
        }

        window.XMLHttpRequest = MockXHR;

        deleteItem('999');

        assert.notOk(xhrCreated, 'No XHR created when delete is cancelled');
    });

});