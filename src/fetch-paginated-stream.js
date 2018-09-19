const { Readable } = require('stream');
const _ = require('lodash');

class FetchPaginatedStream extends Readable {
  constructor(options) {
    super(_.extend({ objectMode: true }, options));
    this.fetcher = options.fetcher;
    this.position = 0;
    this.pageSize = options.pageSize || 10;
    this.fetchingTreshold = options.fetchingTreshold || 30;
    this.buffer = [];
    this.nextPageToFetch = 0;
    this.nextPageToHandle = 0;
    this.prefetchedPages = {};

    if (options.prefetch) {
      const nPrefetch = Math.round(this.fetchingTreshold / this.pageSize);
      console.log('PREFETCH', nPrefetch, 'PAGES')
      _.times(nPrefetch, () => this._fetch(this.nextPageToFetch++, this.pageSize))
    }
  }

  async _fetch(page, pageSize) {
    console.log('FETCH', this.position)
    const offset = this.position;
    this.position += pageSize;
    this.fetcher({ offset, limit: pageSize }).then(res => {
      if (this.nextPageToHandle != page) {
        console.log('POSTPONE PAGE', page)
        this.prefetchedPages[page] = res;
      } else {
        console.log('STORE PAGE', page)
        this.nextPageToHandle++;
        this.buffer = _.concat(this.buffer, res);
        // unpile previous pages
        while (this.prefetchedPages[this.nextPageToHandle]) {
          console.log('UNPILE PAGE', this.nextPageToHandle)
          this.buffer = _.concat(this.buffer, this.prefetchedPages[this.nextPageToHandle]);
          delete this.prefetchedPages[page]
          this.nextPageToHandle++;
        }
      }
    });
  }

  _read(size) {
    if (!_.isEmpty(this.buffer)) {
      const next = _.head(this.buffer)
      this.buffer = _.tail(this.buffer);
      this.push(next);
    } else {
      this._fetch(this.nextPageToFetch++, this.pageSize).then(() => {
        console.log('BUFFER', this.buffer)
        const next = _.head(this.buffer)
        this.buffer = _.tail(this.buffer);
        this.push(next);
      })
    }
  }
}

module.exports = FetchPaginatedStream;