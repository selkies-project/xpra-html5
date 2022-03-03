$(function() {
    var statsMap = {
        "inbound-bandwidth": {
            title: "inbound traffic, kbits/s",
            data: [],
            opts: {
                lineColor: "#00f",
                fillColor: "#cdf",
                chartRangeMin: 0,
                chartRangeMax: 10000,
            },
        },
        "outbound-bandwidth": {
            title: "outbound traffic, kbits/s",
            data: [],
            opts: {
                chartRangeMin: 0,
                chartRangeMax: 2000,
            },
        },
        "latency": {
            title: "client latency, ms",
            data: [],
            opts: {
                chartRangeMin: 0,
                chartRangeMax: 200,
            },
        },
        "server_load": {
            title: "average server load, 1m, 5m, 15m",
            data: {
                "1m": {
                    data: [],
                    opts: {
                        composite: true,
                        lineColor: "red",
                        fillColor: "red",
                        chartRangeMin: 0,
                        chartRangeMax: 4,
                    },
                },
                "5m": {
                    data: [],
                    opts: {
                        composite: true,
                        lineColor: "green",
                        fillColor: "green",
                        chartRangeMin: 0,
                        chartRangeMax: 4,
                    },
                },
                "15m": {
                    data: [],
                    opts: {
                        composite: true,
                        lineColor: "blue",
                        fillColor: "blue",
                        chartRangeMin: 0,
                        chartRangeMax: 4,
                    },
                }
            },
        },
    }

    var truncateStats = (name, size) => {
        if (statsMap[name].data.length > size) {
            statsMap[name].data.shift();
        }
    }

    var update_sparklines = () => {
        var base_opts = {
            type: "line",
            width: "100px",
            height: "40px",
        }
        var found_any = false;
        for (var name of Object.keys(statsMap)) {
            if (Array.isArray(statsMap[name].data)) {
                // Standard stat
                var opts = Object.assign(base_opts, statsMap[name].opts);
                $(`.${name}-sparkline`).sparkline(statsMap[name].data, opts);
                found_any ||= (statsMap[name].data.length > 1);
            } else {
                // Composite stat.
                $(`.${name}-sparkline`).sparkline([], base_opts);
                for (var cname of Object.keys(statsMap[name].data)) {
                    var opts = Object.assign(base_opts, statsMap[name].data[cname].opts);
                    $(`.${name}-sparkline`).sparkline(statsMap[name].data[cname].data, opts);
                    found_any ||= (statsMap[name].data[cname].data.length > 1);
                }
            }
        }
        if (found_any) {
            $("#stats_loading").hide();
        }
    }

    var clear_data = (name) => {
        if (!statsMap[name]) return;
        if (Array.isArray(statsMap[name].data)) {
            // clear single stat.
            statsMap[name].data = [];
        } else {
            // clear composite stat
            for (var cname of Object.keys(statsMap[name].data)) {
                statsMap[name].data[cname].data = [];
            }
        }
    }
    
    // Register callback that is triggered when bandwidth data is received.
    window.stats_listeners.push((stats) => {
        statsMap["inbound-bandwidth"].data.push(stats.inbound_rate_s);
        statsMap["outbound-bandwidth"].data.push(stats.outbound_rate_s);
        statsMap["latency"].data.push(client.client_ping_latency);
        if (client.server_load && client.server_load.length === 3) {
            statsMap["server_load"].data["1m"].data.push(client.server_load[0]);
            statsMap["server_load"].data["5m"].data.push(client.server_load[1]);
            statsMap["server_load"].data["15m"].data.push(client.server_load[2]);
        }
        
        // Only keep 5 minutes of data points.
        for (var name of Object.keys(statsMap)) {
            truncateStats(name, 300);
        }
    });

    window.showStatsGraph = function() {
        // Only show once
        if ($('#stats').length > 0) return;

        var make_stat = function(name, title) {
            var el = $('<span>');
            el.data('name', name);
            el.attr('title', title);
            el.attr('class', name + "-sparkline" + " stats-row");
            return el;
        }
        var stats_div = $("<div id='stats'/>");

        // Add the header with the close button.
        var stats_header = $("<span id='stats_header' class='stats-row' title='session stats, right-click a graph to clear data points'>");
        var stats_close_btn = $("<img id='stats_close_btn' src='icons/close.png' title='close'/>");
        stats_close_btn.on('click', (e) => {
            hideStatsGraph();
            e.preventDefault();
            return false;
        });
        stats_header.append(stats_close_btn);
        stats_div.append(stats_header);

        // Add the loading spinner element.
        var stats_loading = $("<span id='stats_loading' class='spinner'/>");
        stats_div.append(stats_loading);

        // Create stats sparkline rows
        for (var name of Object.keys(statsMap)) {
            stats_div.append(make_stat(name, statsMap[name].title));
        }

        $("body").append(stats_div);

        // Make stats display draggable.
        stats_div.draggable({
            cancel: '.noDrag',
            containment: 'window',
            scroll: false
        });

        // Bind event handlers to clear data.
        $('.stats-row').on('contextmenu', (e) => {
            var stat = $(e.target).parent().data('name');
            clear_data(stat);
            update_sparklines();
        });

        update_sparklines();
        this.statsGraphTimer = setInterval(update_sparklines, 2000);
    }

    window.hideStatsGraph = function () {
        clearInterval(this.statsGraphTimer);
        $('#stats').remove();
    }

    // Parameter to decide if stats are initially shown.
    if (getboolparam("show_stats",false)) {
        window.showStatsGraph();
    }

    // Override default xpra function.
    window.show_sessioninfo = (e) => {
        window.showStatsGraph();
    }

});
