/**
 * Created by lex on 9/10/15.
 */

if (!Cookies.enabled) {
    document.write('<div class="alert alert-danger" style="position:fixed; border-radius: 0; width:100%; bottom:0; z-index:9999; background-color: rgba(245, 87, 83, 0.7);"> Cookies are disabled in your system. You can\'t login.</div>');
}

Vue.directive('trans', {
    update: function (value) {
        value = translate(value);
        var arg = this.arg;
        switch (arg) {
            case 'placeholder':
                this.el.placeholder = value;
                break;
            case 'value':
                this.el.value = value;
                break;
            case 'html':
                this.el.innerHTML = value;
                break;
            default:
                this.el.innerHTML = value;
        }
    }
});

// Directives
Vue.directive('chosen', {
    twoWay: true, // note the two-way binding
    bind: function () {
        var self = this;
        $(self.el)
            .chosen({
                inherit_select_classes: true,
                width: '100%',
                placeholder_text_single: '--- Select ---'
            })
            .change(function (ev) {
                // two-way set
                this.set(this.el.value);
            }.bind(this));
    },
    update: function (nv, ov) {
        // note that we have to notify chosen about update
        $(this.el).trigger("chosen:updated");
    }
});

/****THIS IS USED FOR LOGIN WITH FACEBOOK IN LOGIN OR REGISTER PAGE*****/

var pathArray = window.location.pathname.split('/');
var page = pathArray[1];
if (page.substring(0, 1) == '@') {
    var username = page.substring(1);
}
if (page == 'signin' || page == 'signup') {

    window.fbAsyncInit = function () {
        FB.init({
            appId: '1467808453537379',
            oauth: true,
            cookie: true, // enable cookies to allow the server to access
            xfbml: true, // parse social plugins on this page
            status: true, // check login status
            version: 'v2.4' // use version 2.2
        });
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js"; //can be all.js
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

}


var tinymceConfig = {
    "default": {
        theme: "modern",
        skin: 'light',
        menubar: false,
        plugins: [
            "advlist autolink lists link image charmap print preview hr anchor pagebreak",
            "searchreplace wordcount visualblocks visualchars code fullscreen",
            "insertdatetime media nonbreaking save table contextmenu directionality",
            "emoticons template paste textcolor colorpicker textpattern"
        ],
        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent ",
    }
};
