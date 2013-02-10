(function($){

	$.fn.slideshow = function( options ){

		var defaults = {
			autoplay : true,
			ratio : 1.6,
			delay : 2000,
			speed : 500,
			drag : true,
			autoResize : false
		};

		var opts = $.extend( defaults , options );

		return this.each(function(){

			var $this = $(this),
				width = $this.width(),
				height = width / opts.ratio,
				ratio =  opts.ratio,
				$container = $("<div class='slideshow-images-container' ></div>"),
				$inner = $this.find(".slideshow-inner"),
				$nav = $("<ul></ul>").appendTo(".slideshow-bullets",$this),
				$images = null,
				$bullets = null,
				$slides = null,
				total = 0,
				$items = null,
				currentIndex = 0,
				timeout = null,
				playing = false,
				resizeTimeout = null;

			$inner.width( width ).height( height );

			$(window).resize(function(){


				clearTimeout( resizeTimeout );

				if( playing ){

					resizeTimeout = setTimeout( function(){ $(window).trigger("resize"); } , 100 ); 

				}
				else {

					stopAutoPlay();

					width = $this.width(),
					height = width / ratio;

					$inner.width( width ).height( height );

					$images.each(function(i){

						var $img = $(this),
						imgWidth = Number($img.attr("width")),
						imgHeight = Number($img.attr("height")),
						imgRatio = imgWidth /  imgHeight,
						newWidth,newHeight,newTop,newLeft;


						if( imgRatio > ratio ){

							newHeight = height;
							newWidth = newHeight * imgRatio;
							newTop = 0;
							newLeft = - ( newWidth - width ) / 2;
						}
						else {

							newWidth = width;
							newHeight = newWidth / imgRatio;
							newLeft = 0;
							newTop = - ( newHeight - height ) / 2;
						}

						$img.css({
							"width" : newWidth,
							"height" : newHeight,
							"top"	: newTop,
							"left"	: newLeft
						}).parent().css("left",( i * 100 ) + "%");

					});

					$container.css({
						left : - ( currentIndex + total ) * width
					});

					startAutoPlay();
				}
			})

			$this.find(".slideshow-images > img").each(function(i){

				var $img = $(this);

				$img.wrap("<div class='slideshow-image' ></div>").parent().appendTo( $container );

				var $nav_item = $("<li>"+( i+ 1 )+"</li>");

				if( i == 0 ){
					$nav_item.addClass("active");
				}

				$nav.append( $nav_item );

				total++;

			});

			$bullets = $nav.children();

			$container.appendTo(".slideshow-images",$this);

			var $clones = $container.children().clone();

			$container.append( $clones.clone() ).append( $clones.clone() ).append( $clones.first().clone() );

			$items = $container.children();

			$container.css({
				left : - total * width
			})

			$container.find("img").bind("mousedown",function(){
				return false;
			});

			if( opts.drag ){

				$container.css("cursor","pointer");
				var $dragContainer = $("<div class='slideshow-drag' ></div>").appendTo( $inner );

			}

			$images = $container.find("img");

			var go = function( index , direction ){

				if( playing ) return false;

				var startLeft,
					endLeft,
					offset = $container.position().left;

				if( direction == 0 ){
					return false;
				}
				// forward
				else if( direction > 0 ){
					endLeft = Math.ceil( ( offset - width ) / width ) * width ;

				}
				// backward
				else if( direction < 0 ){
					endLeft =  Math.floor( ( offset + width ) / width ) * width ;
				}

				playing = true;


				$container.animate({ "left" : endLeft }, opts.speed,"linear",function(){

					currentIndex = index;

					$container.css({
						left : - ( index + total ) * width
					})

					setNav();

					playing = false;

					startAutoPlay();

				});

			};

			var prev = function(){

				var index = currentIndex - 1;

				if( 0 > index ){

					index = total - 1;
				}

				go( index , -1 );
			};

			var next = function(){

				var index = currentIndex + 1;

				if( total <= index ){

					index = 0;
				}

				go( index , 1 );
			};

			var startAutoPlay = function(){
				if( opts.autoplay ){
					stopAutoPlay();
					timeout = setTimeout( function(){ next();  },opts.delay );
				}
			};

			var stopAutoPlay = function(){

				clearTimeout( timeout );
			}


			var startDrag = function(){

				if( opts.drag ){

					var startLeft,
						containerLeft,
						dragged = false;

					$dragContainer.bind("touchstart",function(e){

						if( playing ) return;

						stopAutoPlay();

						startLeft = e.originalEvent.touches? e.originalEvent.touches[0].pageX : e.pageX,

						containerLeft = $container.position().left;

						dragged = true;

						$("body").bind("touchmove.slideshow",function(e){

							e.preventDefault();

							var left = e.originalEvent.touches? e.originalEvent.touches[0].pageX : e.pageX,
								difference = startLeft - left;

							if( difference > 0 && difference > width / 4 ){

								dragged = false;

								$("body").trigger("touchend.slideshow");

								next();

							}
							else if( difference < 0 && Math.abs( difference ) > width / 4 ){

								dragged = false;

								$("body").trigger("touchend.slideshow");

								prev();

							}
							else {

								$container.css( "left", containerLeft - difference );
							}

							return false;

						});

					});

					$("body").bind("touchend.slideshow",function(){
						
						$("body").unbind("touchmove.slideshow");

						if( dragged ){

							playing = true;

							$container.animate({left : containerLeft},opts.speed/2,"linear",function(){

								playing = false;

							});

							startAutoPlay();
						}

						startLeft = null;

						dragged = false;

					});
				}
			}


			$(window).trigger("resize");

			var setNav = function(){

				$bullets.removeClass("active").eq( currentIndex ).addClass("active");
			};

			startAutoPlay();

			startDrag();
		});

	}

})(jQuery);