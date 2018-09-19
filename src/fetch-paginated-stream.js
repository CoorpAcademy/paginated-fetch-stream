const { Readable } = require('stream');
const _ = require('lodash');

class FetchPaginatedStream extends Readable {
  constructor(options) {
    super(_.extend({objectMode: true}, options));
    this.fetcher = options.fetcher;
    this.position = 0;
    this.buffer = [];
  }

  _pushResult(res){
    if(_.isEmpty(res)) return null;
    const shouldContinue = this.push(_.head(res));
    if (shouldContinue) return this._pushResult(_.tail(res));
    console.log('STOP')
    return _.tail(res);
  }
  
  _read(size) {
    // _read() should continue reading from the resource and pushing data until readable.push() returns false
    this.fetcher({offset: 0}).then(res => {
      const remainingElements = this._pushResult(res);
      console.log('REMAIN', remainingElements);
    }) ;
  }
}

module.exports = FetchPaginatedStream;