$(function() {
    window.showLoadingScreen = function() {
        if ($("#loading_overlay").length > 0) return;

        var overlay_div = $('<div id="loading_overlay" class="spinneroverlay"/>');

        var spinner_div = $("<span id='loading_screen_spinner' class='spinner'/>");
        overlay_div.append(spinner_div);

        $("body").append(overlay_div);
    }

    window.hideLoadingScreen = function() {
        $("#loading_overlay").remove();
    }

    // showLoadingScreen();
});