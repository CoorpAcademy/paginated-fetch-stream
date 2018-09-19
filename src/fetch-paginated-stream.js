const { Readable } = require('stream');
const _ = require('lodash');

class FetchPaginatedStream extends Readable {
  constructor(options) {
    super(_.extend({objectMode: true}, options));
    this.fetcher = options.fetcher;
    this.position = 0;
    this.pageSize = 16
    this.buffer = [];
    this.readCalled = false;
  }

  _pushResult(res){
    console.log(this.buffer)
    if(_.isEmpty(res)) return null;
    const shouldContinue = this.push(_.head(res));
    //console.log('shouldContinue', shouldContinue)
    if (shouldContinue) return this._pushResult(_.tail(res));
    console.log('STOP')
    return _.tail(res);
  }

  async _fetch() {
    // console.log('FETCH', offset)
    this.fetcher({offset: this.position }).then(res => {
      this.position += _.size(res);
      const remainingElements = this._pushResult(res);
      //console.log('remaining meleme', remainingElements)
      console.log(this.buffer, remainingElements)
      if(_.isEmpty(remainingElements)) {
        //console.log('recursive call to fetch')
        return this._fetch()
      }
      this.buffer = remainingElements;
    });
  }
  
  _read(size) {
    console.log('REEEEEAAAAAD')
    if (this.readCalled) return;
    if (!_.isEmpty(this.buffer)) {
      console.log('RETRIEVING FROM BUFFER')
      const remainingElements = this._pushResult(this.buffer);
      this.buffer = remainingElements;
      if (_.isEmpty(this.buffer))
        this._fetch().then(() => { this.readCalled = false; })
    } else {
      this._fetch().then(() => { this.readCalled = false; })
    }
    this.readCalled = true;
  }
}

module.exports = FetchPaginatedStream;