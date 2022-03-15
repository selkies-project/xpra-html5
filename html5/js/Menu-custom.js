/**
MIT License

Copyright (c) 2019 Mark Harkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

function addWindowListItem(wid, title){
	if (getboolparam("window_tray", false, true)) {
		addWindowTrayItem(wid, title);
	} else {
		addXpraTrayWindowListItem(wid, title);
	}
}

function removeWindowListItem(itemId){
	const element = document.getElementById("windowlistitem" + itemId);
	if(element && element.parentNode){
		element.parentNode.removeChild(element);
	}
}

function addXpraTrayWindowListItem(wid, title){
	const li = document.createElement("li");
	li.className="windowlist-li";
	li.id = "windowlistitem"+wid;

	const a = document.createElement("a");

	a.id = "windowlistitemlink"+wid;

	a.onmouseover=function(e){
		if (e.ctrlKey) {
			client._window_set_focus(client.id_to_window[wid]);
		}
	};
	a.onclick=function(e){
		// Skip handling minimize, maximize, close events.
		if ($(e.target).hasClass("menu-content-right")) return;
		if (client.id_to_window[wid].minimized) {
			client.id_to_window[wid].toggle_minimized();
		} else {
			client._window_set_focus(client.id_to_window[wid]);
		}
		this.parentElement.parentElement.className="-hide";
	};

	function hideWindowList() {
		document.getElementById('open_windows_list').className="";
	}

	const divLeft = document.createElement("div");
	divLeft.id="windowlistdivleft"+wid;
	divLeft.className="menu-divleft";
	const img = new Image();
	img.id = "windowlistitemicon"+wid;
	img.src="favicon.png";
	img.className="menu-content-left";
	divLeft.appendChild(img);

	const titleDiv = document.createElement("div");
	titleDiv.appendChild(document.createTextNode(title));
	titleDiv.id = "windowlistitemtitle"+wid;
	titleDiv.className="menu-content-left";
	divLeft.appendChild(titleDiv);

	const divRight = document.createElement("div");
	divRight.className="menu-divright";

	const img2 = new Image();
	img2.id = "windowlistitemclose"+wid;
	img2.src="icons/close.png";
	img2.title="Close";
	img2.className="menu-content-right";
	img2.onclick=function(e){ client._window_closed(client.id_to_window[wid]); e.stopPropagation(); hideWindowList(); };
	const img3 = new Image();
	img3.id = "windowlistitemmax"+wid;
	img3.src="icons/maximize.png";
	img3.title="Maximize";
	img3.onclick=function(e){ client.id_to_window[wid].toggle_maximized(); e.stopPropagation(); hideWindowList(); };
	img3.className="menu-content-right";
	const img4 = new Image();
	img4.id = "windowlistitemmin"+wid;
	img4.src="icons/minimize.png";
	img4.title="Minimize";
	img4.onclick=function(e){ client.id_to_window[wid].toggle_minimized(); e.stopPropagation(); hideWindowList(); };
	img4.className="menu-content-right";

	divRight.appendChild(img2);
	divRight.appendChild(img3);
	divRight.appendChild(img4);
	a.appendChild(divLeft);
	a.appendChild(divRight);
	li.appendChild(a);

	document.getElementById("open_windows_list").appendChild(li);
}

function addWindowTrayItem(wid, title) {
	const li = document.createElement("li");
	li.className="windowlist-li-new";
	li.id = "windowlistitem"+wid;
	li.setAttribute("title", title);

	const a = document.createElement("a");

	a.id = "windowlistitemlink"+wid;

	a.onmouseover=function(e){
		if (e.ctrlKey) {
			client._window_set_focus(client.id_to_window[wid]);
		}
	};
	a.onclick=function(){
		if (client.id_to_window[wid].minimized) {
			client.id_to_window[wid].toggle_minimized();
		} else if (client.focus === wid) {
			client.id_to_window[wid].toggle_minimized();
		} else {
			client._window_set_focus(client.id_to_window[wid]);
		}
	};

	const divLeft = document.createElement("div");
	divLeft.id="windowlistdivleft"+wid;
	divLeft.className="menu-divleft-new";
	const img = new Image();
	img.id = "windowlistitemicon"+wid;
	img.src="favicon.png";
	img.className="menu-content-left-new";
	divLeft.appendChild(img);

	const titleDiv = document.createElement("div");
	titleDiv.id = "windowlistitemtitle"+wid;
	titleDiv.className="menu-content-left-new windowlistitem-title-container";
	divLeft.appendChild(titleDiv);

	const titleTextDiv = document.createElement("div");
	titleTextDiv.appendChild(document.createTextNode(title));
	titleTextDiv.className = "windowlistitem-title";
	titleDiv.appendChild(titleTextDiv);

	a.appendChild(divLeft);
	li.appendChild(a);

	document.getElementById("float_menu_window_list").appendChild(li);
}

function init_float_menu() {
	const floating_menu = getboolparam("floating_menu", true);
	const autohide = getboolparam("autohide", false, true);
	const window_tray = getboolparam("window_tray", false, true);
	const toolbar_position = getparam("toolbar_position");
	var float_menu_element = $('#float_menu');
	var old_element = $("#float_menu_old");
	var new_element = $("#float_menu_new");
	var menu_list_element = $("#menu_list");
	var old_menu_list_element = $("#menu_list_old");
	var new_menu_list_element = $("#menu_list_new");
	if (window_tray) {
		if (new_element.length > 0) {
			console.log("Showing new window tray");
			// Swap float menu
			float_menu_element.attr('id', 'float_menu_old');
			float_menu_element = new_element;
			float_menu_element.attr('id', 'float_menu');
		}
		if (new_menu_list_element.length > 0) {
			// Swap menu list
			menu_list_element.attr('id', 'menu_list_old');
			menu_list_element = new_menu_list_element;
			menu_list_element.attr('id', 'menu_list');
		}
	} else if (old_element.length > 0) {
		// Restore swapped float menu
		float_menu_element.attr('id', 'float_menu_new');
		old_element.attr('id', "float_menu");
		float_menu_element = old_element;
		// Restore swapped menu list
		menu_list_element.attr('id', 'menu_list_new');
		old_menu_list_element.attr('id', 'menu_list');
		menu_list_element = old_menu_list_element;
	}
	if (!floating_menu) {
		float_menu_element.hide();
	} else {
		if (float_menu_element.is(":visible")) return;
		float_menu_element.show();
		if (window_tray) {
			float_menu_element.css('display', "inline-flex");
		} else {
			float_menu_element.css("position", "absolute");
		}
		client.position_float_menu();

		if (autohide) {
			bind_autohide_handlers();
			retract_float_menu();
		} else {
			unbind_autohide_handlers();
			expand_float_menu();
		}
		update_autohide_menu_element(autohide);
		update_hidpi_menu_element(client.device_dpi_scaling);

		// if draggable has already been set, don't re-bind the handlers.
		if (!float_menu_element.hasClass("ui-draggable")) {
			if (!window_tray) {
				var toolbar_width = float_menu_element.outerWidth() * client.scale;
				var toolbar_height = float_menu_element.outerHeight() * client.scale;
				float_menu_element.draggable({
					cancel: '.noDrag',
					containment: 'window',
					scroll: false,
					cursorAt: { left: toolbar_width/2, top: toolbar_height/2 },
				});
				float_menu_element.on("dragstart",function(ev,ui){
					client.mouse_grabbed = true;
				});
				float_menu_element.on("dragstop",function(ev,ui){
					client.mouse_grabbed = false;
					client.toolbar_position="custom";
					client.reconfigure_all_trays();
				});
			}

			// Configure the fullscreen button.
			$('#fullscreen').on('click', function (e) {
				toggle_fullscreen();
			});

			$('.fullscreen-button').on('click', function (e) {
				toggle_fullscreen();
			});

			$('.keyboard-button').on('click', function (e) {
				toggle_keyboard();
			});

			if (getboolparam("keyboard_layout_buttons", false, true) === true) {
				$('.keyboard-layout-buttons').show();

				// Initialize the layout selection from param
				set_keyboard_layout(null, getparam("keyboard_layout", true) || "us" );
				client._check_browser_language();

				// Bind click handlers.
				$('.keyboard-layout-buttons ul li a').on('click', function (e) {
					set_keyboard_layout($(e.target));
				});
			}

			// Configure Xpra tray window list right click behavior.
			$([$("#open_windows_list").siblings("a")[0], $(".window-list-button")[0]]).on('mousedown', (e) => {
				if (e.buttons === 2) {
					client.toggle_window_preview();
				}
			});
		}

		// Configure the apps button.
		update_apps_button();
	}
}

function set_keyboard_layout(el, default_layout) {
	if (default_layout) {
		el = $("#keyboard-layout-" + default_layout);
		if (el.length === 0) {
			client.debug("keyboard", "unsupported default layout: " + default_layout);
			el = $("#keyboard-layout-us");
		}
	}
	var curr_icon_el = $("#current-keyboard-layout");
	var curr_flag_icon = $(curr_icon_el).attr("class").match(new RegExp("flag-icon-(.*)$"))[0];
	var new_flag_icon = null;

	new_flag_icon = curr_flag_icon;
	if ($(el).data("flag")) {
		new_flag_icon = "flag-icon-" + $(el).data("flag");
	}

	curr_icon_el.removeClass(curr_flag_icon);
	curr_icon_el.addClass(new_flag_icon);

	var el_keyboard = $(el).data("keyboard");
	if (el_keyboard) {
		client.keyboard_layout = el_keyboard;
	}
	client.debug("keyboard", "setting keyboard_layout=" + client.keyboard_layout);

	// persist keyboard layout for user.
	setparam("keyboard_layout", $(el).attr("id").replace("keyboard-layout-", ""), true);
}

function update_apps_button() {
	// WIP
	return;

	// Configure the apps button.
	var apps_element = $('#application_button');
	var desktop_win = client.get_desktop_window();
	if (desktop_win !== null) {
		apps_element.show();
		expand_float_menu();
	} else {
		// No desktop window, remove the apps button and update the menu width.
		console.log("no desktop window found");
		apps_element.hide();
		expand_float_menu();
	}
}

function apps_button_click() {
	const apps_element = $('#application_button');
	const pos = apps_element.offset();
	const btn_height = apps_element.height();

	const x = pos.left;
	const y = pos.top + btn_height + 5;

	console.log("showing apps menu at ("+x+","+y+")");

	var desktop_win = client.get_desktop_window();
	if (desktop_win !== null) {
		// Send right click event to Desktop window to open applications dialog.
		client.send(["button-action", desktop_win.wid, 3, true, [x, y], {}, []]); // modifiers, buttons]);
		client.send(["button-action", desktop_win.wid, 3, false, [x, y], {}, []]); // modifiers, buttons]);
	}
}

function update_autohide_menu_element(autohide) {
	var autohide_menu_element = $('.autohide_menu');
	if (autohide) {
		autohide_menu_element.attr("data-icon", "visibility");
		autohide_menu_element.text("Always Show Menu");
	} else {
		autohide_menu_element.attr("data-icon", "visibility_off");
		autohide_menu_element.text("Auto Hide Menu");
	}
}

function toggle_menu_auto_hide() {
	var oldvalue = getboolparam("autohide", false, true);
	var newvalue = !oldvalue;

	// set and persist user value.
	setparam("autohide", newvalue, true);

	update_autohide_menu_element(newvalue);

	if (newvalue) {
		bind_autohide_handlers();
		retract_float_menu();
	} else {
		unbind_autohide_handlers();
		expand_float_menu();
	}
}

function update_hidpi_menu_element(state) {

	if (getboolparam("device_dpi_scaling", false, true)) {
		$('.hidpi_menu').text("Disable HiDPI");
	} else {
		$('.hidpi_menu').text("Enable HiDPI");
	}
}

function toggle_menu_hidpi() {
	var oldvalue = getboolparam("device_dpi_scaling", false, true);
	var newvalue = !oldvalue;

	// set and persist user value.
	setparam("device_dpi_scaling", newvalue, true);
	client.device_dpi_scaling = newvalue;

	// reload page to effect change.
	location.reload();
}

function swap_menu_trays() {
	var oldvalue = getboolparam("window_tray", false, true);
	var newvalue = !oldvalue;
	console.log("swapping menu trays, window_tray="+newvalue);

	// set and persist user value.
	setparam("window_tray", newvalue, true);

	// Need to reload because there are overlapping element IDs if we try to live swap.
	location.reload();
}

function bind_autohide_handlers() {
	var float_menu_element = $('#float_menu');
	float_menu_element.on('mouseenter', expand_float_menu);
	float_menu_element.on('mouseleave', retract_float_menu);

	// support showing tray with swipe down.
	$(document).swipeDetector().on("swipeDown.sd", expand_float_menu);
}

function unbind_autohide_handlers() {
	var float_menu_element = $('#float_menu');
	float_menu_element.off('mouseenter', expand_float_menu);
	float_menu_element.off('mouseleave', retract_float_menu);
	$(document).swipeDetector().off("swipeDown.sd", expand_float_menu);
}