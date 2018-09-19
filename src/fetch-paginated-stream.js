const { Readable } = require('stream');
const _ = require('lodash');

class FetchPaginatedStream extends Readable {
  constructor(options) {
    super(_.extend({ objectMode: true }, options));
    this.fetcher = options.fetcher;
    this.position = 0;
    this.pageSize = options.pageSize || 10;
    this.fetchingTreshold = options.fetchingTreshold || 50;
    this.buffer = [];
    this.nextPageToFetch = 0;
    this.nextPageToHandle = 0;
    this.prefetchedPages = {};
    this.isPrefetching = false;

    if (options.prefetch) {
      const nPrefetch = Math.round(this.fetchingTreshold / this.pageSize);
      console.log('PREFETCH', nPrefetch, 'PAGES')
      _.times(nPrefetch, () => this._fetch(this.nextPageToFetch++, this.pageSize))
    }
  }

  log() {
    return `(${_.size(this.buffer)} ${_.head(this.buffer)}<->${_.last(this.buffer)})`
  }
  PUSH(chunk, extra) {
    console.log('PUSH', chunk, extra || '')
    this.push(chunk)
  }

  async _fetch(page, pageSize) {
    console.log('FETCH', page, `(${this.position})`)
    const offset = this.position;
    this.position += pageSize;
    const res = await this.fetcher({ offset, limit: pageSize })
    if (this.nextPageToHandle != page) {
      console.log('POSTPONE PAGE', page, this.log())
      this.prefetchedPages[page] = res;
    } else {
      console.log('STORE PAGE', page, this.log())
      this.nextPageToHandle++;
      this.buffer = _.concat(this.buffer, res);
      // unpile previous pages
      while (this.prefetchedPages[this.nextPageToHandle]) {
        console.log('UNPILE PAGE', this.nextPageToHandle, this.log())
        this.buffer = _.concat(this.buffer, this.prefetchedPages[this.nextPageToHandle]);
        delete this.prefetchedPages[page]
        this.nextPageToHandle++;
      }
    };
  }

  _read(size) {
    console.log('READ')
    if (!_.isEmpty(this.buffer)) {
      const next = _.head(this.buffer)
      this.buffer = _.tail(this.buffer);
      this.PUSH(next);
      if (_.size(this.buffer) < this.fetchingTreshold && !this.isPrefetching) {
        console.log('PREFETCHING PAGE', this.nextPageToFetch, this.log());
        this.isPrefetching = true;
        this._fetch(this.nextPageToFetch++, this.pageSize).then(() => { this.isPrefetching = false; });
      }
    } else {
      console.log('EMERGENCY FETCH OF PAGE', this.nextPageToFetch)
      // if (this.isPrefetching) return;
      // this.isPrefetching = true;
      this._fetch(this.nextPageToFetch++, this.pageSize).then(() => {
        console.log('BUFFER>>>>>>><', this.buffer)
        const next = _.head(this.buffer);
        this.buffer = _.tail(this.buffer);
        this.PUSH(next, 'POSTFETCH');
        // this.isPrefetching = false;
      })
    }
  }
}

module.exports = FetchPaginatedStream;