const _ = require('lodash');
const {Transform} = require('stream') 
const FetchPaginatedStream = require('./src/fetch-paginated-stream');

const numberFetcher = async ({ limit = 12, offset = 0 }, cb) => {
    return _.range(offset, offset + limit);
};


const readable = new FetchPaginatedStream({ fetcher: numberFetcher });
readable
    .pipe(new Transform({
        writableObjectMode: true,
        transform(chunk, encoding, callback) {
            callback(null, chunk.toString());
        }
    }))
    .pipe(process.stdout);