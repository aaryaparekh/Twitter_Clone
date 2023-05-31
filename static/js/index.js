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
                    app.vue.rows = app.enumerate(response.data.rows);
                    app.vue.ret_obj = app.enumerate(response.data.ret_obj);
                });
        })
    }

    app.search = function () {
        axios.get(search_url, {params: {q: app.vue.query}}).then(function (response) {
                app.vue.rows = app.enumerate(response.data.rows);
                app.vue.ret_obj = app.enumerate(response.data.ret_obj);
            });
    }

    app.reload = function () {
        app.vue.query = ""
        axios.get(search_url, {params: {q: app.vue.query}}).then(function (response) {
                app.vue.rows = app.enumerate(response.data.rows);
                app.vue.ret_obj = app.enumerate(response.data.ret_obj);
            });
    }

    app.publish_meow = function () {
        axios.get(publish_meow_url, {params: {new_meow: app.vue.new_meow}}).then(function (response) {
            console.log("Published meow!")
        });
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        set_follow: app.set_follow,
        search: app.search,
        reload: app.reload,
        publish_meow: app.publish_meow,
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
            app.vue.rows = app.enumerate(response.data.rows);
            app.vue.ret_obj = app.enumerate(response.data.ret_obj);
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
