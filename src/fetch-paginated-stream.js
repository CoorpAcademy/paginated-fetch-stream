const { Readable } = require('stream');
const _ = require('lodash');

class FetchPaginatedStream extends Readable {
  constructor(options) {
    super(_.extend({ objectMode: true }, options));
    this.fetcher = options.fetcher;
    this.position = 0;
    this.pageSize = 16
    this.buffer = [];
    this.readCalled = false;
  }

  async _fetch() {
    // console.log('FETCH', offset)
    this.fetcher({ offset: this.position }).then(res => {
      this.position += _.size(res);
      this.buffer = _.concat(this.buffer, res);
    });
  }

  _read(size) {
    if (!_.isEmpty(this.buffer)) {
      this.push(_.head(this.buffer));
      this.buffer = _.tail(this.buffer);
    } else {
      this._fetch().then(() => {
        this.push(_.head(this.buffer));
        this.buffer = _.tail(this.buffer);
      })
    }
  }
}

module.exports = FetchPaginatedStream;