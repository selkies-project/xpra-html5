$(function() {

	window.notification_timers = {};

	window.doNotification = function(type, nid, title, message, timeout, icon, actions, hints, onAction, onClose){
		console.debug("doNotification", type, nid, title, message, timeout, icon, actions, hints, onAction, onClose);

		if (type === "info" && title === "Network Performance Issue") {
			window.showNetworkCongestionNotification(nid, timeout, onClose);
		} else {
			console.log("unhandled notification", type, title, message);
		};
	};

	window._notification_button = function(nid, action_id, action_label, onAction, onClose) {
		
	};

	window.cancelNotificationTimer = function(nid) {
		
	};
	window.cancelNotificationTimers = function() {
		
	};

	window.closeNotification = function(nid) {
		
	};

	window.clearNotifications = function(){
		
	};

	window.removeNotifications = function(){
		
	};

	window.showNetworkCongestionNotification = function(nid, timeout, onClose) {
		console.log("saw network congestion notification.");
		var curr_el = $("#network-connectivity-notification");
		if (curr_el.length > 0) {
			return;
		}
		var el = $("<div id='network-connectivity-notification'>");
		el.attr("data-icon", "signal_wifi_statusbar_connected_no_internet_4");
		el.attr("title", "Network congestion detected, click to dismiss");
		$("body").append(el);
		el.css({
			"position": "fixed",
			"top": "28px",
			"right": 0,
			"width": "40px",
			"height": "40px",
			"z-index": 100000,
			"color": "orange",
		});
		el.on("click", (e) => {
			el.fadeOut();
			if (onClose !== undefined) {
				const reason = 2;
				onClose(nid, reason, "");
			}
			$(el).remove();
		});
		if (timeout !== undefined && timeout > 0) {
			setTimeout( () => {
				el.fadeOut();
				$(el).remove();
			}, timeout);
		} else if (onClose !== undefined) {
			const reason = 2;
			onClose(nid, reason, "");
		}
	};
});