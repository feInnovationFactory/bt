var express = require('express')
var router = express.Router()
var cheerio = require('cheerio')
var request = require('request')
var mysql = require('mysql')
// local
// var connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   port: '3306',
//   database: 'keywords'
// })
// online
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'liyanan123',
  port: '3306',
  database: 'keywords'
})
connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack)
    return
  }
  console.log('connected as id ' + connection.threadId)
})
router.get('/', function (req, res, next) {
  var addSql = 'select * from keywords order by Id desc limit 100'
  var addSqlParams = []
  var final = []
  connection.query(addSql, addSqlParams, function (err, result) {
    if (err) {
      console.log('[INSERT ERROR] - ', err.message)
    }
    var keyWords = []
    result.forEach(function (element) {
      keyWords.push(element.keyWords)
    })
    final = Array.from(new Set(keyWords))
    // console.log(final)
    res.render('index', { title: 'BTManget', history: final, searchHot: true })
  })
  // console.log(final)
})
// console.log(getQueryByNameFromUrl('keyword'))
router.post('/searchWord', function (req, resContent, next) {
  console.log(req.headers)
  var word = encodeURI(encodeURI(req.body.keywords))
  var addSql = 'INSERT INTO keywords(Id,keyWords,time) VALUES(0,?,?)'
  var addSqlParams = [req.body.keywords, new Date()]

  connection.query(addSql, addSqlParams, function (err, result) {
    if (err) {
      console.log('[INSERT ERROR] - ', err.message)
      return
    }

    console.log('--------------------------INSERT----------------------------')
    console.log('INSERT ID:', result)
    console.log('--------------------------------------------------------\n\n')
  })
  var url = decodeURI(`https://btzzi.info/bt/${word}.html`)
  var opts = {
    url: url,
    header: {
      'Cookie': '__cfduid=d27f7fb1f0194049b1bf86541a5dd6b411554638981; Hm_lvt_39f341a95eb24ef1da6c210c6c27563d=1554638983; Hm_lpvt_39f341a95eb24ef1da6c210c6c27563d=1554638987',
      'Connection': 'keep-alive',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
      'Referer': 'https://btzzi.info',
      'Host': 'btzzi.info',
      'Upgrade-Insecure-Requests': 1

    }
  }

  request(opts, function (error, response, body) {
    // console.log(response)
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(body)
      console.log($)
      var getContent = $('#wall')

      var filmData = []

      getContent.find('.cili-item').each(function (item) {
        var filmManget = $(this).find('.download').attr('href')
        var filmName = $(this).find('.item-title h3 a').text()
        var createTime = $(this).find('.item-bar>span').eq(1).find('b').text()
        var fileSize = $(this).find('.item-bar>span').eq(2).find('b').text()
        var hot = $(this).find('.item-bar>span').eq(3).find('b').text()
        var nearlyDownload = $(this).find('.item-bar>span').eq(4).find('b').text()
        // console.log(createTime)
        filmData.push({
          filmManget,
          filmName,
          createTime,
          fileSize,
          hot,
          nearlyDownload
        })
      })
    } else {
      request.end()
    }
    console.log(filmData)
    resContent.render('index', {btData: filmData, searchHot: false})
  })
})

module.exports = router
