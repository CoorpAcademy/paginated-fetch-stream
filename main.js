const _ = require('lodash');
const {Transform} = require('stream');
const Bromise = require('bluebird');
const FetchPaginatedStream = require('./src/paginated-fetch-stream');

const numberFetcher = async ({ limit = 12, offset = 0 }) => {
    await Bromise.delay(2000);
    return _.range(offset, offset + limit);
};


const readable = new FetchPaginatedStream({ highWaterMark: 30, fetcher: numberFetcher, prefetch: true });

setTimeout(() => {
    console.log('>>>>>>>>>><START><<<<<<<<<<<<<')
    readable.on('data', value => {
        console.log('>>>', value)
        // if ((value + 1) % 20 == 0) {
        //     console.log('<<<<<<<<<<<<<<<<PAUSE>>>>>>>>>>>>>>>>>>>>><')
        //     readable.pause();
        //     setTimeout(() =>{
        //         console.log('=================RESUME=================')
        //         readable.resume()
        //     } , 2000)
        // }
    })
}, 3000)
