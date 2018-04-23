const http = require("http");
const url = require("url");
// const querystring = require("querystring");
const step = require("step");
const {login, regist, insert, select} = require('./conMySQL');

function getPathName (u) {
	return url.parse(u).pathname
}
function getQuery (u) {
	var str = url.parse(u).query;
	var q = {};
	if (str) {
		str = str.split('&')
		str.forEach(function(val, key) {
			val = val.split('=') 
			var k = val[0];
			var v = val[1]
			q[k] = v
		})
	} 
	return q;
}

http.createServer(function (req, res) {
	var body = {} //存放返回值
	var data = '' // 存放请求值

	if (getPathName(req.url) === '/login') {
		console.log('进入登录')
		res.writeHead(200, {
					'Content-Type': 'text/plain;charset=utf8',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept',
					'Access-Control-Allow-Methods': 'POST'
		});
		
		var data = ''
		req.on('data', function(chunk){
			data += chunk
		})

		req.on('end',function(){
			if (data) {
				var j = JSON.parse(data)
				console.log('处理后的数据：' + data)
				login(j.tel, j.pwd).then(function(obj){
					var body = {}
					if (obj.status === 400) {
						body = {
							code: 1,
							message: '登录失败' 
						}
						res.write(JSON.stringify(body))
						res.end()
					} else {
						select(j.tel).then(function(obj){
							body = {
								code: 0,
								message: '登录成功',
								data: obj.data[0]
							}
							res.write(JSON.stringify(body))
							res.end()
						})
					}
				}).catch(function(err){})

			} else {
				res.end('login')
			}
		})
	} else if (getPathName(req.url) === '/regist') {
		console.log('进入注册')
		res.writeHead(200, {
			'Content-Type': 'text/plain;charset=utf8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept',
			'Access-Control-Allow-Methods': 'POST'
		});
		req.on('data', function(chunk) { // 监听请求数据
			data += chunk
		})
		req.on('end', function() { // 监听请求结束
			console.log(data)
			if (data) {
				var j = JSON.parse(data);

				regist(j.tel, j.pwd).then(function(obj){
					if (obj.status === 200) {
						console.log('进行插入操作')
						insert(j.tel, j.pwd).then(function(obj){
							if (obj.status === 200) {
								var body = {
									code: 0,
									message: '注册成功'
								}
								res.write(JSON.stringify(body))
								res.end()
							} else {
								res.end('regist')
							}
						})
					} else {
						var body = {
							code: 1,
							message: '该手机已存在'
						}
						res.write(JSON.stringify(body))
						res.end()
					}
				}).catch(function (err) {throw err})
			} else {
				res.end('regist')
			}
		})
	} else {
		res.end('hello')
	}
}).listen(8090);
console.log('服务开启 at http://127.0.0.1:8090')