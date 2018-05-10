var mysql = require ('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'vueMusic'
});

function login (tel, pwd) {

	console.log('进入登录!!')
    console.log('tel为：' + tel)
	var promise = new Promise(function(resolve, reject) {
		var sql = "select user_pwd from user where user_tel = " + tel;

		connection.query(sql, function(err, results, fields) {
			if (err) {
				console.log('登录出错')
				throw err;
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


/* 根据用户收藏的歌曲，更新他的idol表 */
function updateIdol (user_tel) {
	console.log('进入updateIdol')
	return new Promise(function(resolve, reject){
		var sql = 'select singer,count(singer) as count from songInfo where song_id in (select song_id from likeSongs where user_tel='+ user_tel +') group by singer'
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length > 0) {
				resolve({data: results})
			} else {
				resolve({data: []})
			}
		})
	}).then(function(data){
		data = data.data
		if (data.length > 0) {
			var obj = {}
			singer = ''
			singerCount = 2
			data.forEach(function(v,i){
				if (v.count > singerCount) {
					singerCount = v.count
					singer = v.singer
				}
			})
			if (singer) {
				console.log('插入idol')
				return new Promise(function(resolve, reject){
					var sql = `insert into idol (user_tel, singer, song_count) values("${user_tel}","${singer}","${singerCount}") on duplicate key update singer=values(singer),song_count=values(song_count)`
					console.log(sql)
					connection.query(sql, function(err, results, fields){
					if (err) throw err;
					var obj = {
						code: 0,
						message: '更新idol表成功'
						}
					resolve(obj)
					})
				})
			} else {
				return new Promise(function(resolve,reject) {
					resolve({
							code: 2,
							message: '用户收藏不够'
						})
				})
			}
		} else {
			return new Promise(function(resolve, reject){
				var obj = {
					code: 1,
					message: '此用户没有收藏音乐'
				}
				resolve({result: obj})
			})
		}
	})
}

/* 根据用户的最爱歌手，推荐好友 */
function recoByIdol (user_tel) {
	return new Promise(function(resolve, reject){
		var sql = `select * from idol where singer = (select singer from idol where user_tel = ${user_tel}) order by song_count desc`
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length>1){
				let i = 0
				if (results[0].user_tel === user_tel){
					i++;
				}
				resolve({
					code: 0,
					data: results[i]
				})
			} else if (results.length === 1){
				resolve({
						code: 1,
						singer: results[0],
						message: '未查到同歌手爱好的用户'
					})
			}
		})
	})
}

/* 获取用户-音乐的JSON对象 */
function getUser_Music () {
	return new Promise(function(resolve, reject){
		var sql = 'select user_tel,song_id from likeSongs'
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results && results.length>0){
				var obj = {}
				results.forEach(function(v, i){
					if (!obj[v.user_tel]){
						obj[v.user_tel] = []
						obj[v.user_tel].push(v.song_id)
					} else {
						obj[v.user_tel].push(v.song_id)
					}
				})
				resolve(obj)
			}
		})
	})
}

/* 查看用户的关注 */
function getFocus (user_tel) {
	return new Promise(function(resolve, reject){
		var sql = 'select focus_user from focus where user_tel=' + user_tel
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			if (results) resolve({data: results})
		})
	})
}

/* 改变用户的关注表，插入数据 */
function insertFocus (user_tel, focus_user, flag) {
	console.log('进入insertFocus操作')
	return new Promise(function(resolve, reject){
		if (parseInt(flag) === 1) {
			var sql = 'insert into focus (user_tel, focus_user) values (' + user_tel +',' + focus_user+ ')';
		} else {
			var sql = 'delete from focus where user_tel=' + user_tel +' and focus_user=' + focus_user;
		}
		console.log(sql)
		connection.query(sql, function(err, results, fields){
			if (err) throw err;
			console.log(results)
			if (results) resolve({code: '0', message: '插入/删除成功'})
		})
	})
}

module.exports = {login, regist, insertUser, selectUser, insertLike, 
	selectSongInfo, insertSongInfo, haveLike, selectLike, selectSongs,
    updateIdol, recoByIdol, getUser_Music, insertFocus, getFocus}
