// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        rows: [],
        ret_obj: [],
        query: "",
        results: [],
        new_meow: "",
        meows: [],
    };    
    
    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.set_follow = function(follower_id) {
        axios.post(set_follow_url,
            {
                id: follower_id
            }).then(function (response){
                console.log(response)
                axios.get(search_url, {params: {q: app.vue.query}}).then(function (response) {
                    app.vue.rows = response.data.rows;
                    app.vue.ret_obj = response.data.ret_obj;
                });
        })
    }

    app.search = function () {
        axios.get(search_url, {params: {q: app.vue.query}}).then(function (response) {
                app.vue.rows = response.data.rows;
                app.vue.ret_obj = response.data.ret_obj;
            });
    }

    app.reload = function () {
        app.vue.query = ""
        axios.get(search_url, {params: {q: app.vue.query}}).then(function (response) {
                app.vue.rows = response.data.rows;
                app.vue.ret_obj = response.data.ret_obj;
            });
    }

    app.publish_meow = function () {
        axios.get(publish_meow_url, {params: {
            new_meow: app.vue.new_meow,
                timestamp: new Date().toISOString()}}).then(function (response) {
            console.log("Published meow!")

            app.get_recent_meows();

        });
    }

    app.get_recent_meows = function () {
        axios.get(get_recent_meows_url).then(function (response) {
                let meows = response.data.meows;

                for (let i = 0; i<meows.length; i++) {
                    let timestamp = new Date(meows[i].timestamp);
                    meows[i].timestamp = Sugar.Date(timestamp).relative().raw;
                }

                app.vue.meows = meows;
        });
    }

    app.get_my_feed = function () {
        axios.get(get_my_feed_url).then(function (response) {

            let ret_type = response.data.ret_type;

            if (ret_type === 0) {
                // Followers found, need to unpack and process joined tables
                let joined_obj = response.data.joined_obj;
                let meows = [];
                for (let i = 0; i<joined_obj.length; i++) {
                    let timestamp = new Date(joined_obj[i].meow.timestamp);
                    joined_obj[i].meow.timestamp = Sugar.Date(timestamp).relative().raw;
                    meows.push(joined_obj[i].meow);
                }

                app.vue.meows = meows;
            } else {
                // No followers found, just process recent meows
                let meows = response.data.recent_meows;

                for (let i = 0; i<meows.length; i++) {
                    let timestamp = new Date(meows[i].timestamp);
                    meows[i].timestamp = Sugar.Date(timestamp).relative().raw;
                }

                app.vue.meows = meows;
            }
        });
    }

    app.get_my_meows = function () {
        axios.get(get_my_meows_url).then(function (response) {
            let meows = response.data.meows;

            for (let i = 0; i<meows.length; i++) {
                let timestamp = new Date(meows[i].timestamp);
                meows[i].timestamp = Sugar.Date(timestamp).relative().raw;
            }

            app.vue.meows = meows;
        });
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        set_follow: app.set_follow,
        search: app.search,
        reload: app.reload,
        publish_meow: app.publish_meow,
        get_recent_meows: app.get_recent_meows,
        get_my_feed: app.get_my_feed,
        get_my_meows: app.get_my_meows,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        axios.get(get_users_url).then(function (response){
            app.vue.rows = response.data.rows;
            app.vue.ret_obj = response.data.ret_obj;
        });

        app.get_recent_meows();

    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
