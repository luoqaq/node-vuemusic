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

function insertUser (tel, pwd) {
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

function selectUser (tel) {
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

function selectSongInfo (song_id) {
	return new Promise(function(resolve, reject){
		var sql = `select * from songInfo  where song_id=${song_id};`;
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length > 0) {
				resolve({status: 1})
			} else {
				resolve({status: 0})
			}
		})
	})
}

// 判断这条数据在likeSongs表中是否已存在
function haveLike (user_tel, song_id) {
	return new Promise(function(resolve, reject){
		var sql = `select * from likeSongs  where song_id=${song_id} and user_tel=${user_tel};`;
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length > 0) {
				resolve({status: 1})
			} else {
				resolve({status: 0})
			}
		})
	})
}

/*插入或者删除喜欢*/
function insertLike (user_tel, song_id, flag) {
	return new Promise(function(resolve, reject){
		var sql = ''
		if (parseInt(flag)) {
			haveLike(user_tel, song_id).then(function(obj){
				if (obj.status === 0) {
					sql = `insert into likeSongs (user_tel, song_id) values (${user_tel}, ${song_id});`
					connection.query(sql, function(err, results, fields){
						if(err) throw err;
						if (results) {
							resolve({status: 200})
						}
					})
				}
			})
		} else {
			sql = `delete from likeSongs where user_tel=${user_tel} and song_id=${song_id};`
			connection.query(sql, function(err, results, fields){
				if(err) throw err;
				if (results) {
					resolve({status: 200})
				}
			})
		}
	})
}

function insertSongInfo (song_id, song_mid, song_img, song_name, singer) {
	return new Promise(function(resolve, reject){
		var sql = 'insert into songInfo (song_id, song_mid, song_img, song_name, singer) values ("'+ song_id + '","' + song_mid+ '","' + song_img+ '","' + song_name+ '","' + singer+ '");';
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results) {
				resolve({status: 200})
			}
		})
	})
}

/*查看此用户是否收藏了此歌(先放弃)*/
function isLike (user_tel, song_id) {
	return new Promise(function(resolve, reject){
		var sql = `select * from likeSongs where user_tel=${user_tel} and song_id=${song_id};`
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length > 0) {
				resolve({status: 1})
			} else {
				resolve({status: 0})
			}
		})
	})
}

/* 查找到该用户收藏的歌曲id */
function selectLike (user_tel) {
	return new Promise(function(resolve, reject){
		var sql = `select song_id from likeSongs where user_tel=${user_tel};`
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length > 0) {
				var data = []
				results.forEach(function(v, i){
					data.push(v.song_id)
				})
				resolve({data: data})
			} else {
				resolve({data: []})
			}
		})
	})
}

function selectSongs (user_tel) {
	return new Promise(function(resolve, reject){
		var sql = `select * from songInfo where song_id in(select song_id from likeSongs where user_tel=${user_tel});`
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length > 0) {
				resolve({data: results})
			} else {
				resolve({data: []})
			}
		})
	})
}

module.exports = {login, regist, insertUser, selectUser, insertLike, 
	selectSongInfo, insertSongInfo, haveLike, selectLike, selectSongs}
