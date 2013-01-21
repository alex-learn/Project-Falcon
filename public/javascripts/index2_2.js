var hasTouch = false;

if (("ontouchstart" in document.documentElement)) {
    document.documentElement.className += " touch";
    hasTouch = true;
}

if( !Modernizr.fontface || navigator.userAgent.match(/(Android (2.0|2.1))|(Nokia)|(Opera (Mini|Mobi))|(w(eb)?OSBrowser)|(UCWEB)|(Windows Phone)|(XBLWP)|(ZuneWP)/)) {
	document.documentElement.className += " nofontface";
}
/*
 * jQuery pretty date plug-in 1.0.0
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-prettydate/
 * 
 * Based on John Resig's prettyDate http://ejohn.org/blog/javascript-pretty-date
 *
 * Copyright (c) 2009 JÃ¶rn Zaefferer
 *
 * $Id: jquery.validate.js 6096 2009-01-12 14:12:04Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function(){jQuery.prettyDate={template:function(source,params){if(arguments.length==1)return function(){var args=jQuery.makeArray(arguments);args.unshift(source);return jQuery.prettyDate.template.apply(this,args)};if(arguments.length>2&&params.constructor!=Array){params=jQuery.makeArray(arguments).slice(1)}if(params.constructor!=Array){params=[params]}jQuery.each(params,function(i,n){source=source.replace(new RegExp("\\{"+i+"\\}","g"),"<span class='red'>"+n+"</span>")});return source},now:function(){return new Date()},format:function(time){var date=new Date(time*1000),diff=(jQuery.prettyDate.now().getTime()-date.getTime())/1000,day_diff=Math.floor(diff/86400);if(day_diff>30){return;}if(isNaN(day_diff)||day_diff<0||day_diff>=100)return;var messages=jQuery.prettyDate.messages;return day_diff==0&&(diff<60&&messages.now||diff<120&&messages.minute||diff<3600&&messages.minutes(Math.floor(diff/60))||diff<7200&&messages.hour||diff<86400&&messages.hours(Math.floor(diff/3600)))||day_diff==1&&messages.yesterday||day_diff<7&&messages.days(day_diff)||day_diff<31&&messages.weeks(Math.ceil(day_diff/7))}};jQuery.prettyDate.messages={now:"just now",minute:"<span class='red'>1</span> minute ago",minutes:jQuery.prettyDate.template("{0} minutes ago"),hour:"<span class='red'>1</span> hour ago",hours:jQuery.prettyDate.template("{0} hours ago"),yesterday:"Yesterday",days:jQuery.prettyDate.template("{0} days ago"),weeks:jQuery.prettyDate.template("{0} weeks ago")};jQuery.fn.prettyDate=function(options){prettyDateOptions=jQuery.extend({value:function(){return jQuery(this).data("timestamp")}},options);var elements=this;function format(){elements.each(function(){var date=$.prettyDate.format(prettyDateOptions.value.apply(this));if(date&&$(this).text()!=date)jQuery(this).text(date)})}format();return this}})();


/* Sprintf */
String.prototype.format=function(){var a=arguments;return this.replace(/{(\d+)}/g,function(b,c){return typeof a[c]!="undefined"?a[c]:b})}

var PF = {
    
    user: {},
	Stream: null,
	StreamView: null,
	Scrollbar: null,
	
	construct: function() {
		PF.$_stream = $('#stream');
		PF.$_streamList = $('#stream-list');
		PF.$_wrapper = $("#main");
	},
	
	
	init: function() {
	
		if(typeof POST_ID !== 'undefined') {
			PFPostPagination.init(PF.$_wrapper);
			PFSharePopup.init();
		}
		
		PFStickyNav.init(); 
		PFAuth.init();
		
		/* Attach functions to events
		--------------------------------------------*/
		$(".date").prettyDate();
		
		// Non-mobile functions
		if(!hasTouch) {
			$(".follow-us").hover(function(event) { if(event.type == "mouseenter") { $("#follow-us-popup").show(); $("#toggle-follow-us").addClass("active"); } else { $("#follow-us-popup").hide(); $("#toggle-follow-us").removeClass("active"); }});
			$(document).one("keydown", function(event) { PF.keyPressNavigation(event); });
			$("#category-filter-wrapper").hover(function() { PF.filterDropdown($(this)); });
			PF.morePostsHomepage();
		}
		
		// Mobile functions
		if(hasTouch) {
			PF.initTouchEvents();
			PFSlidePane.fixViewportHeight();
		}
		
		PF.$_stream.on("click", ".filter-button a", function(event) { PF.refreshStream($(this), event); });
		PF.$_wrapper.on("click", ".next-article", function(event) { PF.prevNextNavigation($(this), event); });
		$(".search-button").click(function() { PF.toggleSearchBox(); });
		
		PF.$_wrapper.on("click", ".post-link", function(e) { 
			if (typeof e !== "undefined" && (e.isDefaultPrevented() || e.metaKey || e.ctrlKey)) { 
				return; // Fix for cmd+click 
			}
			var permalink = (typeof CATEGORY !== "undefined") ? $(this).prop("href")+"?fromcat="+CATEGORY : $(this).prop("href")+"?fromcat=all"; 
			location.href = permalink;
			e.preventDefault();
		});
	
		$("#toggle-stream").click(function() {
			PF.$_stream.off("hover");
			if(PF.Stream.length == 0) {
				PFApp.fetchStream({});
			}
			PFSlidePane.toggle();
		});
		
		$("#toggle-search").toggle(function() { $("#search-form").slideDown(); },function() { $("#search-form").slideUp(); });
		$("#toggle-blog-menu").toggle(function() { $(".blog-menu").slideDown(); }, function() { $(".blog-menu").slideUp(); });
		$("#toggle-follow-us").toggle(function() { $("#follow-us-popup").show(); $("#toggle-follow-us").addClass("active"); }, function() { $("#follow-us-popup").hide(); $("#toggle-follow-us").removeClass("active"); })
	},

	
	initTouchEvents: function() {
		PF.$_stream.on('touchstart touchend', ".stream-item", function() { $(this).toggleClass("active"); });
		$("#current-cat, #current-tag").click(function(e) {
			e.preventDefault();
			 
			var dropdown = $(this).next(".filter-dropdown"); 
			var isDropdownVisible = dropdown.is(":visible");
			$(".filter-dropdown").hide();
			if(isDropdownVisible) { dropdown.hide(); } else { dropdown.show(); }
		});
		$("#category-filter").toggle(function() { $('#category-filter-dropdown').slideDown(); }, function() { $('#category-filter-dropdown').slideUp(); });
		$("#fmpub_8120").hide();
		
	},
	
	
	linkRewrites: function(el, event) {
		link = el.attr("href");
		if(link.indexOf("http") === 0 && link.indexOf(window.location.hostname) === -1) {
			event.preventDefault();
			var a = link.split("/");
			if(a[2] == "itunes.apple.com") {
				if(typeof a[6] == "undefined") { a[6] = a[5]; }
				var id = a[6].replace("id","").replace(/\?.*/,""); 
				if(a[4]=="book") { id="b"+id; }
				window.open("http://getap.ps/+"+id+"/!PF");
			} else {
			 	window.open(link);
			}
		}
	},


	toggleSearchBox: function() {
		var $_searchForm = $("#search-form");
		var $_searchInput = $(".search-input");
		var $_searchButton = $(".search-button");
		if($_searchInput.width() > 10) {
			$_searchForm.animate({width: $_searchButton.width()+"px"});
			$_searchInput.animate({width: "0px"}, function() { });
		} else { 
			$_searchForm.animate({width: (parseInt($_searchButton.width())+155)+"px"});
			$_searchInput.animate({width: "155px"}, function() { $_searchForm.toggleClass("visible"); this.focus(); });
			
		}
	},

	
	morePostsHomepage: function() {
		var $_morePosts = $("#more-posts");
		if($_morePosts.length > 0) {
			var offset = ($("#footer").offset().top - $(window).height());
			$(window).scroll(function() { 
				if($(window).scrollTop() >= offset) {
					if($_morePosts.is(":hidden")) {
						setTimeout(function() { $_morePosts.fadeIn() }, 700);
					}
				}
			});
		}		
	},
	
	filterDropdown: function(el) {
		var filterDropdown = $('#category-filter-dropdown');
		filterDropdown.is(":visible") ? filterDropdown.hide() : filterDropdown.show();
	},


	refreshStream: function(el, event) {
		event.preventDefault();
		if(el.attr("id")) {
			var filter = el.attr("id").replace("-stream", "");
		}
		var filters = {};
		// Order-by filter
		if(filter == 'popular' || filter == 'latest') {
			filters.orderby = filter;
			$("#stream-switcher").find("li").removeClass("active");
			$(el).parent().addClass("active");
			
			if(typeof CATEGORY !== "undefined") {
				filters.category = CATEGORY;
			}
		}
		PFApp.fetchStream(filters);
	},


	keyPressNavigation: function(e) {
		var e = e || event,
		keycode = e.which || e.keyCode;
		var obj = e.target || e.srcElement;
		if(obj.tagName.toLowerCase() == "textarea") { return; }
		if(obj.tagName.toLowerCase() == "input") { return; }
		if(keycode == 39) {
			if(PFPostPagination.nPages > PFPostPagination.currentPage) {
				PFPostPagination.nextPage();
			} else {
				var nextId = PF.Stream.nextElement(PF.Stream.at(PF.StreamView.currentPos)).id;
				PFApp.getPostById(nextId);	
			}
		}
		if(keycode == 37) { 
			if(PFPostPagination.nPages > 1) {
				PFPostPagination.prevPage();
			} else {
				if(PF.StreamView.currentPos > 0) {
					var prevId = PF.Stream.prevElement(PF.Stream.at(PF.StreamView.currentPos)).id;
					PFApp.getPostById(prevId);
				} else {
					// Show something nice
				}
			}
		}
		setTimeout(function() { $(document).one("keydown", function(event) { PF.keyPressNavigation(event); }); }, 500);
	},
	
	
	prevNextNavigation: function(el, event) {
		if(PF.History.enabled) {
			event.preventDefault();
			PFApp.getPost(el.attr("href"), el.attr("title"));
		}
	},

};

var PFStickyNav = {
	
	$_document: [],
	$_articleWrapper: [],
	
	$_stream: [],
	streamTop: 0,
	streamFixed: false,
	
	$_articleToolbar: [],
	$_ghost: [],
	toolbarWidth: 0,
	toolbarHeight: 0,
	toolbarFixed: false,
	
	init: function() {
		this.$_stream = $("#stream");
		this.$_articleWrapper = $("#article-wrapper");
		this.$_articleToolbar = $("#article-toolbar");
		this.$_ghost = $("#ghost");
		this.$_document = $(document);
		
		this.reset();
		
		if(this.$_stream.length > 0 && this.$_stream.is(':visible')) {
			var that = this;
			this.$_document.on("scroll resize touchmove", function () {
				that.makeStickyStream();
				if($("#mq_desktop").is(":visible")) {
					that.makeStickyToolbar();
				}
			});
		}
	},
	
	reset: function() {
		
		this.toolbarWidth = this.$_articleWrapper.outerWidth();
		this.toolbarHeight = this.$_articleToolbar.outerHeight(true);
		this.streamTop = this.$_stream.offset().top;
		this.$_stream.removeClass("fixed");
		this.streamFixed = false;
		
		if(this.$_articleToolbar.length > 0) {
			this.toolbarTop = this.$_articleToolbar.offset().top;
			this.$_articleToolbar.removeClass("fixed");
			this.$_articleToolbar.css({'width': '100%'});
			this.$_ghost.css({'height': "0px"});
			this.toolbarFixed = false;
		}
		
		//this.$_document.off("scroll resize touchmove");
/*
		
		if($("#mq_desktop").is(":visible")) {
			this.makeStickyToolbar();
		}
		this.makeStickyStream();
*/
	},
	
	makeStickyStream: function() {
		var viewTop = this.$_document.scrollTop();
		
		if ((viewTop >= this.streamTop) && !this.streamFixed) {
			this.$_stream.addClass("fixed");
			this.streamFixed = true;
			PFSlidePane.fixViewportHeight();
		} else if ((viewTop < this.streamTop) && this.streamFixed) {
			this.$_stream.removeClass("fixed");
			this.streamFixed = false;
			PFSlidePane.fixViewportHeight();
		}
	},
	
	makeStickyToolbar: function() {
		var viewTop = this.$_document.scrollTop();
		
		if (this.$_articleToolbar.length > 0 && (viewTop >= this.toolbarTop) && !this.toolbarFixed) {
			this.$_articleToolbar.addClass("fixed");
			this.$_articleToolbar.css({'width': this.toolbarWidth+"px"});
			this.$_ghost.css({'height': this.toolbarHeight+"px"});
			this.toolbarFixed = true;
		} else if ((viewTop < this.toolbarTop) && this.toolbarFixed) {
			this.$_articleToolbar.removeClass("fixed");
			this.$_articleToolbar.css({'width': '100%'});
			this.$_ghost.css({'height': "0px"});
			this.toolbarFixed = false;
		}
	},
	
	
};

var PFSlidePane = {
	
	$_viewport: false,
	
	isOpen: function() {
		return PF.$_stream.hasClass("unfolded");
	},
	
	open: function() {
		PF.$_stream.addClass("unfolded"); 
		$("#content").addClass("unfolded");
		$("body").addClass("nooverflow");
		$(".blog-menu, #search-form").hide();
	},
	
	close: function() {
		PF.$_stream.removeClass("unfolded"); 
		$("#content").removeClass("unfolded");
		$("body").removeClass("nooverflow");
	},
	
	toggle: function() {
		if(PFSlidePane.isOpen()) {
			PFSlidePane.close();
		} else {
			PFSlidePane.open();
			if(!hasTouch) {
				PF.Scrollbar.tinyscrollbar_update('relative');	
			} else {
				this.fixViewportHeight();
			}
			setTimeout(function() { window.scrollTo(0, 1); }, 0);
		}		
	},
	
	fixViewportHeight: function() {
		if(PF.$_stream.hasClass("unfolded") || PF.$_stream.is(":visible")) { 
			this.$_viewport = $(".viewport");
			var windowHeight = $(window).height();
			var viewportOffset = this.$_viewport.offset().top;
			var viewportPosition = this.$_viewport.position().top;
			if (window.matchMedia !== "undefined" && window.matchMedia("(min-width: 1000px)").matches) {
				this.$_viewport.height(windowHeight - viewportPosition);
			} else {
				this.$_viewport.height(windowHeight - viewportOffset);
			}
		}
	}
};
  			
  			
var PFSharePopup = {
	
	$_button: [],
	$_popup: [],

	init: function() {
		var t;
		var autohide = true;
		this.$_button = $('#share-button');
		this.$_popup = $('#share-popup');
		
		if(!hasTouch) {
			PF.$_wrapper.on("hover", '.article-share', function(e) {
				if(e.type == "mouseenter") {
					clearTimeout(t);
					PFSharePopup.show(true);
					autohide = true;
				} else if(e.type == "mouseleave") {
					if(autohide === true) {
						t = setTimeout(function(){PFSharePopup.show(false)}, 600);
					}
				}
			});
		} else {
			PF.$_wrapper.on("click", '#share-button', function() {
				if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off') {
					$(this).attr('data-toggled','on');
					PFSharePopup.show(true);
				} else if ($(this).attr('data-toggled') == 'on') {
					$(this).attr('data-toggled','off');
					PFSharePopup.show(false);
				}	
			});
		}
		PF.$_wrapper.on("click", "#cp-link", function() {
			this.select();
		});
	},
	
	reset: function() {
		if(!hasTouch) {
			PF.$_wrapper.off("hover", '.article-share'); 
		} else {
			PF.$_wrapper.off("click", '#share-button');
		}
		PF.$_wrapper.off("click", '#cp-link');
	},
	
	show: function(show) {
		if(show) {
			this.$_button.addClass('active');
			this.$_popup.show();		
		} else {
			this.$_button.removeClass('active');
			this.$_popup.hide();		
		}
	}
};


var GATracker = {

	init: function() {
		PF.$_wrapper.on("click", ".article-share a", function(e) {
			var link = $(this).attr("href");
			if(link.indexOf("twitter.com/intent") === -1 || twttr === "undefined") {
				PFPopup.init(link, 464); 
				e.preventDefault(); 
			}
		});
	},
	
	push: function(category, action, label) {
		_gaq.push(['_trackEvent', category, action, label]);
	},
	
	reset: function() {
		PF.$_wrapper.off("click", ".article-share a");
	}
};


var PFPopup = {

    init: function(url, height) {
    	var width = 840;
		var popupName = 'popup_' + width + 'x' + height;
		
		var left = (screen.width-width)/2;
		var top = 100;
		var params = 'width=' + width + ',height=' + height + ',location=no,menubar=no,scrollbars=yes,status=no,toolbar=no,left=' + left + ',top=' + top;
		
		window[popupName] = window.open(url, popupName, params);
		if(window.focus) {
			window[popupName].focus();
		}		
		return true;
    }	
};

var PFModal = {

	init: function(modal) {
		$(".smoke").css('opacity',0).animate({
			opacity : 0.65
		},500,function(){
			$(modal).fadeIn(350);
		}).click(function(){
			PFModal.close(modal);
		});	
	},
	
	close: function(modal) {
		$(modal).fadeOut(350);
		$(".smoke").animate({
			opacity : 0
		},500,function(){
			$(modal).remove();
			$(".smoke").remove();
		});	
	}
};


var PFSlider = {
	
	init: function(gallery) {
		
		var $img = $(gallery + ' img');
		$(".dot").click(function() {
			var imgsrc = $(this).data('imgsrc');
			$img.fadeOut('fast', function () {
		        $img.attr('src', imgsrc).fadeIn('fast');
		    });
	        $(".dot").removeClass('active');
	        $(this).addClass('active');
		});

	}	
};


var PFGallery = {
	
	$_gallery: [],
	
	init: function() {
		this.$_gallery = $('.gallery');
		if(this.$_gallery.length > 0) {
			
			var that = this;
			this.$_gallery.on("click", ".thumbs a", function() {
				var index = that.$_gallery.find(".thumbs a").index(this);
				var photo = that.$_gallery.find('.photo:eq(' + index + ')');
				PFGallery.showPhoto(photo, $(this), true);
				document.location = this.href;
				return false;
			});
			
			// load the existing photo from location hash
			var hash = document.location.hash;
			if (hash) {
				hash = hash.substring(1) - 1;
				var photo = this.$_gallery.find('.photo:eq(' + hash + ')');
				var link = $('.thumbs').find('li:eq(' + hash + ') a');
				PFGallery.showPhoto(photo, link, false);		
			}
		}
	},
	
	showPhoto: function (photo, link, animate) {
		if (photo.is(':hidden')) {
			this.$_gallery.find(".thumbs a").removeClass('selected');
			if (animate) {
				this.$_gallery.find('.photo:visible').fadeOut();
				photo.fadeIn();
			} else {
				this.$_gallery.find('.photo:visible').hide();
				photo.show();
			}
			link.addClass('selected');
		}
	},
	
	reset: function() {
		if(this.$_gallery.length > 0) {
			this.$_gallery.off("click", ".thumbs a");
		}
	}
};


var PFApp = {
	
	init: function() {
		
		var cat = getParameterByName("fromcat");
		if(cat) {
			var cat_dropdown = $("#category-filter-dropdown");
			var name = cat_dropdown.find("[data-slug='" + cat + "']").text();
			if(name == '') { name = cat.charAt(0).toUpperCase() + cat.slice(1); }
			$("#category-filter").find(".label").text(name);
			CATEGORY = cat;
		}
		
		function getParameterByName(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(window.location.search);
			if(results == null) {
				return "";
			} else {
				return decodeURIComponent(results[1].replace(/\+/g, " "));
			}
		}
        
		// Create stream and fetch the post list				
		PF.Stream = new StreamList;
		var filters = {};

		if(cat) {
			filters.category = cat;
		} else if(typeof CATEGORY !== "undefined") {
			filters.category = CATEGORY;
		}
		
		PFApp.fetchStream(filters);
		
		$(window).bind('orientationchange', function() {
			if(window.orientation && (window.orientation == '90' || window.orientation == '-90') && PF.Stream.length == 0) {
				PFApp.fetchStream(filters);
			}
			PFSlidePane.close();
			PFSlidePane.fixViewportHeight();
			PFStickyNav.init();
		});
	},
	
	fetchStream: function(filters) {
		var img = $("<img />").attr("src", THEME_URL+"assets/images/PF-loading-grey.gif").addClass("center");
		PF.$_streamList.html(img);
		// Reset list
		PF.Stream = new StreamList;
		PF.Stream.fetch({ data: $.param(filters), processData: true, success: function(data, response) {
			PF.StreamView = new StreamView({ el: PF.$_streamList, collection: data });
			PF.StreamView.render(true);
			if(!hasTouch) {
				PF.Scrollbar = PF.$_stream.tinyscrollbar();
			}
		}});
	},
	
	updateStream: function() {
		var filters = {};
		if(typeof CATEGORY !== "undefined") {
			filters.category = CATEGORY;
		}
		filters.page = ++PF.StreamView.currentPage;
		PF.Stream.fetch({ data: $.param(filters), processData: true, add: true, success: function() {
			if(!hasTouch) {
				PF.Scrollbar.tinyscrollbar_update('relative');
			}
		}});
	},
	
	getPost: function(href, title, event) {
		var post = PF.Stream.where({ permalink: href });
		if(post.length == 0) {
			var p = new Post({ permalink: href, title: title });
			p.triggerGetPost();
		} else {
			post[0].triggerGetPost();
		}		
	},
	
	getPostById: function(postId) {
		if(postId !== null) {
			var post = PF.Stream.get(postId);
			if(typeof post !== "undefined") {
				post.triggerGetPost();
			}
		}
	}
};

	   
// The magic starts here 
$(document).ready(function() {
	PF.History = window.History;
	PF.construct();
	PFApp.init();
	PF.init();	
}); 


// Functions that can be delayed after the whole page has been downloaded
$(window).load(function() {

	GATracker.init();

	if(window.devicePixelRatio > 1) {
		PFRetina.init();
	}
	
	if(!hasTouch) {
		$(window).on("resize", function() {
			//PFStickyNav.reset();
			if(typeof PF.Scrollbar !== "undefined") {
				PF.Scrollbar.tinyscrollbar_update();
			}
		});
	}
	
	PF.$_wrapper.on("click", ".article-body a", function(event) { PF.linkRewrites($(this), event); });

});