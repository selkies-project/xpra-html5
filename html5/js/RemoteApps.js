$(function() {
    const init = function() {
        const remote_apps_enabled = getboolparam("remote_apps", false);
        const apppath = getparam("apppath");

        if (apppath === null || apppath.length === 0) {
            console.log("could not find apppath in html5 settings, remote apps feature disabled.");
            return;
        }

        const remote_apps_url = "/" + apppath + "/remote-apps/";

        // Show button if feature is enabled.
        if (remote_apps_enabled) {
            $(".remote-apps-buttons").show();
        } else {
            // Short circuit if fetaure is disabled.
            return;
        }

        // Fetch initial list of apps.
        populateAppsMenu(remote_apps_url);
    }

    const fetchApps = function(url) {
        return fetch(url)
            .then(function (response) {
                return response.json();
            });
    }

    const populateAppsMenu = function(remote_apps_url) {
        fetchApps(remote_apps_url).then((data) => {
            var menu_div =$('<ul class="remote-apps-menu"></ul>');
            for (var app of data.apps.sort((a, b) => (a.name > b.name) ? 1 : -1)) {
                var menu_item_li = $('<li class="-noChevron remote-app-menu-item" data-app-name="' + encodeURIComponent(app.name) + '"></li>');
                var menu_item_a = $('<a href="#" title="'+ app.description + '" class="remote-app-menu-link"></a>');
                var menu_item_icon = $('<img class="remote-apps-menu-icon" src="data:image/png;base64, ' + app.icon + '"></img>');
                var menu_item_span = $('<span class="remote-apps-menu-text">' + app.name + '</span>');
                var menu_item_open_new = $('<span class="remote-apps-menu-open-new mdi mdi-open-in-new" title="open in new window"></span>');

                menu_item_a.append(menu_item_icon);
                menu_item_a.append(menu_item_span);
                menu_item_li.append(menu_item_a);
                menu_item_li.append(menu_item_open_new);
                menu_div.append(menu_item_li);

                // Set width to fit text
                $('.remote-app-menu-item').css("width", "200px");
            }
            $("li.remote-apps-buttons").append(menu_div);

            const remoteAppsClickHandler = function(e)  {
                var open_in_new = (e.button === 1);
                e.preventDefault();

                if ($(e.target).hasClass("remote-apps-menu-open-new")) {
                    open_in_new = true;
                }

                var li = $(e.target).closest(".remote-app-menu-item");
                if (li.length > 0) {
                    var app_name = li.attr("data-app-name");
                    startRemoteApp(remote_apps_url, app_name, open_in_new).then((resp) => {
                        console.log("started remote app: " + app_name, resp);
                    });
                } else {
                    console.log("remote app parent element not found", e.target);
                }
                hideRemoteAppsMenu();
                e.preventDefault();
                return false;
            };

            // Bind click handlers
            $("a.remote-app-menu-link").on("click", remoteAppsClickHandler);
            $("a.remote-app-menu-link").on("auxclick", remoteAppsClickHandler);
            $(".remote-apps-menu-open-new").on("click", remoteAppsClickHandler);
            $(".remote-apps-menu-open-new").on("auxclick", remoteAppsClickHandler);
        }).catch((e) => {
            console.log("remote apps fetch error", e);
            setTimeout(() => {
                populateAppsMenu(remote_apps_url);
            }, 1000);
        });
    }

    const startRemoteApp = function(remote_apps_url, app_name, open_in_new) {
        // Generate new UUID for client window.
        const new_uuid = Utilities.getHexUUID();

        var start_app_url = `${remote_apps_url}start/${app_name}`;
        return fetch(start_app_url, {
            method: "POST",
            credentials: "include",
            mode: 'cors',
        })
            .then(function (response) {
                if (response.status !== 202) throw response;
                return response.json();
            })
            .then((response) => {
                var pid = "0";
                if (response.data) {
                    pid = response.data.pid;
                }
                console.log(`Started app '${app_name}' with pid: ${pid}`);
                if (open_in_new && pid !== "0") {
                    client.send(["filter-window-by-pid", "add", pid, "=", new_uuid]);
                    // Open new browser window with the uuid we created earlier, the filter will cause only that window to appear.
                    var popup = window.open(
                        "index.html?uuid=" + new_uuid + "&resize_screen=false&fullscreen_windows=false&sharing=true",
                        app_name,
                        "width=800,height=600",
                    );
                    popup.addEventListener("beforeunload",function(e) {
                        console.log("popup closed for window " + wid);
                        // Clear the filters.
                        //client.send(["reset-window-filters"]);
                        client.send(["filter-window-by-pid", "remove", pid, "=", "*"]);
                        //client.send(["resend-window", wid]);
                    }, false);
                } else if (pid !== "0") {
                    //client.send(["filter-window-by-pid", "add", pid, "=", client.uuid]);
                }
                return response;
            });
    }

    const hideRemoteAppsMenu = function() {
        const menu = $(".remote-apps-buttons")[0];
        const ul = $("ul", menu)[0];

        if(!ul || !ul.classList.contains("-visible")) return;

        menu.classList.remove("-active");
        ul.classList.add("-animating");
        setTimeout(function(){
            ul.classList.remove("-visible");
            ul.classList.remove("-animating");
            // retract float menu when clicking away from open menu.
            retract_float_menu();
        }, 300);
    }

    window.on_page_init_listeners.push(init);
});