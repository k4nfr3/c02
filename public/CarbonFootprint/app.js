var zip = new JSZip();
var months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']


function rename_activity(activity) {
    switch (activity) {
        case 'FLYING':
            return 'Flying'
        case 'IN_TRAIN':
            return 'Train'
        case 'IN_SUBWAY':
            return 'Subway'
        case 'IN_TRAM':
            return 'Tram'
        case 'IN_BUS':
            return 'Bus'
        case 'IN_PASSENGER_VEHICLE':
            return 'Car'
        case 'IN_VEHICLE':
            return 'Car'
        case 'IN_FERRY':
            return 'Ferry'
        default:
            return activity
    }
}

function calculate_co2(activity_item) {
    switch (activity_item.activity) {
        case 'Flying':
            return activity_item.distance * (254 + 195) / (2 * 1000)
        case 'Train':
            return activity_item.distance * 41 / 1000
        case 'Subway':
            return activity_item.distance * 41 / 1000
        case 'Tram':
            return activity_item.distance * 41 / 1000
        case 'Bus':
            return activity_item.distance * 104 / 1000
        case 'Car':
            return activity_item.distance * (171 + 43) / (2 * 1000)
        case 'Ferry':
            // Correct figure
            return activity_item.distance * 200 / 1000
        case 'UNKNOWN_ACTIVITY_TYPE':
        case 'WALKING':
        case 'CYCLING':
            return 0            
        default:
            console.log('Unknown activity type', activity_item.activity)
    }
}

function parse_history(file_path, file_data) {

    if (file_path.indexOf('2019') == -1) {
        return
    }

    if ('activitySegment' in file_data) {
        activity = file_data.activitySegment

        if ((activity.confidence == 'MEDIUM') || (activity.confidence == 'HIGH')) {

            if (!isNaN(activity.distance)) {
                counts[activity.activityType] += activity.distance
            }
        }
    }
}

function augment_activity_item(activity_item) {
    activity_item.month_id = months.indexOf(activity_item.month)

    if (('activity' in activity_item) && (activity_item.activity != null)) {
        activity_item.activity = rename_activity(activity_item.activity)
        activity_item.co2 = calculate_co2(activity_item)
    }

    return activity_item
}

var app = new Vue({
    el: '#app',
    data: {
        parse_progress: 0,
        parse_total: 1,
        show_progress_bar: false,
        last_year: new Date().getFullYear() - 1,
        location_data: null,
        result_ready: false,
    },
    computed: {
        pc_done: function() {
            return (100 * (this.parse_progress / this.parse_total)) + '%'
        },
        co2_last_year: function() {
            var total = 0;
            last_year = this.last_year
            this.location_data.forEach(function(item) {
                if (item.year == last_year) {
                    if ('co2' in item && !isNaN(item.co2)) {
                        total += item.co2
                    }
                }
            })
            return (total / (10 ** 6)).toFixed(2)
        }
    },
    methods: {
        initProgBar() {
            this.parse_progress = 0
            this.parse_total = 1
            this.show_progress_bar = true
        },
        handleFileUpload(evt) {
            var activity_data = []
            var zipped = evt.target.files[0]
            this.initProgBar()
            zip.loadAsync(zipped).then(function(unzipped) {

                // calculate work to do from sum of unzipped.files[...].uncompressedSize
                file_promises = []
                unzipped.forEach(function(relativePath, zipEntry) {

                    // TODO check path is correct
                    // is json, is location history etc

                    if (relativePath.includes('Semantic Location History')) {

                        let path_year_month_regex = /Semantic Location History\/\d+\/(\d\d\d\d)_([A-Z]+).json/gm;
                        var matches = path_year_month_regex.exec(relativePath)

                        var year = matches[1]
                        var month = matches[2]

                        file_promise = zipEntry.async('string').then(function(file_data) {
                            try {
                                file_data = JSON.parse(file_data)
                                file_data.timelineObjects.forEach(function(history_item) {
                                    if ('activitySegment' in history_item) {
                                        activity_data.push({
                                            year: year,
                                            month: month,
                                            confidence: history_item.activitySegment.confidence,
                                            activity: history_item.activitySegment.activityType,
                                            distance: history_item.activitySegment.distance,
                                        })
                                    }
                                })
                            } catch (err) {
                                console.log(err.message)
                            }

                            app.parse_progress += 1

                        })
                        app.parse_total += 1
                        file_promises.push(file_promise)
                    }
                })
                return Promise.all(file_promises)
            }).then((file_promises) => {
                activity_data = activity_data.map(augment_activity_item)
                app.parse_progress += 1
            }).then(() => {
                app.location_data = activity_data
                app.data_load_complete()
            })
        },
        data_load_complete() {
            vegaEmbed('#co2_per_year_diagram', make_total_co2_per_year_diagram(this.location_data));
            vegaEmbed('#co2_punchcard_diagram', make_punchcard_diagram(this.location_data));

            this.result_ready = true
        },
        use_example_data(){
            this.location_data = example_location_data
            this.data_load_complete()
        }
    }
})

function make_punchcard_diagram(data) {
    return {
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        description: 'Punchcard visualisation showing Co2 use per month and year.',
        data: {
            values: data
        },
        mark: { "type": "circle", "tooltip": true },
        transform: [
            { "filter": "datum.co2 > 0" },
            { "calculate": "datum.co2/1000", "as": "co2_kg" },
        ],
        encoding: {
            x: { field: 'month', type: 'ordinal', sort: months, axis: { title: 'Month', labelAngle: -60 } },
            y: { field: 'year', type: 'ordinal', axis: { title: 'Year' } },
            size: {
                field: "co2_kg",
                type: 'quantitative',
                aggregate: 'sum',
                axis: {
                    title: 'Co2 (Kilograms)'
                }
            },
        },
        width: 600,
        height: 300,
    };
}

function make_total_co2_per_year_diagram(data) {
    return {
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        description: 'A simple bar chart with embedded data.',
        data: {
            values: data
        },
        mark: { "type": "bar", "tooltip": true },
        transform: [
            { "filter": "datum.co2 > 0" },
            { "calculate": "datum.co2/1000", "as": "co2_kg" },
        ],
        encoding: {
            x: { field: 'year', type: 'nominal', axis: { title: 'Year' } },
            y: {
                "aggregate": "sum",
                "field": "co2_kg",
                "type": "quantitative",
                "axis": { "title": "Co2 (Kilograms)" }
            },
            color: {
                "field": "activity",
                "type": "nominal",
                axis: { title: 'Activity Type' }
            }
        },
        width: 600,
        height: 300,
    }
}