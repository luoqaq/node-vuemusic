/* 用于编写推荐用户的操作 */

const {updateIdol, recoByIdol, getUser_Music} = require('./conMySQL');

/* 通过音乐种类给该用户推荐相似用户 */
function byType (user_tel) {
	// body...
}

/* 通过收藏的歌手给该用户推荐相似用户 */
function bySinger (user_tel) {
	console.log('进入bySinger')
	return new Promise(function(resolve, reject){
		updateIdol(user_tel).then(function(data){
			if (data.code === 0) {
				recoByIdol(user_tel).then(function(data){
					resolve(data)
				})
			} else if (data.code === 2) {
					 	resolve({
							code: 2,
						    message: '用户收藏不够'
						})
				}
		})
	})
}

/* 通过收藏的歌曲给该用户推荐相似用户 */
function byMusic (user_tel) {
	return new Promise(function (resolve, reject) {
		maxtrixByMusic().then(function(data){
			var data = data.maxtrix
			if (data) {
				if (data[user_tel].similarCount === 0) {
					resolve({
						code: 1,
						message: '无匹配项'
					})
				} else {
					resolve({
						code: 0,
						similar: data[user_tel].similar,
						similarCount: data[user_tel].similarCount
					})
				}
			} else {
				resolve({
					code: 1,
					message: '只有一个用户，无匹配项'
				})
			}
		})
	})
}

/* 根据用户——音乐的关系对象，用余弦相似度的基于用户的协同过滤算法，算出矩阵 */
function maxtrixByMusic () {
	return new Promise(function(resolve, reject){
		getUser_Music().then(function(data){
			if (Object.keys(data).length <= 1) {
				resolve({maxtrix: []})
			} else {
				let arr = {}
				for (var i in data) {
					console.log()
					let item = {}
					let sim = 0 //保存与用户i最相似的相似度
					let simIndex = -1 //保存于用户i最相似的用户下标
					let similarCount = 0 //保存与用户i最相似的用户的共同歌曲数
					for (var j in data) {
						if (i === j) {
							item[j] = 1
						} else {
							let r = Math.sqrt(data[i].length * data[j].length)
							item[j] = (getAandB(data[i],data[j]) / r).toFixed(4)
							if (sim < item[j]) {
								sim = item[j]
								simIndex = j
								similarCount = getAandB(data[i],data[j])
							}
						}
					}
					arr[i] = item
					arr[i]['similar'] = simIndex
					arr[i]['similarCount'] = similarCount
				}
				resolve({maxtrix: arr})
			}
		})
	})
}

/* 判断两个数组数据相交的个数 */
function getAandB (a, b) {
	var count = 0;
	for (var i = 0; i<a.length; i++) {
		if(b.indexOf(a[i]) != -1) count++
	}
    return count
}

module.exports = {byMusic, bySinger, byType}