var popups = {

	allow: true,
	fadeClick: true,
	offset: 75,
	backTo: false,
	type: null,

	preInit: function () {
		// generate fade
		var f = '<div id="popupFade" class="no-print" />';
		var l = '<div id="popupLoader" class="no-print" />';
		// append popups
		site.body.append(f + l);
		// continue
		popups.init();
	},

	init: function () {

		// launch
		$('a.js-popup-launch').each(function () {
			var link = $(this);
			// click
			link.off('click').on('click', function () {
				popups.launch(link.attr('href'), link.attr('data-template') || null);
				return false;
			});
		});

		// confirm
		$('a.js-popup-confirm').each(function () {
			var link = $(this);
			// click
			link.off('click').on('click', function () {
				var title = link.attr('data-title') || 'Confirm';
				var text = link.attr('data-text') || 'Are you sure? This cannot be undone.';
				var yesValue = link.attr('data-yes-value') || 'Confirm';
				var noValue = link.attr('data-no-value') || 'Cancel';
				popups.confirm(title, text, link.attr('href'), false, yesValue, noValue);
				return false;
			});
		});

		// youtube embed
		$('a[href*="youtube.com/embed/"]').each(function () {
			var link = $(this);
			// click
			link.off('click').on('click', function () {
				popups.video(link.attr('href') + '?rel=0&autoplay=1');
				return false;
			});
		});

		// youtube video
		$('a[href*="youtube.com/watch?v="]').each(function () {
			var link = $(this);
			// click
			link.off('click').on('click', function () {
				popups.video('//www.youtube.com/embed/' + link.attr('href').split('?v=')[1] + '?rel=0&autoplay=1');
				return false;
			});
		});

		// vimeo link
		$('a[href^="https://vimeo.com/"]').each(function () {
			var link = $(this);
			// click
			link.off('click').on('click', function () {
				var src = link.attr('href').split('/');
				popups.video('//player.vimeo.com/video/' + src[src.length - 1] + '?autoplay=1&color=ffffff&title=0&byline=0&portrait=0');
				return false;
			});
		});

		// close
		$('.m-popup .js-close, #popupFade, #popupConfirmNo').each(function () {
			var link = $(this);
			// click
			link.off('click').on('click', function () {
				popups.close(false, link.hasClass('js-close-print'));
				return false;
			});
		});

		// forms
		popups.forms();
	},

	loader: function (hide, keepFade) {
		var p = $('#popupLoader');
		var f = $('#popupFade');

		if (hide) {
			p.hide();
			if (!keepFade) {
				f.hide();
			}
			popups.allow = true;
			popups.fadeClick = false;
			return;
		}
		if (popups.allow) {
			p.show();
			f.show();
			popups.allow = false;
			popups.fadeClick = false;
		}
	},

	launch: function (url, template) {

		// allowed check
		if (!popups.allow || popups.backTo) {
			location.href = url;
			return false;
		}

		// check if current url
		var comp = url;
		var path = location.pathname;

		// remove comp slash
		if (comp.substr(-1) == '/') {
			comp = comp.substr(0, comp.length - 1);
		}

		// remove path slash
		if (path.substr(-1) == '/') {
			path = path.substr(0, path.length - 1);
		}

		// redirect
		if (comp == path) {
			return false;
		}

		// set type
		popups.type = 'launch';

		// show loader
		popups.loader();

		// get template
		if (typeof template === 'undefined' || template === null) {
			template = '#popupLaunchTemplate';
		}
		template = $(template).html();
		if (typeof template === 'undefined') {
			location.href = url;
			return;
		}
		// parse template
		template = Hogan.compile(template);

		// hide open popups
		var visible = $('.m-popup:visible');
		if (visible.length > 0) {
			// set backto
			popups.backTo = true;
			// set attr
			visible.attr('data-hidden', 'true').hide();
		}

		// get page content
		$.ajax({
			url: url,
			cache: false,
			success: function (response) {
				var content = $(response).find('#popupContentWrapper').html();
				if (typeof content === 'undefined') {
					location.href = url;
					return;
				}
				// render template
				var rendered = template.render({
					content: content,
					url: url
				});
				// add template to body
				site.body.append(rendered);
				// get popup
				var p = $('.m-popup[data-href="' + url + '"]');
				// set top
				p.css('top', popups.getTop());
				// init
				popups.init();
				// show
				p.add('#popupFade:hidden').show();
				// hide loader
				popups.loader(true, true);
				popups.allow = true;
				popups.fadeClick = true;
				// analytics
				site.analytics.page(url, 'Popup');
			},
			error: function (e) {
				// hide loader
				popups.loader(true);
				popups.allow = true;
				popups.fadeClick = true;
				// show notice
				popups.confirm('Error', 'Sorry, the URL "' + url + '" could not be shown (' + e.statusText.toLowerCase() + ').', '', true);
			}
		});
	},

	video: function (src) {
		// allowed check
		if (!popups.allow || popups.backTo) {
			window.open(src);
			return;
		}
		popups.allow = false;

		// get template
		var template = $('#popupVideoTemplate').html();
		if (typeof template === 'undefined') {
			window.open(src);
			return;
		}
		// parse template
		template = Hogan.compile(template);

		// hide open popups
		var visible = $('.m-popup:visible');
		if (visible.length > 0) {
			// set backto
			popups.backTo = true;
			// set attr
			visible.attr('data-hidden', 'true').hide();
		}

		// set type
		popups.type = 'small';

		// render template
		var rendered = template.render({
			src: src
		});
		// add template to body
		site.body.append(rendered);

		// get popup
		var p = $('#popupVideo');
		// set top
		p.css('top', popups.getTop());
		// init
		popups.init();
		site.doc.trigger('ajaxComplete');
		// show
		p.add('#popupFade').show();
		// allow popups
		popups.allow = true;
	},

	confirm: function (title, text, url, notice, yesValue, noValue) {
		// allowed check
		if (!popups.allow || popups.backTo) {
			popups.close();
		}
		popups.allow = false;

		// get template
		var template = Hogan.compile($('#popupConfirmTemplate').html());

		// render template
		var rendered = template.render({
			title: title || 'Confirm',
			text: text || 'Are you sure? This cannot be undone.',
			url: url,
			isNotice: !notice,
			confirm: yesValue || 'Confirm',
			cancel: noValue || 'Cancel'
		});
		// add template to body
		site.body.append(rendered);

		// set type
		popups.type = 'small';

		// get popup
		var p = $('#popupConfirm');
		// set top
		p.css('top', popups.getTop());
		// init
		popups.init();
		site.doc.trigger('ajaxComplete');
		// show
		p.add('#popupFade').show();
		// allow popups
		popups.allow = true;
	},

	forms: function () {
		$('.m-popup form[data-ajax]:not(.js-form-ajax-done)').each(function () {
			var form = $(this);
			var button = form.find(':submit');

			// submit
			form.on('submit', function () {
				// reset validation
				form.removeData('validator');
				form.removeData('unobtrusiveValidation');
				// validate form
				$.validator.unobtrusive.parse(form);
				// check
				if (form.valid()) {
					// disable button
					button.addClass('disabled').prop('disabled', true);
					// submit
					$.ajax({
						type: 'POST',
						url: form.attr('action'),
						data: form.serialize(),
						cache: false,
						success: function (response) {
							// remove error
							form.prev('.js-ajax-error:first').remove();
							// check
							if (response.Valid) {
								// close popups
								popups.close();
								// open redirect
								popups.launch(response.Url);
							}
							else {
								// add error
								form.before('<p class="form-error js-ajax-error">' + response.Message + '</p>');
							}
						},
						error: function () {
							// remove error
							form.prev('.js-ajax-error:first').remove();
							// add error
							form.before('<p class="form-error js-ajax-error">Sorry, there was an unexpected server error.</p>');
						},
						complete: function () {
							// enable button
							button.removeClass('disabled').prop('disabled', false);
						}
					});
				}
				return false;
			});

			// done
			form.addClass('js-form-ajax-done');
		});
	},

	close: function (keepFade, print) {
		var p = $('.m-popup:not([data-visible]):visible');
		if (!popups.allow) {
			return;
		}
		popups.allow = false;
		// hide loader
		popups.loader(true, true);
		// hide popups
		if (popups.backTo) {
			popups.backTo = false;
			$('.m-popup[data-hidden]').removeAttr('data-hidden').show();
		}
		else if (!keepFade) {
			// hide fade
			$('#popupFade').hide();
		}
		// remove popup
		p.remove();
		// clear type
		popups.type = null;
		// trigger print
		if (print) {
			window.print();
		}
		// allow popups
		popups.allow = true;
		// allow fade click
		popups.fadeClick = true;
	},

	getTop: function () {
		var top = site.win.scrollTop();
		var offset = popups.offset;
		return parseInt(top += offset, 10);
	}

};

$(function () {
	popups.preInit();
	site.doc.ajaxComplete(function () {
		popups.init();
	});
});
