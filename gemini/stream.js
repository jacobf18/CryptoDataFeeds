const Stream = require('stream');
const readableStream = new Stream.Readable();

readableStream.push('ping');
readableStream.push('ping');
