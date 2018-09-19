const _ = require('lodash');
const FetchPaginatedStream = require('./src/fetch-paginated-stream');

const numberFetcher = async ({limit = 12, offset= 0}, cb) => {
    return _.range(offset, offset + limit);
};


const readable = new FetchPaginatedStream({fetcher: numberFetcher});
readable.pipe(process.stdout);