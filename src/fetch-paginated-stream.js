const { Readable } = require('stream');
const _ = require('lodash');

class FetchPaginatedStream extends Readable {
  constructor(options) {
    super(_.extend({objectMode: true}, options));
    this.fetcher = options.fetcher;
    this.position = 0;
  }

  _read(size) {
    this.fetcher({offset: 0}).then(res => {
        this.push('yo')
        this.push({helo: 'yo'})
        _.map(res, v => this.push(v));
        this.push(null)
    }) ;
  }
}

module.exports = FetchPaginatedStream;