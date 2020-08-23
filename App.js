var http = require('http');
var url = require('url');
var request = require('request');

http.createServer(onRequest).listen(3000);

const { Transform } = require('stream');

const transfomers = (url) => {
  return new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk);
      this.on('end', () => {
        console.log({ chunk, url });
        callback();
      });
    },
  });
};

function onRequest(req, res) {
  var queryData = url.parse(req.url, true).query;
  if (queryData.url) {
    const transformer = transfomers(queryData.url);
    request({
      url: queryData.url,
    })
      .on('error', function (e) {
        res.end(e);
      })
      .pipe(res);
  } else {
    res.end('no url found');
  }
}
