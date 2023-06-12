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
        replies: [],
        your_feed_button: "button",
        your_meows_button: "button",
        recent_meows_button: "button",
        selected_user_id: null,
        original_meow_id: null,
        reply_view: false,
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
                timestamp: new Date().toISOString()
        }}).then(function (response) {
            console.log("Published meow!")
            app.vue.new_meow = "";
            app.get_recent_meows();

        });
    }

    app.reply_transition = function (original_meow_id) {
        // Switch to reply view
        app.vue.original_meow_id = original_meow_id;

        axios.get(get_single_meow_url, {params: {
            meow_id: app.vue.original_meow_id
        }}).then(function (response) {
            let meow = response.data.meow;

            let timestamp = new Date(meow[0].timestamp);
            meow[0].timestamp = Sugar.Date(timestamp).relative().raw;

            app.vue.meows = meow;
            app.vue.selected_user_id = null;
            app.vue.reply_view = true;
            app.vue.recent_meows_button = "button";
            app.vue.your_feed_button = "button";
            app.vue.your_meows_button = "button";

            axios.get(get_replies_url, {params:{
                meow_id: app.vue.original_meow_id
            }}).then(function (response) {
                let replies = response.data.replies;

                for (let i = 0; i<replies.length; i++) {
                    let timestamp = new Date(replies[i].timestamp);
                    replies[i].timestamp = Sugar.Date(timestamp).relative().raw;
                }

                app.vue.replies = replies;
            });
        });

    }

    app.reply = function () {
        axios.get(reply_url, {params: {
                new_meow: app.vue.new_meow,
                timestamp: new Date().toISOString(),
                original_meow_id: app.vue.original_meow_id
        }}).then(function (response) {
            console.log("Published reply!")
            app.vue.new_meow = "";

            axios.get(get_replies_url, {params:{
                meow_id: app.vue.original_meow_id
            }}).then(function (response) {
                let replies = response.data.replies;

                for (let i = 0; i<replies.length; i++) {
                    let timestamp = new Date(replies[i].timestamp);
                    replies[i].timestamp = Sugar.Date(timestamp).relative().raw;
                }

                app.vue.replies = replies;
            });
        });
    }

    app.remeow = function (username, content) {
        app.vue.new_meow = "RT " + username + ": " + content;
        app.publish_meow();
    }

    app.get_recent_meows = function () {
        axios.get(get_recent_meows_url).then(function (response) {
            let meows = response.data.meows;

            for (let i = 0; i<meows.length; i++) {
                let timestamp = new Date(meows[i].timestamp);
                meows[i].timestamp = Sugar.Date(timestamp).relative().raw;
            }

            app.vue.meows = meows;
            app.vue.selected_user_id = null;
            app.vue.reply_view = false;
            app.vue.recent_meows_button = "button is-link";
            app.vue.your_feed_button = "button";
            app.vue.your_meows_button = "button";

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
            app.vue.selected_user_id = null;
            app.vue.reply_view = false;
            app.vue.recent_meows_button = "button";
            app.vue.your_feed_button = "button is-link";
            app.vue.your_meows_button = "button";
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
            app.vue.selected_user_id = null;
            app.vue.reply_view = false;
            app.vue.recent_meows_button = "button";
            app.vue.your_feed_button = "button";
            app.vue.your_meows_button = "button is-link";
        });
    }

    app.get_selected_user_meows = function (selected_user_id) {
        axios.get(get_selected_user_meows_url, {params: {selected_user_id: selected_user_id}}).then(function (response) {
            let meows = response.data.meows;
            for (let i = 0; i<meows.length; i++) {
                let timestamp = new Date(meows[i].timestamp);
                meows[i].timestamp = Sugar.Date(timestamp).relative().raw;
            }

            app.vue.meows = meows;
            app.vue.selected_user_id = selected_user_id;
            app.vue.reply_view = false;
            app.vue.recent_meows_button = "button";
            app.vue.your_feed_button = "button";
            app.vue.your_meows_button = "button";
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
        get_selected_user_meows: app.get_selected_user_meows,
        remeow: app.remeow,
        reply_transition: app.reply_transition,
        reply: app.reply,
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
