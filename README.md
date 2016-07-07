event-propagator
================

This is a small module that provides functions and an extension to the EventEmitter class to provide mechanisms of forwarding events from one emitter to another.

## Quickstart

```javascript
import {propagate} from 'event-propagator';
import {EventEmitter} from 'events';
import {createServer} from 'http';

let server = createServer((req, res) => {
    res.end('Hello, World!');
}).listen(8080);

let myEmitter = new EventEmitter();

propagate(server, myEmitter, 'listening');

myEmitter.on('listening', function() {
    console.log('Listening event propated from server to myEmitter');
});
```

However, it also allows you to do single propagation that remove the listener automatically after the first event received, and the ability to cancel the propagation of an event by inserting a "middleware" kind of function into the propagation handler.

For example:
```javascript
//Continued from above
propagate(server, myEmitter, 'connection', (socket) => {
    if(socket.remoteFamily === 'IPv4') {
        return false; //cancels propagation
    }
});

myEmitter.on('connection', function(socket) {
    console.log('New IPv6 connection');
    
    socket.setNoDelay();
});
```

Of course this is very trivial and not any more useful than a normal event listener. Where event propagation is most useful, however, is in deeply nested structures.

For example, I use this library in another library/program that manages loaded scripts and watches their files for changes. If a script's file changes, then a 'change' event must be propagated upwards to whatever scripts depend on it. It allows bubbling up of events.
 
 
## API

##### `isPropagating(source: EventEmitter, target: EventEmitter, event: string)` -> `bool`

Returns true if the given event is currently being propagated from the source to the target. As in, it is listening on the source for the given event.

##### `propagate(source: EventEmitter, target: EventEmitter, event: string, onEvent: fn() -> any|false, onlyOnce: bool, context: any)`

Will set up a listener on the source emitter to propagate the given event to the target, but only if the `onEvent` function returns non-false.

if `onlyOnce` is true, after the first propagation, the listener will remove itself and will not be able to be called again.

`context` is what `onEvent` is called with. E.g., `onEvent.call(context)`

Only one propagation handler is allowed at a time, to avoid doubling up. If you wish to change any of these settings, the propagation handler will need to be removed using `stopPropagating` and then added back.

`onEvent` defaults to an empty function, `onlyOnce` defaults to `false`, and context defaults to undefined.

##### `propagateOnce(source: EventEmitter, target: EventEmitter, event: string, onEvent: fn() -> any|false, context: any)`

A variation of the above where you don't need to specify a new onEvent but will still set `onlyOnce` to true.

##### `stopPropagating(source: EventEmitter, target: EventEmitter, event: string)`

Stops propagating any/all propagators added to source to propagate events to target.

##### `EventPropagator extends EventEmitter`

A class that extends EventEmitter from the `'events'` module to add the following functions:

* `isPropagatingTo(target: EventEmitter, event: string)` -> `bool`
* `isPropagatingFrom(source; EventEmitter, event: string)` -> `bool`
* `propagateTo(target: EventEmitter, event: string, onEvent: fn() -> any|false, onlyOnce: bool, context: any)`
    - Context defaults to `this`
* `propagateFrom(source: EventEmitter, event: string, onEvent: fn() -> any|false, onlyOnce: bool, context: any)`
    - Context defaults to `this`
* `stopPropagatingTo(target: EventEmitter, event: string)`
* `stopPropagatingFrom(source: EventEmitter, event: string)`

These are mostly just calls to the normal API given above, with `this` acting as the source or target depending on the function, but is provided for convenience.

## LICENSE

The MIT License (MIT)

Copyright (c) 2015-2016 Aaron Trent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
