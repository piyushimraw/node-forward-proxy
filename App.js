var url = require('url');
const axios = require('axios');
const cheerio = require('cheerio');
const { Readable } = require('stream');
const _ = require('lodash');

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (request, response) => {
  var queryData = url.parse(request.url, true).query;
  if (queryData.url) {
    const { url } = queryData;
    const transform = transfomers(url);
    axios
      .get(queryData.url)
      .then((res) => {
        const data = res.data;
        const headers = res.headers;
        const transformedHTML = transform(data);

        _.forEach(headers, (value, key) => {
          response.setHeader(key, value);
        });
        response.send(transformedHTML);
      })
      .catch((err) => {
        response.send(err);
      });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const proxyUrl = `http://localhost:3000/`;

const transformUrl = (baseUrl, contentUrl) => {
  return `${proxyUrl}?url=${baseUrl}${contentUrl}`;
};

const transfomers = (url) => (htmlstring) => {
  let $ = cheerio.load(htmlstring);

  $('a').each((_, element) => {
    var oldhref = element.attribs.href;
    if (oldhref) {
      var newHref = transformUrl(url, oldhref);
      element.attribs.href = newHref;
    }
  });

  $('link').each((_, element) => {
    var oldhref = element.attribs.href;
    if (oldhref) {
      var newHref = transformUrl(url, oldhref);
      element.attribs.href = newHref;
    }
  });

  return $.html();
};
