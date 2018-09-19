const _ = require('lodash');
const {Transform} = require('stream') 
const FetchPaginatedStream = require('./src/fetch-paginated-stream');

const numberFetcher = async ({ limit = 12, offset = 0 }, cb) => {
    return _.range(offset, offset + limit);
};


const readable = new FetchPaginatedStream({ fetcher: numberFetcher });
readable.on('data', value => {
    console.log('>>>', value)
    if ((value + 1) % 20 == 0) {
        console.log('<<<<<<<<<<<<<<<<PAUSE>>>>>>>>>>>>>>>>>>>>><')
        readable.pause();
        setTimeout(() =>{
            console.log('=================RESUME=================')    
            readable.resume()
        } , 2000)
    }
})

