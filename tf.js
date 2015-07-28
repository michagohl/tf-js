/*
 *
 * Copyright (c) 2015 Michael Gohl (http://www.gohl.tk)
 * Licensed under GPL (http://www.opensource.org/licenses/gpl-license.php)
 *
 * Version 0.4
 *
 */

$(function(factory)
{
	var targets = $('.tf-parent'),
		auto_rotate = new Array(),
		config = new Array(),
		max_per_page = 10,
		responsive_size = 840,
		reduce_after_search = 0,
		reduce_speed = 30;
	
	var get_max_per_page = function(parent)
	{		
		var pagination = parent.find('.tf-pagination');
		if ($(window).width() <= responsive_size && pagination.attr('data-responsive') !== undefined)
		{
			return parseInt(pagination.attr('data-responsive'));
		}
		else if (pagination.attr('data-pagination') !== undefined)
		{
			return parseInt(pagination.attr('data-pagination'));	
		}
		else
		{
			return max_per_page;	
		}
	}
	
	var get_anchor_name = function (parent)
	{		
		if (!parent.hasClass('tf-parent'))
			parent = parent.parents(".tf-parent");
		
		return "tf-id-"+parent.attr("data-tf-id");
	}
	
	var find_anchor = function (a)
	{
		var hash = window.location.hash,
		ret = -1;
		if (hash.length != 0)
		{
			var anchors = hash.split("!");
			$.each(anchors, function (key, value)
			{
				if (value.split("=")[0].indexOf(a) != -1 && ret == -1 && !isNaN(value.split("=")[1]))
				{
					ret = parseInt(value.split("=")[1]);
				}
			});
		}
		return ret;
	}
	
	var set_anchor = function (parent, page)
	{
		var a = get_anchor_name(parent),		
		hash = window.location.hash;
		if (hash.length == 0 || hash.substring(0,2) == '#!')
		{
			var found = find_anchor(a);
			if (found != -1)
				hash = hash.replace(a+"="+found, a+"="+page);
			else
				hash += "!"+a+"="+page;
			
			window.location.hash = hash;
		}		
	}
	
	var add_clear = function(item)
	{
		item.append('<div class="tf-clear" style="clear:both;"><!-- --></div>');	
	}
	
	var switch_page = function (parent, page, auto)
	{	
		if (parent.find(":animated").length != 0)
		{
			return false;
		}
		
		var tfitem = parent.find('.tf-item');
		
		var count = tfitem.length;		
		
		if (auto == true)
		{
			parent.find('.tf-pagination').children('.tf-pagination-switch').removeClass('tf-pagination-current');
			parent.find('.tf-pagination').children('.tf-pagination-switch[data-page='+page+']').addClass('tf-pagination-current');	
		}
		
		var per_page = get_max_per_page(parent);
		
		parent.find('.tf-pagination-close').hide();
		
		page = parseInt(page);
			
		var nend = ((page*per_page)+per_page);															
		if (nend > count) nend = count;
		var nstart = page*per_page;
		
		var cstart = tfitem.index(parent.find('.tf-item:visible').first());
		var cend = tfitem.index(parent.find('.tf-item:visible').last());
		
		if (cstart == nstart && cend == nend-1)
			return false;
		
		tfitem.wrapAll('<div class="tf-item-container"></div>');
		var tfitemcon = parent.find('.tf-item-container');
		add_clear(tfitemcon);
		console.log($(tfitemcon.get(0)).height());
		
		tfitemcon.css('min-height',$(tfitemcon.get(0)).height()); 
		tfitemcon.css('max-height',$(tfitemcon.get(0)).height());
		// Animation
		if (parent.find('.tf-pagination').attr('data-animation') !== undefined && parent.find('.tf-pagination').attr('data-animation') == "1")
		{						
			animate(parent, page, auto, 'scroller', cstart, cend, nstart, nend); 			
		}
		else
		{		
			tfitem.hide();		
			tfitem.slice(nstart, nend).show();
			
			parent.find('.tf-item:visible').wrapAll('<div class="tf-height-check"></div>');
			add_clear(parent.find('.tf-height-check'));			
			var height = parent.find('.tf-height-check').height();
			parent.find('.tf-height-check').children().unwrap();
			
			switch_page_end(parent, page, auto, height);
		}		
		parent.find('.tf-clear').remove();
		
		return true;	
	}
	
	var get_direction = function (cstart, cend, nstart, nend, count)
	{	
		if (cend == cstart && nstart == nend)
		{
			if (cstart < nstart)
				return 'left';
			else
				return 'right';
		}
		else
		{
			var diff1 = cend - nstart;
			var diff2 = cstart - nend;		
			if (Math.abs(diff1) < Math.abs(diff2))
				return 'left';
			else
				return 'right';			
		}
	}
	
	var switch_page_end = function (parent, page, auto, height)
	{
		var tfitemcon = parent.find('.tf-item-container');
		
		var tHeight = ($(tfitemcon.get(0)).height()-height)*-1;
		if (tHeight < 0)
		{
			tfitemcon.css('max-height', 0);
			tfitemcon.animate({'min-height': "-="+Math.abs(tHeight)},"slow", null, function()
			{
				tfitemcon.children().unwrap();	
			});
		}
		else if (tHeight > 0)
		{
			tfitemcon.css('min-height', 0);				
			tfitemcon.animate({'max-height': "+="+tHeight},"slow", null, function()
			{
				tfitemcon.children().unwrap();					
			});
		}
		
		if (parent.find('.tf-pagination').attr('data-anchor') == "1")
			set_anchor(parent, page);
		
		if (parent.find('.tf-pagination').attr('data-autorotate') !== undefined)
		{		
			var count = parent.find('.tf-item').length,
			next_page = 0;
			if (count > page+1)
				next_page = page+1;
							
			auto_rotate(parent.find('.tf-pagination'), parent, next_page);
		}
	}
	
	var pre_build = function()
	{
		var id = 1;
		targets.each(function()
		{		
			$(this).attr("data-tf-id", (id++));
		});
	}
	
	var animate = function (parent, page, auto, type, cstart, cend, nstart, nend)
	{			
		var next = block_items(parent, nstart, nend-1),
		current = block_items(parent, cstart, cend),					
		direction = get_direction(cstart, cend, nstart, nend-1, $('.tf-item').length-1),
		width = parent.find('.tf-item-container').width(),
		height = $('#'+current).height(),
		_height = 0,
		props = {};
		add_clear($('#'+next));
		add_clear($('#'+current));
		$('#'+next).width(width);
		$('#'+current).width(width);
		parent.find('.tf-item-container').css('max-width', width);
				
		$('#'+next).find('.tf-item').show();
		_height = $('#'+next).height();
		$('#'+next).addClass('tf-block-next');
		$('#'+next).css('margin-left', ((direction == 'right')?-1*width:width));
		
		props['margin-left'] = ((direction == 'right')?'+':'-')+'='+width+'px';
			
		parent.find('.tf-block').animate(props, 'slow', null, function()
		{
			$('#'+current).find('.tf-item').hide();
			remove_block_items(next);
			remove_block_items(current);			
			
			switch_page_end(parent, page, auto, _height);
		}); 	
		
	}
	
	var block_items = function (parent, start, end)
	{		
		var list = parent.find('.tf-item');	
		var name = 'tf-block-'+get_anchor_name(parent)+'-'+parent.find('.tf-block').length;
		parent.find('.tf-item').slice(start, end+1).addClass('tf-item-block');
		parent.find('.tf-item-block').wrapAll('<div id="'+name+'" class="tf-block"></div>');
		parent.find('.tf-item-block').removeClass('tf-item-block');
		return name;
	}
	
	var remove_block_items = function (name)
	{
		$('#'+name).children().unwrap();	
	}
	
	var build = function (target, request)
	{
		target.each(function()
		{
			var current_pagination = $(this).find('.tf-pagination'),
			anchor = get_anchor_name($(this));
			if (current_pagination !== undefined) 
			{
				current_pagination.html('');
				
				var parent = $(this);				
				var count = $(this).find('.tf-item').length;				
				var per_page = get_max_per_page(parent);
				var current_page = 0;
				if (current_pagination.attr('data-anchor') == "1")
					current_page = (find_anchor(anchor) == -1)?0:find_anchor(anchor);
				
				if (count > per_page)
				{
					var pages = Math.round((count / per_page)+0.49);
					
					if (current_pagination.attr('data-switches') == "1" || current_pagination.attr('data-switches') === undefined)
						current_pagination.append('<li class="tf-pagination-switch-move" data-direction="-1">&lt;</li>');
					
					for (i = 0; i < pages; i++)
					{
						var current = (i == current_page)?" tf-pagination-current":"";
						
						current_pagination.append('<li class="tf-pagination-switch'+current+'" data-page="'+i+'">'+(i+1)+'</li>');
					}
					
					if (current_pagination.attr('data-switches') == "1" || current_pagination.attr('data-switches') === undefined)				
						current_pagination.append('<li class="tf-pagination-switch-move" data-direction="+1">&gt;</li>');
					
								
					var nend = ((current_page+1)*per_page);															
					if (nend > count) nend = count;
					var nstart = current_page*per_page;
																
					parent.find('.tf-item').hide();		
					
					for (i = nstart; i < nend; i++)
					{
						parent.find('.tf-item').eq(i).show();
					}				
					
					parent.find('.tf-pagination-switch').on('click', function()
					{						
						if (switch_page(parent, $(this).attr('data-page')))
						{
							current_pagination.children('li').removeClass("tf-pagination-current");
							$(this).addClass("tf-pagination-current");
						}
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
		
		if (parent.find('.tf-pagination').attr('data-anchor') == "1")
			set_anchor(parent, 0);
			
		build($(parent), request);
	}
	
	var reduce = function(parent, request)
	{
		parent.find('.tf-filter').each(function()
		{	
			var d = $(this);
			
			if (request === undefined || d[0] !== request[0])
			{
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
		var per_page = get_max_per_page(parent);
		parent.find('.tf-item').each(function()
		{
			$(this).removeClass('tf-row-1');
			$(this).removeClass('tf-row-0');
			$(this).addClass('tf-row-'+(count++%2));						
			if (per_page == count) count = 0;
		});
	}
	
		
	// Build
	pre_build();	
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
