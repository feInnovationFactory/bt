var express = require('express')
var router = express.Router()
var http = require('http')
var cheerio = require('cheerio')
var request = require('request')
var querystring = require('querystring')
var mysql = require('mysql')
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
  res.render('index', { title: 'BTManget' })
})

router.post('/searchWord', function (req, resContent, next) {
  console.log(req.body.keywords)
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
    console.log('-----------------------------------------------------------------\n\n')
  })
  var url = decodeURI(`https://www.btmye.cc/bt/${word}/time-1.html`)
  var opts = {
    url: url,
    header: {
      'Cookie': '__cfduid=d990391621493683ae28ee99c357cade61521958326; Hm_lvt_792abf9e9a255d4ffd2514437a5c942e=1521958327,1521958353; Hm_lpvt_792abf9e9a255d4ffd2514437a5c942e=152195848',
      'Connection': 'keep-alive',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
      'Referer': 'https://www.btmye.cc',
      'Host': 'btmye.cc',
      'Upgrade-Insecure-Requests': 1

    }
  }

  request(opts, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(body)
      console.log($)
      var getContent = $('#wall')

      var filmData = []

      getContent.find('.cili-item').each(function (item) {
        var filmManget = $(this).find('.download').attr('href')
        var filmName = $(this).find('.item-title h3 a').text()
        filmData.push({
          filmManget,
          filmName
        })
      })
    } else {
      request.end()
    }

    resContent.render('index', {btData: filmData})
  })
})

module.exports = router
