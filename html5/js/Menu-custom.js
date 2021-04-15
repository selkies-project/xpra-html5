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
	var new_element = $('#float_menu_new');
	if (window_tray) {
		if (new_element.length > 0) {
			console.log("Showing new window tray");
			float_menu_element.attr('id', 'float_menu_old');
			float_menu_element = new_element;
			float_menu_element.attr('id', 'float_menu');
		}
	} else if (old_element.length > 0) {
		// Restore swapped float menu
		float_menu_element.attr('id', 'float_menu_new');
		old_element.attr('id', "float_menu");
		float_menu_element = old_element;
	}
	if (!floating_menu) {
		float_menu_element.hide();
	} else {
		float_menu_element.show();
		var toolbar_width = float_menu_element.width();
		var left = 0;
		var top = float_menu_element.offset().top || 0;
		var screen_width = $('#screen').width();
		if (toolbar_position=="top-left") {
			//no calculations needed
		}
		else if (toolbar_position=="top") {
			left = screen_width/2-toolbar_width/2;
		}
		else if (toolbar_position=="top-right") {
			left = screen_width-toolbar_width-100;
		}
		float_menu_element.offset({ top: top, left: left });

		// TODO: support window tray hiding.
		if (window_tray) {
			float_menu_element.off('mouseover', expand_float_menu);
			float_menu_element.off('mouseout', retract_float_menu);
			expand_float_menu();
		} else {
			if (autohide) {
				float_menu_element.on('mouseover', expand_float_menu);
				float_menu_element.on('mouseout', retract_float_menu);
			} else {
				float_menu_element.off('mouseover', expand_float_menu);
				float_menu_element.off('mouseout', retract_float_menu);
				expand_float_menu();
			}
		}
		update_autohide_menu_element(autohide);

		// if draggable has already been set, don't re-bind the handlers.
		if (!float_menu_element.hasClass("ui-draggable")) {

			float_menu_element.draggable({
				cancel: '.noDrag',
				containment: 'window',
				scroll: false
			});
			float_menu_element.on("dragstart",function(ev,ui){
				client.mouse_grabbed = true;
				//set_focus_cb(0);
			});
			float_menu_element.on("dragstop",function(ev,ui){
				client.mouse_grabbed = false;
				client.reconfigure_all_trays();
			});

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
	var autohide_menu_element = $('#autohide_menu');
	if (autohide) {
		autohide_menu_element.attr("data-icon", "visibility");
		autohide_menu_element.text("Always Show Menu");
	} else {
		autohide_menu_element.attr("data-icon", "visibility_off");
		autohide_menu_element.text("Auto Hide Menu");
	}
}

function toggle_menu_auto_hide() {
	// TODO: support autohide for window tray feature
	if (getboolparam("window_tray", false, true)) return;

	var oldvalue = getboolparam("autohide", false, true);
	var newvalue = !oldvalue;

	// set and persist user value.
	setparam("autohide", newvalue, true);

	update_autohide_menu_element(newvalue);

	var float_menu_element = $('#float_menu');

	if (newvalue) {
		float_menu_element.on('mouseover', expand_float_menu);
		float_menu_element.on('mouseout', retract_float_menu);
	} else {
		float_menu_element.off('mouseover', expand_float_menu);
		float_menu_element.off('mouseout', retract_float_menu);
		expand_float_menu();
	}
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
