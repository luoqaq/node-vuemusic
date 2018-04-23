var mysql = require ('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'vuemusic'
});

function login (tel, pwd) {

	console.log('进入登录!!')
    console.log('tel为：' + tel)
	var promise = new Promise(function(resolve, reject) {
		var sql = "select user_pwd from user where user_tel = " + tel;

		connection.query(sql, function(err, results, fields) {
			if (err) {
				console.log('登录出错')
				reject(err)
			}
			if (results && results.length > 0 && results[0].user_pwd === pwd) {
				console.log('登录成功')
				resolve({status: 200})
			} else {
				console.log('登录失败')
				resolve({status: 400})
			}
		})
	})

	return promise
}

function insert (tel, pwd) {
	console.log('进入插入')
	var promise = new Promise(function(resolve, reject){
		var sql = `insert into user (user_tel, user_pwd) values (${tel}, ${pwd})`;

		connection.query(sql, function(error, results, fields) {
			if (error) {
				throw error
			}
			resolve({status: 200})
		})
	})
	return promise
}

function regist (tel, pwd) {

	var promise = new Promise(function(resolve, reject){

		var sql = `select * from user where user_tel = ${tel}`;

		connection.query(sql, function(error, results, fields) {
			if (error) {
				throw error;
			}
			console.log(results)
			if (results && results.length > 0) {
				console.log('已存在')
				resolve({status: 400})
			} else {
				console.log('不存在')
				resolve({status: 200})
			}
		})
	})

	return promise
}

function select (tel) {
	console.log('进入select')
	return new Promise(function(resolve, reject){
		var sql = `select user_img,user_name from user where user_tel=${tel};`;
		
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			console.log(results)
			resolve({data: results})
		})
	})
}

module.exports = {login, regist, insert, select}
