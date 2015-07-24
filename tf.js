/*
 *
 * Copyright (c) 2015 Michael Gohl (http://www.gohl.tk)
 * Licensed under GPL (http://www.opensource.org/licenses/gpl-license.php)
 *
 * Version 0.3
 *
 */

$(function(factory)
{
	var targets = $('.tf-parent'),
		auto_rotate = new Array(),
		interval = new Array(),
		max_per_page = 10,
		responsive_size = 840,
		reduce_after_search = 0,
		reduce_speed = 30;
	
	var get_max_per_page = function(parent)
	{		
		if ($(window).width() <= responsive_size && parent.children('.tf-pagination').attr('data-responsive') !== undefined)
		{
			return parseInt(parent.children('.tf-pagination').attr('data-responsive'));
		}
		else if (parent.children('.tf-pagination').attr('data-pagination') !== undefined)
		{
			return parseInt(parent.children('.tf-pagination').attr('data-pagination'));	
		}
		else
		{
			return max_per_page;	
		}
	}
	
	var switch_page = function (parent, page, auto)
	{		
		var count = parent.children('.tf-item').length;	
		
		if (auto == true)
		{
			parent.children('.tf-pagination').children('.tf-pagination-switch').removeClass('tf-pagination-current');
			parent.children('.tf-pagination').children('.tf-pagination-switch[data-page='+page+']').addClass('tf-pagination-current');	
		}
		
		var per_page = get_max_per_page(parent);
		
		parent.find('.tf-pagination-close').hide();
		
		parent.css("min-height",parent.height()+"px");
		
		page = parseInt(page);
				
		parent.children('.tf-item').hide();		
		
		for (i = page*per_page; i < ((page*per_page)+per_page); i++)
		{
			parent.children('.tf-item').eq(i).show();
		}
		
		clearInterval(interval[parent]);
		
		interval[parent] = setInterval(function()
		{
			var current = parent.height();
			
			if (current < parent.children('.tf-item').height())
			{	
				clearInterval(interval[parent]);			
				return;	
			}
			else
			{
				var height = parseInt(parent.css("min-height"));	
				parent.css("min-height", (height-reduce_speed)+"px");
			}
			
		}, 20);
		
		if (parent.children('.tf-pagination').attr('data-autorotate') !== undefined)
		{			
			var next_page = 0;
			if (count > page+1)
				next_page = page+1;
							
			auto_rotate(parent.children('.tf-pagination'), parent, next_page);
		}
	}
	
	var build = function (target, request)
	{
		target.each(function()
		{
			var current_pagination = $(this).find('.tf-pagination');
			if (current_pagination !== undefined) 
			{
				current_pagination.html('');
				
				var parent = current_pagination.parent();				
				var count = $(this).find('.tf-item').length;				
				var per_page = get_max_per_page(parent);
				
				if (count > per_page)
				{
					var pages = Math.round((count / per_page)+0.49);
					
					current_pagination.append('<li class="tf-pagination-switch-move" data-direction="-1">&lt;</li>');
					
					for (i = 0; i < pages; i++)
					{
						var current = (i == 0)?" tf-pagination-current":"";
						
						current_pagination.append('<li class="tf-pagination-switch'+current+'" data-page="'+i+'">'+(i+1)+'</li>');
					}
									
					current_pagination.append('<li class="tf-pagination-switch-move" data-direction="+1">&gt;</li>');
					
					parent.children('.tf-item').show();
					
					for (i = per_page; i < count; i++)
					{
						parent.children('.tf-item').eq(i).hide();
					}
					
					parent.find('.tf-pagination-switch').on('click', function()
					{					
						switch_page(parent, $(this).attr('data-page'));
						current_pagination.children('li').removeClass("tf-pagination-current");
						$(this).addClass("tf-pagination-current");
						return false;
					});
					
					parent.find('.tf-pagination-switch-move').on('click', function()
					{
						var d = parseInt($(this).attr('data-direction'));
						var c = parseInt($(this).parent().children('.tf-pagination-current').attr('data-page'));
						var m = Math.max.apply(Math, $(this).parent().children('.tf-pagination-switch').map(function()
						{
							return parseInt($(this).attr('data-page'));
						}).get());
						

						if (c + d < 0) 	d = m;	
						else if (c + d > m)	d = 0;	
						else d = c + d;	
						
						switch_page($(this).parent().parent(), d, true);						
					});
					
					current_pagination.show();
					
					if (current_pagination.attr('data-autorotate') !== undefined)
					{
						auto_rotate(current_pagination, parent, 1);
					}
				}
				else
				{
					current_pagination.hide();	
				}
				
				if (request === undefined || reduce_after_search == 1)	
					reduce($(this), request);	
					
				mark_rows($(this));
			}
		});	
	}
	
	var auto_rotate = function (current_pagination, parent, page)
	{
		clearTimeout(auto_rotate[current_pagination]);
		
		auto_rotate[current_pagination] = setTimeout(function()
		{
			switch_page(parent, page, true);	
		}, current_pagination.attr('data-autorotate')*1000);
	}
	
	var search = function(parent, request)
	{		
		parent.find('.tf-item, .tf-hidden-item').removeClass('tf-hidden-by-filter'); // Reset
		
		parent.find('.tf-filter').each(function()
		{
			var option = $(this).attr('rel');
			var value = $(this).val();
			var count = 0;
			
			parent.find('.tf-item, .tf-hidden-item').each(function()
			{	
				if ($(this).attr(option).split(" ").indexOf(value) < 0 && value != "-1")
				{
					$(this).removeClass('tf-item');
					$(this).addClass('tf-hidden-item');
					$(this).addClass('tf-hidden-by-filter');
					$(this).hide();
				}
				else if (!$(this).hasClass('tf-hidden-by-filter'))
				{
					$(this).removeClass('tf-hidden-item');
					$(this).addClass('tf-item');			
					$(this).show();
				}
			});
		});
		
		parent.find('.tf-search').each(function()
		{
			var filter = $(this).val();
			
			if (filter.length > 0)
			{
				parent.find('.tf-item').each(function()
				{
					var foundCount = 0;
				
					$(this).find('.tf-sf').each(function(index, element) {
						if ($(element).text().search(new RegExp(filter, "i")) >= 0)
						{
							foundCount++;	
						}
					});
					
					if (foundCount == 0)
					{
						$(this).removeClass('tf-item');
						$(this).addClass('tf-hidden-item');
						$(this).hide();		
					}					
				});
			}
		});
						
		if (parent.find('.tf-item').length >= 1)
		{
			parent.find('.tf-error').hide();			
		}
		else
		{
			parent.find('.tf-error').show();
		}
		
		build($(parent), request);
	}
	
	var reduce = function(parent, request)
	{
		parent.find('.tf-filter').each(function()
		{	
			var d = $(this);
			
			if (request === undefined || d[0] !== request[0])
			{
				console.log(d.attr('class'));
				
				d.find('option').attr('disabled','disabled');
				var option = d.attr('rel');
				$.unique(parent.find('.tf-item').map(function()
				{
					return $(this).attr(option).split(" ");
				})).each(function(key, value)
				{
					d.find("option[value='"+value+"']").removeAttr('disabled');
				});
				d.find("option[value='-1']").removeAttr('disabled');
			}
		});
	}
	
	var mark_rows = function(parent)
	{
		var count = 0;
		parent.find('.tf-item').each(function()
		{
			$(this).removeClass('tf-row-1');
			$(this).removeClass('tf-row-0');
			$(this).addClass('tf-row-'+(count++%2));
		});
	}
	
		
	// Build	
	build(targets);
	
	// Bind Filter
	targets.find('.tf-filter').on('change' ,function()
	{
		search($(this).parents('.tf-parent').first(), $(this));
		return false;
	});
	
	targets.find('.tf-search').on('keyup', function()
	{
		search($(this).parents('.tf-parent').first(), $(this));
		return false;
	});
	
});
