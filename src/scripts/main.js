//配置
var config = {
	apiBase: 'https://api.github.com/repos/',
	userGithub: 'https://github.com/crazyworm-tangyuan',
	userName: 'crazyworm-tangyuan',
	repoName: 'tangyuan',
	token: '33e0a15eb6513e8c6be4f023158bca85bd31c191',
	per_page: 5
};

//函数封装
var request = function(url, params, callback, errorCallback) {
	url = config.apiBase + config.userName + '/' +　config.repoName + url;
	params.access_token = config.token;

	$.ajax({
		url: url,
		method: 'GET',
		data: params,
		success: function(response, status, xhr) {
			callback ? callback(response, xhr.getResponseHeader('Link')) : console.log(response);
		},
		error: function(error) {
			errorCallback ? errorCallback(error) : console.log(error);
		}
	});
};

//模板封装
var templates = {
	user: function(data) {
		var _template = '' +
			'<a href="' + config.userGithub + '" class="demo-icon icon-github" target="_blank"></a>'+
            '<a href="#" class="demo-icon icon-link" target="_blank"></a>'+
            '<a href="#" class="demo-icon icon-email" target="_blank"></a>';

        return _template;
	},
	issue: function(data) {
		var _template = '';

		data.forEach(function(item) {
			_template += ('<a href="#' + item.number + '" class="oneArt">' + 
		        '<h1>' + item.title + '</h1>' + 
		  		'<p>Updated at<span>' + item.updated_at.slice(0, 10) + '</span></p>' + 
		    '</a>');
		});

		return _template;
	},
	article: function(data) {
		var _template = '' + 
			'<h1 class="artTitle">' + data.title + '</h1>' +
			'<time>Updated at <span>' + data.updated_at.slice(0, 10) + '</span></time>' +
		    '<div class="markBlock">' +
        		'<mark>#' + data.labels[0].name + '</mark>' +
	        '</div>' +
		    '<article class="wholeArt">' + marked(data.body) + '</article>';

		return _template;
	},
	comments: function(data) {
		var _template = '' ;

		data.forEach(function(item) {
			_template += ('<li class="oneComment">'+
	            '<a class="commenterPic" target="_blank" href="' + item.user.html_url + '" style="background: url(' + item.user.avatar_url + '); background-size: 100%"></a>'+
	            '<p class="commenterName">' + item.user.login + '</p>'+
	            '<time class="commentedTime">commented on<span>' + item.created_at.slice(0, 10) + '</span></time>'+
	            '<p class="commentContent">' + item.body + '</p>'+
	        '</li>');
		});

		return _template;	
	}
};

$(function() {
	var	$viewComment = $('.viewComment'),
		$containAll = $('.containAll'),
		$article = $('#article-detail'),
		$container = $('#container'),
		$backHome = $('.backHome'),
	 	$loadMore = $('.loadMore'),
		$artList = $('.artList'),
		$loading = $('.loading'),
		$comment = $('.comment'),
		$lineTag = $('.lineTag'),
		articleComments = 1,
		issues_cache = [],
		pageNum = 1,
		mode = '';

	/**
	 * 博客列表页
	 */

	// 程序初始化
	init();
	function init(){
		$container.hide();		
		$loading.show();

		if(location.hash) {
			var id = location.hash.split('#')[1];

			mode = 'article';

			function callback(data) {
				generateArticle(data);
				$container.show();		
				$loading.hide();
			}

			request('/issues/' + id, {}, callback);
		} else {
			mode = 'list';

			generateList();
		}
	}
			
	// 加载更多
	$loadMore.click(function() {
		pageNum++;
		$loadMore.text('loading...');
		generateList();
	});

	// 渲染 issues 列表
	function generateList() {
		var params = {
			page: pageNum,
			per_page: config.per_page
		};

		function callback(data, link) {
			var _template = templates.issue(data);
			var _template1 = templates.user();
			issues_cache = issues_cache.concat(data);
			$artList.append(_template);
			if (pageNum == 1) {
				$lineTag.append(_template1);
			}else{}

			$container.show();
			$loading.hide();

			if(link && link.indexOf('rel="next"') > -1) {
				$loadMore.text('LoadMore');
			} else {
				$loadMore.hide();
			}
		}
	
		request('/issues', params, callback);
	}

	/**
	 * 博客详情页
	 */
	$(window).on('hashchange', function() {
		$('html, body').animate({scrollTop: 0}, 0);

		var id = location.hash.split('#')[1];

		articleComments = id;

		for(var i = 0; i < issues_cache.length; i++) {
			if(parseInt(issues_cache[i].number) === parseInt(id)) {
				generateArticle(issues_cache[i]);
			}
		}
	});

	// 渲染文章
	function generateArticle(data) {
		var _template = templates.article(data);
		$article.html(_template);
		$containAll.addClass('right');
		$containAll.addClass('transition');
	}

	// 返回按钮
	$backHome.click(function() {
		if(mode === 'article') {
			location.href = '/';
			return;
		} else {
			history.back();
		}

		$containAll.removeClass('right');
		$containAll.removeClass('transition');
		$containAll.css({'transition':'0.35s', 'transition-timing-function':'cubic-bezier(.895,.030,.685,.22)'});
		$comment.css({'display':'none'});
		$viewComment.removeClass('hideCommentBtn');
		$viewComment.text('view comment');
		$comment.empty();
	})

	// 查看评论
	$viewComment.click(function(){
		$comment.css({'display':'block'});
		$viewComment.text('loading...');

		function callback(data) {
			oneComment = $('.oneComment');
			if (oneComment.length === data.length) {
				$viewComment.text('All comments');
				$viewComment.addClass('hideCommentBtn');
				if (data.length === 0) {
					alert("没有评论!!!");
				}
				return;
			}
			var _template = templates.comments(data);
			$comment.html(_template);
			oneComment = $('.oneComment');
			$viewComment.addClass('hideCommentBtn');
		}

		request('/issues/'+ articleComments +'/comments', {}, callback);
	})
});