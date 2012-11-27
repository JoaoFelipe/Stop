(function (){
	var address = 'http://127.0.0.1:8080';
	var socket;
	var big_screen = null;

	function high_rsolution() {
		return  ($(window).width()>= 768);
	};

	function low_resolution() {
		return  ($(window).width()<= 480);
	};

	function initialize_hr() {
		$('.paper').css("min-height", "0");
		$('.paper').css("top", "10%");
		$('.paper1').css("left", "15%");
		$('.paper2').css("left", "31.5%");
		$('.paper3').css("left", "48%");

		$('.paper3').transition({ rotate: '20deg' });
		$('.paper1').transition({ rotate: '-20deg' });
		$('body').css("overflow-x", "hidden");	
		$(".tooltips").show();
	};

	function deinitialize_hr() {
		$('.paper1').css("top", "90px");
		$('.paper2').css("top", "190px");
		$('.paper3').css("top", "140px");
		$('.paper3').transition({ rotate: '0deg' });
		$('.paper1').transition({ rotate: '0deg' });
		$('body').css("overflow-x", "auto");	
		$(".tooltips").hide();
	};

	function move_paper(paper1, paper2, paper3, rotate, left1, left2, left3, low_move_paper) {
		return function() {
			var p1 = $(this).parent().find("." + paper1),
				p2 = $(this).parent().find("." + paper2),
				p3 = $(this),
				p2left = p2.position().left,
				p3left = $(this).position().left;  
			if (high_rsolution()) {
				
				p2.transition({ 
					rotate: rotate,
					left: left1
				});
				p3.transition({ 
					rotate: '0deg',
					left: left2
				}, function() {
					p1.css('z-index', 0);
					p2.css('z-index', 1);
					p3.css('z-index', 2);
					p3.transition({ 
						left: left3
					});
					p2.removeClass(paper2 + " active");
					p2.addClass(paper3);
					p3.removeClass(paper3);
					p3.addClass(paper2 + " active");
				});	
			} else {
				low_move_paper(paper1, paper2, paper3, p1, p2, p3);
			}
		};
	};

	function low_move_paper1(paper1, paper2, paper3, p1, p2, p3) {
		var p3top = p3.position().top,
			p2top = p2.position().top,
			p1top = p1.position().top,
			p2left = p2.position().left;
		p1.transition({
			top: p3top
		});
		p2.transition({
			top: p1top
		});
		p3.transition({ 
			left: "-200%"
		}, function() {
			p1.css('z-index', 0);
			p2.css('z-index', 1);
			p3.css('z-index', 2);
			p3.transition({ 
				left: p2left,
				top: p2top
			});
			p2.removeClass(paper2 + " active");
			p2.addClass(paper1);
			p1.removeClass(paper1);
			p1.addClass(paper3);
			p3.removeClass(paper3);
			p3.addClass(paper2 + " active");
		});
		
	}

	function low_move_paper3(paper1, paper2, paper3, p1, p2, p3) {
		var p3top = p3.position().top,
			p2top = p2.position().top,
			p2left = p2.position().left;
		p2.transition({
			top: p3top
		});
		p3.transition({ 
			left: "-200%"
		}, function() {
			p1.css('z-index', 0);
			p2.css('z-index', 1);
			p3.css('z-index', 2);
			p3.transition({ 
				left: p2left,
				top: p2top
			});
			p2.removeClass(paper2 + " active");
			p2.addClass(paper3);
			p3.removeClass(paper3);
			p3.addClass(paper2 + " active");
		});
		
	}

	function resize() {
		var width = $(window).width(),
			height = $(window).height(),
			half = width / 2,
			container = $('.container'), 
			top;
		if (high_rsolution()) {
			$(".tooltips").hide();
			$(".tooltips").css('left', ($(document).width() - 200) + 'px');
			$(".tooltips").show();
			if (big_screen != true) {
				initialize_hr();
				big_screen = true;
				$('.paper').css("width", '32%');
			}
			$('.paper').each(function() {
				var obj = $(this),
					width = obj.width();
				obj.height(width * 1.3);
				
			});
			

		} else {
			if (big_screen != false) {
				deinitialize_hr();
				big_screen = false;
			}
			$('.paper').css("height", "auto");
			$('.paper').css("min-height", "0");
			$('.content').height($(document).height());
			$('.content').css('height', 'auto');
			$('.paper3').css('z-index', 1);
			$('.paper1').css('z-index', 0);
			$('.paper2').css('z-index', 2);
			if (low_resolution()) {
				$('.paper').css("left", "10px");
				var h = $(document).height() - 220,
					w = width - 70;
				$('.paper').css("min-height", h +"px");
				$('.paper').css("width", w +"px");
			} else {
				$('.paper').css("left", "30px");
				var h = $(document).height() - 240,
					w = width - 110;
				$('.paper').css("min-height", h +"px");
				$('.paper').css("width", w +"px");
			}
			
		}

		var update_input = function() {
			var input = $(this),
				parent = input.parent();
			input.width(parent.width() - 30);
		};
		$('.paper_form input[type="text"]').each(update_input);
		$('.paper_form input[type="password"]').each(update_input);	
	};

	

	$(document).ready(function() {
		socket = io.connect(address);
		$(window).resize(resize);
		resize();
		$('.paper').hover(function() {
			if (high_rsolution()) {
				var tooltip = $(".tooltips");
				tooltip.html($(this).find("h1").html());
			}
		}, function() {
			var tooltip = $(".tooltips");
			tooltip.html("<br>");	
		});	
		$(".paper3").live('click', move_paper("paper1", "paper2", "paper3", "20deg", "48%", "100%", "31.5%", low_move_paper3));
		$(".paper1").live('click', move_paper("paper3", "paper2", "paper1", "-20deg", "15%", "-40%", "31.5%", low_move_paper1));
		resize();
	});


})();
