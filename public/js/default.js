(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var app = Vue.extend({});

Vue.config.debug = true;

var default_page = Vue.extend({
    template: require('./views/master/default.html'),
    data: function data() {
        return {
            logged: {
                avatar: '',
                id: null,
                employee: {
                    first_name: '',
                    last_name: '',
                    job_histories: ['job_title_id']
                }
            },
            page_title: '',
            routes: [],
            has_access: {},
            permission: '',
            employee: {
                user: {
                    id: ''
                },
                id: '',
                first_name: '',
                middle_name: '',
                last_name: '',
                employee_id: '',
                face_id: '',
                gender: '',
                nationality_id: '',
                marital_status_id: '',
                job_histories: ['job_title_id', 'employment_status_id'],
                job_history: []
            },
            job_titles: [],
            employment_statuses: [{}]
        };
    },
    watch: {
        page_title: {
            immediate: true,
            handler: function handler(page_title) {

                var route = [];
                var route_path = this.$route.path.substr(1);
                var route_segments = route_path.split('/');

                var route_name = route_segments[0];
                for (var i = 0; i < route_segments.length; i++) {

                    if (i && route_segments[i].indexOf('HRis') != 0) {
                        // TODO: get employee_id_prefix from config
                        route_name += '-' + route_segments[i];
                    }

                    if (route_segments[i] == 'pim') {
                        route_segments[i] = 'PIM';
                        continue;
                    } else if (route_segments[i].indexOf('HRis') != 0) {
                        // TODO: get employee_id_prefix from config
                        route_segments[i] = route_segments[i].replace('-', ' ');
                        route_segments[i] = this.toTitleCase(route_segments[i]);
                    }

                    if (route_segments[i].indexOf('HRis') == 0) {
                        // TODO: get employee_id_prefix from config
                        route.push({
                            'segment': route_segments[i],
                            'name': route_name + '-personal-details',
                            'params': { 'employee_id': route_segments[i] }
                        });
                    } else {
                        route.push({
                            'segment': route_segments[i],
                            'name': route_name,
                            'params': { 'employee_id': route_segments[i - 1] }
                        });
                    }
                }

                this.routes = route;
                this.preparePermission();

                document.title = 'HRis | ' + page_title; // TODO: get appname from config
            }
        },
        employee: {
            immediate: true,
            handler: function handler(employee) {
                var self = this;
                this.employee = employee;

                $.ajax({
                    url: '/api/1.0/job-titles',
                    method: 'GET',
                    data: { 'table_view': true }
                }).done(function (response) {
                    self.job_titles = response.data;
                });

                $.ajax({
                    url: '/api/1.0/employment-statuses',
                    method: 'GET',
                    data: { 'table_view': true }
                }).done(function (response) {
                    var employee_status = response.data;

                    for (var i = 0; i < employee_status.length; i++) {
                        var e = employee_status[i];
                        self.employment_statuses[e.id] = {};
                        self.employment_statuses[e.id] = { name: e.name, 'class': e['class'] };
                    }
                });
            }

        }
    },

    methods: {
        toTitleCase: function toTitleCase(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },
        preparePermission: function preparePermission() {
            var route_path = this.$route.path.substr(1); // removes the first character ('/') in the path
            var route_dotted = route_path.replace('/', '.');
            var route_segment = route_path.split('/');
            var route_is_pim = route_segment[0] == 'profile' ? false : true;

            this.permission = route_dotted;
            if (route_is_pim) {
                route_segment = route_segment[route_segment.length - 1];
                this.permission = 'pim.' + route_segment;
            }

            this.route = { 'path': route_path, 'dotted': route_dotted, 'segment': route_segment, 'pim': route_is_pim };

            this.has_access = JSON.parse(atob(localStorage.getItem('permissions')));
        }
    },
    compiled: function compiled() {
        this.logged = JSON.parse(atob(localStorage.getItem('logged')));
        this.logged.employee_id = localStorage.getItem('employee_id');
        this.logged.avatar = localStorage.getItem('avatar');
        this.logged.has_access = JSON.parse(atob(localStorage.getItem('permissions')));
    }
});

// Components
Vue.component('copyleft', {
    template: require('./views/partials/copyleft.html')
});
Vue.component('action-area', {
    template: require('./views/partials/action-area.html'),
    props: ['employee', 'job_titles', 'employment_statuses']
});

Vue.component('navbar-static-side', {
    template: require('./views/partials/navbar-static-side.html'),
    ready: function ready() {
        $('#side-menu').metisMenu();
    },
    data: function data() {
        return {
            navlinks: ''
        };
    },
    compiled: function compiled() {
        this.navlinks = JSON.parse(localStorage.getItem('sidebar'));
    }
});

Vue.component('navbar-static-profile-top', {
    template: require('./views/partials/navbar-static-profile-top.html')
});

Vue.component('navbar-static-top', {
    template: require('./views/partials/navbar-static-top.html'),
    methods: {
        doLogout: function doLogout() {
            var self = this;
            $.ajax({
                url: '/api/1.0/signout',
                method: 'GET',
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).always(function () {
                localStorage.removeItem('auth');
                localStorage.removeItem('remember');
                localStorage.removeItem('avatar');
                localStorage.removeItem('logged');
                localStorage.removeItem('permissions');
                Cookies.expire('auth');
                self.$route.router.go({ name: 'login' });
            });
        }
    }
});

Vue.component('footer', {
    template: require('./views/partials/footer.html')
});

// Admin Router
var router = new VueRouter({
    history: true,
    saveScrollPosition: true
});

router.redirect({
    '/': '/dashboard',
    '/profile': '/profile/personal-details',
    '/pim': '/pim/employee-list',
    '/translator': '/translator/translations'
});

// Router Map
router.map({
    '/': {
        component: default_page,
        subRoutes: {
            '/dashboard': {
                name: 'dashboard',
                component: require('./views/pages/dashboard'),
                auth: true
            },
            '/profile': {
                name: 'profile',
                component: require('./views/pages/page'),
                auth: true,
                subRoutes: {
                    '/personal-details': {
                        name: 'profile-personal-details',
                        component: require('./views/pages/profile/personal-details'),
                        auth: true
                    },
                    '/contact-details': {
                        name: 'profile-contact-details',
                        component: require('./views/pages/profile/contact-details'),
                        auth: true
                    },
                    '/emergency-contacts': {
                        name: 'profile-emergency-contacts',
                        component: require('./views/pages/profile/emergency-contacts'),
                        auth: true
                    },
                    '/dependents': {
                        name: 'profile-dependents',
                        component: require('./views/pages/profile/dependents'),
                        auth: true
                    },
                    '/job': {
                        name: 'profile-job',
                        component: require('./views/pages/profile/job'),
                        auth: true
                    },
                    '/work-shifts': {
                        name: 'profile-work-shifts',
                        component: require('./views/pages/profile/work-shifts'),
                        auth: true
                    },
                    '/salary': {
                        name: 'profile-salary',
                        component: require('./views/pages/profile/salary'),
                        auth: true
                    },
                    '/qualifications': {
                        name: 'profile-qualifications',
                        component: require('./views/pages/profile/qualifications'),
                        auth: true
                    }
                }
            },
            '/presence': {
                name: 'presence',
                component: require('./views/pages/dashboard'),
                auth: true
            },
            '/performance': {
                name: 'performance',
                component: require('./views/pages/dashboard'),
                auth: true,
                subRoutes: {
                    '/my-tracker': {
                        name: 'performance-my-tracker',
                        component: require('./views/pages/dashboard'),
                        auth: true
                    },
                    '/employee-tracker': {
                        name: 'performance-employee-tracker',
                        component: require('./views/pages/dashboard'),
                        auth: true
                    },
                    '/configuration': {
                        name: 'performance-configuration',
                        component: require('./views/pages/dashboard'),
                        auth: true,
                        subRoutes: {
                            '/trackers': {
                                name: 'performance-configuration-trackers',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            }
                        }
                    }
                }
            },
            '/time': {
                name: 'time',
                component: require('./views/pages/dashboard'),
                auth: true,
                subRoutes: {
                    '/attendance': {
                        name: 'time-attendance',
                        component: require('./views/pages/dashboard'),
                        auth: true,
                        subRoutes: {
                            '/employee-records': {
                                name: 'time-attendance-employee-records',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            },
                            '/overtime-records': {
                                name: 'time-attendance-overtime-records',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            }
                        }
                    },
                    '/requisition': {
                        name: 'time-requisition',
                        component: require('./views/pages/dashboard'),
                        auth: true
                    },
                    '/holidays': {
                        name: 'time-holidays',
                        component: require('./views/pages/dashboard'),
                        auth: true
                    },
                    '/holidays-and-events': {
                        name: 'time-holidays-and-events',
                        component: require('./views/pages/dashboard'),
                        auth: true
                    }
                }
            },
            '/pim': {
                name: 'pim',
                component: require('./views/pages/page'),

                subRoutes: {
                    '/employee-list': {
                        name: 'pim-employee-list',
                        component: require('./views/pages/pim/employee-list'),
                        auth: true
                    },
                    '/employee-list/:employee_id/personal-details': {
                        name: 'pim-employee-list-personal-details',
                        component: require('./views/pages/profile/personal-details'),
                        auth: true
                    },
                    '/employee-list/:employee_id/contact-details': {
                        name: 'pim-employee-list-contact-details',
                        component: require('./views/pages/profile/contact-details'),
                        auth: true
                    },
                    '/employee-list/:employee_id/emergency-contacts': {
                        name: 'pim-employee-list-emergency-contacts',
                        component: require('./views/pages/profile/emergency-contacts'),
                        auth: true
                    },
                    '/employee-list/:employee_id/dependents': {
                        name: 'pim-employee-list-dependents',
                        component: require('./views/pages/profile/dependents'),
                        auth: true
                    },
                    '/employee-list/:employee_id/job': {
                        name: 'pim-employee-list-job',
                        component: require('./views/pages/profile/job'),
                        auth: true
                    },
                    '/employee-list/:employee_id/work-shifts': {
                        name: 'pim-employee-list-work-shifts',
                        component: require('./views/pages/profile/work-shifts'),
                        auth: true
                    },
                    '/employee-list/:employee_id/salary': {
                        name: 'pim-employee-list-salary',
                        component: require('./views/pages/profile/salary'),
                        auth: true
                    },
                    '/employee-list/:employee_id/qualifications': {
                        name: 'pim-employee-list-qualifications',
                        component: require('./views/pages/profile/qualifications'),
                        auth: true
                    },
                    '/configuration': {
                        name: 'pim-configuration',
                        component: require('./views/pages/dashboard'),
                        auth: true,
                        subRoutes: {
                            '/termination-reasons': {
                                name: 'pim-configuration-termination-reasons',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            },
                            '/custom-field-sections': {
                                name: 'pim-configuration-custom-field-sections',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            }
                        }
                    }
                }
            },
            '/admin': {
                name: 'admin',
                component: require('./views/pages/dashboard'),
                auth: true,
                subRoutes: {
                    '/user-management': {
                        name: 'admin-user-management',
                        component: require('./views/pages/dashboard'),
                        auth: true
                    },
                    '/job': {
                        name: 'admin-job',
                        component: require('./views/pages/dashboard'),
                        auth: true,
                        subRoutes: {
                            '/titles': {
                                name: 'admin-job-titles',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            },
                            '/pay-grades': {
                                name: 'admin-job-pay-grades',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            },
                            '/employment-status': {
                                name: 'admin-job-employment-status',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            },
                            '/categories': {
                                name: 'admin-job-categories',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            },
                            '/work-shifts': {
                                name: 'admin-job-work-shifts',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            }
                        }
                    },
                    '/qualifications': {
                        name: 'admin-qualifications',
                        component: require('./views/pages/dashboard'),
                        auth: true,
                        subRoutes: {
                            '/skills': {
                                name: 'admin-qualifications-skills',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            },
                            '/educations': {
                                name: 'admin-qualifications-educations',
                                component: require('./views/pages/dashboard'),
                                auth: true
                            }
                        }
                    }
                }
            }
        }
    },
    '/login': {
        name: 'login',
        component: require('./views/auth/login')
    }
});
router.beforeEach(function (transition) {

    var auth = Cookies.get('auth');
    var remember = localStorage.getItem('remember');
    if (remember == 1) {
        auth = localStorage.getItem('auth');
    }
    if (transition.to.auth) {
        if (auth) {
            if (remember == 0) {

                $.ajax({
                    url: '/api/1.0/auth/refresh',
                    method: 'GET',
                    beforeSend: function beforeSend(xhr) {
                        xhr.setRequestHeader("Authorization", auth);
                    }
                }).done(function (data, text, xhr) {
                    var token = xhr.getResponseHeader('Authorization');

                    if (remember == 1) {
                        localStorage.setItem('auth', token);
                    } else {
                        Cookies.set('auth', token);
                    }
                    transition.next();
                }).fail(function () {
                    localStorage.removeItem('auth');
                    localStorage.removeItem('remember');
                    localStorage.removeItem('avatar');
                    localStorage.removeItem('logged');
                    localStorage.removeItem('permissions');
                    Cookies.expire('auth');
                    transition.redirect('/login');
                });
            } else {
                Cookies.set('auth', auth);
                transition.next();
            }
        } else {
            transition.redirect('/login');
        }
    } else {
        if (transition.to.path == '/login' && auth) {
            transition.redirect('/dashboard');
        } else {
            transition.next();
        }
    }
});

router.start(app, 'body');

},{"./views/auth/login":3,"./views/master/default.html":4,"./views/pages/dashboard":6,"./views/pages/page":8,"./views/pages/pim/employee-list":10,"./views/pages/profile/contact-details":12,"./views/pages/profile/dependents":14,"./views/pages/profile/emergency-contacts":16,"./views/pages/profile/job":18,"./views/pages/profile/personal-details":20,"./views/pages/profile/qualifications":22,"./views/pages/profile/salary":24,"./views/pages/profile/work-shifts":26,"./views/partials/action-area.html":27,"./views/partials/copyleft.html":28,"./views/partials/footer.html":29,"./views/partials/navbar-static-profile-top.html":30,"./views/partials/navbar-static-side.html":31,"./views/partials/navbar-static-top.html":32}],2:[function(require,module,exports){
module.exports = '<div class="middle-box text-center loginscreen animated fadeInDown">\n    <div>\n        <div>\n\n            <div class="logo-wrapper">\n                <img src="/images/hris-logo.png">\n            </div>\n\n        </div>\n        <h3>Welcome to HRis</h3>\n\n        <!--@if (session(\'activation\'))-->\n        <!--<div class="alert alert-success">-->\n        <!--{{ session(\'activation\') }}-->\n        <!--</div>-->\n        <!--@endif-->\n\n        <div class="alert alert-danger" role="alert" v-if="hasError">\n            <div v-repeat="row: errors.values"><i class="fa fa-times"></i> &nbsp; {{ row }}</div>\n        </div>\n\n        <!--<form class="m-t" role="form" action="/auth/login" method="post" onSubmit="return check(this)">-->\n            <div class="form-group form-group-default"\n                 v-class="has-error: errors.fields.indexOf(\'email\') > -1">\n                <input type="email" class="form-control" placeholder="Email" name="email"\n                       required="" aria-required="true" v-model="login.email" v-on="keyup: doLogin| key 13">\n            </div>\n            <div class="form-group form-group-default"\n                 v-class="has-error: errors.fields.indexOf(\'password\') > -1">\n                <input type="password" class="form-control" placeholder="Password" name="password"\n                       required="" aria-required="true" v-model="login.password" v-on="keyup: doLogin| key 13">\n            </div>\n            <button class="btn btn-primary block full-width m-b" v-on="click: doLogin">Login</button>\n\n            <a href="#"><small>Forgot password?</small></a>\n            <p class="text-muted text-center"><small>Do not have an account?</small></p>\n            <a class="btn btn-sm btn-white btn-block" href="/auth/register">Create an account</a>\n        <!--</form>-->\n        <p class="m-t"> <small>b3 Studios &copy; 2014</small> </p>\n    </div>\n</div>\n';
},{}],3:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./login.html'),
    props: ['page_title'],
    data: function data() {
        return {
            login: {
                email: 'bertrand.kintanar@gmail.com',
                password: 'retardko'
            },
            hasError: false,
            errors: {
                fields: [],
                values: []
            },
            page_title: 'Login'
        };
    },
    watch: {
        page_title: {
            immediate: true,
            handler: function handler(page_title) {
                document.title = 'HRis | ' + page_title;
            }
        }
    },
    methods: {
        doLogin: function doLogin() {

            this.validate();
            if (this.hasError === false) {
                var self = this;
                $.ajax({
                    url: '/api/1.0/auth/signin',
                    method: 'POST',
                    data: self.login
                }).done(function (response) {
                    if (response.code == 200) {
                        var token = 'Bearer ' + response.token;
                        if (self.login.remember == true) {
                            localStorage.setItem('auth', token);
                        } else {
                            Cookies.set('auth', token);
                        }

                        var remember = self.login.remember == true ? 1 : 0;

                        localStorage.setItem('remember', remember);
                        localStorage.setItem('logged', btoa(JSON.stringify(response.data)));
                        localStorage.setItem('employee_id', response.data.employee_id);
                        localStorage.setItem('avatar', response.data.avatar);
                        localStorage.setItem('permissions', btoa(JSON.stringify(response.data.roles[0].permissions)));
                        localStorage.setItem('sidebar', response.data.sidebar);
                        self.$route.router.go({ name: 'dashboard' });
                    } else {
                        self.hasError = true;
                        self.login.password = '';
                        if ('data' in response) {
                            for (var i in response.data) {
                                self.errors.fields.push(i);
                                self.errors.values.push(response.data[i]);
                            }
                        }
                        if ('text' in response) {
                            self.errors.values.push(response.text);
                        }
                    }
                });
            }
        },
        validate: function validate() {
            this.errors.fields = [];
            this.errors.values = [];
            this.hasError = false;
            if (this.login.email.trim().length == 0) {
                this.hasError = true;
                this.errors.fields.push('email');
                this.errors.values.push('email or username field is required.');
            }
            if (this.login.password.trim().length == 0) {
                this.hasError = true;
                this.errors.fields.push('password');
                this.errors.values.push('password field is required.');
            }
            if (this.hasError) {
                this.login.password = '';
            }
        }

    }

};

},{"./login.html":2}],4:[function(require,module,exports){
module.exports = '<div id="wrapper">\n    <nav class="navbar-default navbar-static-side" role="navigation">\n        <div class="sidebar-collapse">\n            <ul class="nav metismenu" id="side-menu">\n                <li class="nav-header">\n                    <div class="dropdown profile-element">\n                        <span>\n                            <img alt="image" id="profile-image-nav" class="img-circle" src="/images/profile/default/0.png">\n                        </span>\n                        <a data-toggle="dropdown" class="dropdown-toggle" href="#">\n                            <span class="clear"> <span class="block m-t-xs"> <strong class="font-bold">{{ logged.employee.first_name }} {{ logged.employee.last_name }}</strong>\n                                </span> <span class="text-muted text-xs block">\n                                    {{job_titles[logged.employee.job_histories[0].job_title_id]}}\n                                <b class="caret"></b></span> </span> </a>\n                        <ul class="dropdown-menu animated fadeInRight m-t-xs">\n                            <li><a href="/profile">Profile</a></li>\n                            <li><a href="contacts.html">Contacts</a></li>\n                            <li><a href="mailbox.html">Mailbox</a></li>\n                            <li class="divider"></li>\n                            <li><a href="#0">Logout</a></li>\n                        </ul>\n                    </div>\n                    <div class="logo-element">\n                        HRis\n                    </div>\n\n                </li>\n                <navbar-static-side></navbar-static-side>\n            </ul>\n        </div>\n    </nav>\n    <div id="page-wrapper" class="gray-bg">\n        <div class="row border-bottom">\n            <navbar-static-top></navbar-static-top>\n        </div>\n        <router-view page_title="{{@ page_title }}" routes="{{@ routes }}" has_access="{{@ has_access}}" permission="{{@ permission}}" employee="{{@ employee }}" job_titles="{{@ job_titles }}" employment_statuses="{{@ employment_statuses }}"></router-view>\n        <footer></footer>\n    </div>\n</div>\n';
},{}],5:[function(require,module,exports){
module.exports = '<div class="row wrapper border-bottom page-heading"\n     v-class="grad-red: $route.path.indexOf(\'/pim\') == 0 || $route.path.indexOf(\'/admin\') == 0, greenpro-bg: $route.path.indexOf(\'/pim\') == -1 && $route.path.indexOf(\'/admin\') == -1">\n    <div class="col-sm-6">\n        <h2>{{page_title}}</h2>\n        <ol class="breadcrumb">\n            <li>\n                <a v-link="{name: \'dashboard\'}">Home</a>\n            </li>\n            <!--{!! Menu::breadcrumb() !!}-->\n            <li v-repeat="route in routes">\n                <a v-link="{name: route.name}">{{route.route}}</a>\n            </li>\n        </ol>\n    </div>\n    <!--@yield(\'action_area\')-->\n</div>\n<div class="row">\n    <div class="col-lg-12">\n        <div class="wrapper wrapper-content">\n            <div class="middle-box text-center animated fadeInRightBig">\n                <h3 class="font-bold">This is page content</h3>\n\n                <div class="error-desc">\n                    You can create here any grid layout you want. And any variation layout you imagine:) Check out main dashboard and other site. It use many different layout.\n                    <br/><a href="index.html" class="btn btn-primary m-t">Dashboard</a>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n';
},{}],6:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./dashboard.html'),
    props: ['page_title', 'has_access', 'permission'],
    compiled: function compiled() {
        this.page_title = 'Dashboard';
    }
};

},{"./dashboard.html":5}],7:[function(require,module,exports){
module.exports = '<div class="row wrapper border-bottom page-heading"\n     v-class="grad-red: $route.path.indexOf(\'/pim\') == 0 || $route.path.indexOf(\'/admin\') == 0, greenpro-bg: $route.path.indexOf(\'/pim\') == -1 && $route.path.indexOf(\'/admin\') == -1">\n    <div class="col-sm-6">\n        <h2>{{page_title}}</h2>\n        <!-- Breadcrumbs -->\n        <ol class="breadcrumb">\n            <li>\n                <a v-link="{name: \'dashboard\'}">Home</a>\n            </li>\n            <li v-repeat="route in routes">\n                <a v-link="{name: route.name, params: {employee_id: route.params.employee_id} }">{{route.segment}}</a>\n            </li>\n        </ol>\n    </div>\n    <action-area v-if="$route.path.indexOf(\'employee-list/\') > -1 || $route.path.indexOf(\'profile/\') > -1" employee="{{@ employee}}" job_titles="{{@ job_titles}}" employment_statuses="{{@ employment_statuses }}"></action-area>\n</div>\n<div class="row">\n    <div class="col-lg-12">\n        <div class="wrapper wrapper-content">\n            <router-view page_title="{{@ page_title }}" has_access="{{@ has_access}}" permission="{{@ permission}}" employee="{{@ employee }}" job_titles="{{@ job_titles }}" employment_statuses="{{@ employment_statuses }}"></router-view>\n        </div>\n    </div>\n</div>\n';
},{}],8:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./page.html'),
    props: ['page_title', 'routes', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses']
};

},{"./page.html":7}],9:[function(require,module,exports){
module.exports = '<div class="row">\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Employee List</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n\n            <div class="ibox-content">\n                <div class="">\n                    <a id="add_employee" href="javascript:void(0);" class="btn btn-primary btn-xs">Add a new row</a>\n                </div>\n                <div class="table-responsive">\n                    <table class="table table-striped">\n                        <thead>\n                        <tr>\n                            <th><a href="/pim/employee-list?page=1&amp;sort=employees.id&amp;direction=asc">Id  <span class="asc "></span> </a></th>\n                            <th><a href="/pim/employee-list?page=1&amp;sort=employees.first_name&amp;direction=asc">First Name  <span class="asc "></span> </a></th>\n                            <th><a href="/pim/employee-list?page=1&amp;sort=employees.last_name&amp;direction=asc">Last Name  <span class="asc "></span> </a></th>\n                            <th><a href="/pim/employee-list?page=1&amp;sort=job_titles.name&amp;direction=asc">Job Title  <span class="asc "></span> </a></th>\n                            <th><a href="/pim/employee-list?page=1&amp;sort=employment_statuses.name&amp;direction=asc">Status  <span class="asc "></span> </a></th>\n                            <th class="fix-width">Action</th>\n                        </tr>\n                        </thead>\n\n                        <tbody>\n\n                        <tr v-repeat="item in employees" id="employee_1">\n                            <td><a v-link="{ name: \'pim-employee-list-personal-details\', params: {employee_id: item.employee_id} }">{{item.employee_id}}</a></td>\n                            <td>{{item.first_name}}</td>\n                            <td>{{item.last_name}}</td>\n                            <td>{{item.job}}</td>\n                            <td>\n                                <span class="label {{item.class}}">{{item.status}}</span>\n                            </td>\n                            <td>\n                                <a href="/pim/employee-list/HRis-0001/personal-details"><button rel="edit" class="btn btn-primary btn-xs btn-warning" data-toggle="tooltip" data-placement="bottom" title="" type="button" data-original-title="Edit"><i class="fa fa-edit"></i></button></a>\n                                <button rel="delete" class="btn btn-primary btn-xs btn-danger" data-toggle="tooltip" data-placement="bottom" title="" type="button" data-original-title="Delete"><i class="fa fa-times"></i></button>\n                            </td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </div>\n                <div class="row">\n                    <div class="col-sm-6">\n                        <div>Displaying 5 of 5</div>\n                    </div>\n                    <div class="col-sm-6">\n                        <div class="dataTables_paginate">\n                            <ul class="pagination">\n                                <li class="paginate_button  disabled ">\n                                    <a href="/pim/employee-list/?page=1&amp;sort=id&amp;direction=asc"> Previous </a>\n                                </li>\n                                <li class="paginate_button  active ">\n                                    <a href="/pim/employee-list/?page=1&amp;sort=id&amp;direction=asc">1</a>\n                                </li>\n                                <li class="paginate_button  disabled ">\n                                    <a href="&amp;sort=id&amp;direction=asc"> Next </a>\n                                </li>\n                            </ul>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n    </div>\n</div>\n';
},{}],10:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./employee-list.html'),
    props: ['page_title', 'has_access', 'permission'],
    data: function data() {
        return {
            employees: [{}]
        };
    },
    compiled: function compiled() {
        this.page_title = 'Employee List';
    },
    ready: function ready() {
        this.getEmployeeList();
    },
    methods: {
        getEmployeeList: function getEmployeeList() {

            var self = this;

            // retrieve employee list
            $.ajax({
                url: '/api/1.0/pim/employee-list',
                method: 'GET',
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {

                self.employees = response.data;
            });
        }
    }
};

},{"./employee-list.html":9}],11:[function(require,module,exports){
module.exports = '<div class="row">\n    <navbar-static-profile-top></navbar-static-profile-top>\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Contact Details</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n            <div class="ibox-content">\n                <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal" id="personalDetailsForm">\n                    <input name="user[id]" type="hidden" v-model="employee.user.id">\n                    <input name="id" type="hidden" v-model="employee.id">\n                    <!-- Start - Address Street -->\n                    <div class="form-group">\n                        <label for="address_1" class="col-md-2 control-label">Address Street 1</label>\n                        <div class="col-md-4">\n                            <input class="form-control" disabled="disabled" type="text" v-model="employee.address_1" id="address_1">\n                        </div>\n\n                        <label for="address_2" class="col-md-2 control-label">Address Street 2</label>\n                        <div class="col-md-4">\n                            <input class="form-control" disabled="disabled" name="address_2" type="text" v-model="employee.address_2" id="address_2">\n                        </div>\n                    </div>\n                    <!-- End - Address Street -->\n\n                    <!-- Start - City & Province -->\n                    <div class="form-group">\n                        <label for="address_city_id" class="col-md-2 control-label">City</label>\n                        <div class="col-md-4">\n                            <select v-model="employee.address_city_id" class="vue-chosen" disabled="disabled" options="cities_chosen" id="address_city_id" v-chosen="employee.address_city_id"></select>\n                        </div>\n\n                        <label for="address_province_id" class="col-md-2 control-label">Province</label>\n                        <div class="col-md-4">\n                            <select v-model="employee.address_province_id" class="vue-chosen" disabled="disabled" options="provinces_chosen" id="address_province_id" v-chosen="employee.address_province_id"></select>\n                        </div>\n                    </div>\n                    <!-- End - City & Province -->\n\n                    <!-- Start - Zip/Postal Code & Country -->\n                    <div class="form-group">\n                        <label for="address_postal_code" class="col-md-2 control-label" data-mask="9999">Zip/Postal Code</label>\n                        <div class="col-md-4">\n                            <input class="form-control" disabled="disabled" name="address_postal_code" type="text" v-model="employee.address_postal_code" id="address_postal_code">\n                        </div>\n                        <label for="address_country_id" class="col-md-2 control-label">Country</label>\n                        <div class="col-md-4">\n                            <select v-model="employee.address_country_id" class="vue-chosen" disabled="disabled" options="countries_chosen" id="address_country_id" v-chosen="employee.address_country_id"></select>\n                        </div>\n                    </div>\n                    <!-- End - Zip/Postal Code & Country -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Home & Mobile -->\n                    <div class="form-group">\n                        <label for="home_phone" class="col-md-2 control-label">Home Telephone</label>\n                        <div class="col-md-4">\n                            <input class="form-control" data-mask="099 999 9999" disabled="disabled" name="home_phone" type="text" v-model="employee.home_phone" id="home_phone">\n                        </div>\n\n                        <label for="mobile_phone" class="col-md-2 control-label">Mobile</label>\n                        <div class="col-md-4">\n                            <input class="form-control" data-mask="0999 999 9999" disabled="disabled" name="mobile_phone" type="text" v-model="employee.mobile_phone" id="mobile_phone">\n                        </div>\n                    </div>\n                    <!-- End - Home & Mobile -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Email -->\n                    <div class="form-group">\n                        <label for="work_email" class="col-md-2 control-label">Work Email</label>\n                        <div class="col-md-4">\n                            <input class="form-control" disabled="disabled" name="work_email" type="email" v-model="employee.work_email" id="work_email">\n                        </div>\n\n                        <label for="other_email" class="col-md-2 control-label">Other Email</label>\n                        <div class="col-md-4">\n                            <input class="form-control" disabled="disabled" name="other_email" type="email" v-model="employee.other_email" id="other_email">\n                        </div>\n                    </div>\n\n                    <div class="hr-line-dashed"></div>\n                    <!-- End - Email -->\n\n                    <!-- Start - Control Buttons -->\n                    <div class="form-group save-form" style="display:none;">\n                        <div class="col-sm-4 col-sm-offset-2">\n                            <a href="#0" class="btn btn-white btn-xs cancel-form" v-on="click: cancelForm">Cancel</a>\n                            <input class="btn btn-primary btn-xs" type="submit" v-on="click: submitForm" value="Save changes">\n                        </div>\n                    </div>\n                    <div class="form-group" v-if="has_access[permission + \'.update\']">\n                        <div class="col-sm-4 col-sm-offset-2">\n                            <a href="#0" class="btn btn-primary btn-xs modify-form" v-on="click: modifyForm">Modify</a>\n                        </div>\n                    </div>\n                    <!-- End - Control Buttons -->\n                </form>\n            </div>\n        </div>\n    </div>\n</div>\n\n';
},{}],12:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./contact-details.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Contact Details';
    },
    data: function data() {
        return {
            id: '',
            city: '',
            cities_chosen: [{}],
            province: '',
            provinces_chosen: [{}],
            country: '',
            countries_chosen: [{}]
        };
    },
    ready: function ready() {
        var self = this;
        this.queryDatabase();

        $("#address_province_id").change(function () {
            self.chosenCities();
        });
    },
    methods: {
        queryDatabase: function queryDatabase() {
            var self = this;

            if (this.$route.path.indexOf('/pim') > -1) {
                this.employee_id = this.$route.params.employee_id;
            } else {
                this.employee_id = localStorage.getItem('employee_id');
            }

            $.ajax({
                url: '/api/1.0/employee/get-by-employee-id',
                method: 'POST',
                data: { 'employee_id': this.employee_id },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                self.employee = response.data;

                self.chosenProvinces();
                self.chosenCountries();
            });
        },
        submitForm: function submitForm() {
            var self = this;

            // jasny bug work around
            $('#address_1').focus();

            $.ajax({
                url: '/api/1.0/profile/contact-details',
                method: 'PATCH',
                data: { 'id': this.id, 'employee': this.employee },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                switch (response.code) {
                    case 200:

                        if (self.$route.path.indexOf('/pim') > -1) {
                            self.$route.router.go({
                                name: 'pim-employee-list-contact-details',
                                params: { employee_id: response.data.employee.employee_id }
                            });
                        }

                        swal({ title: response.data.text, type: 'success', timer: 2000 });
                        self.cancelForm();
                        break;
                    case 405:
                        swal({ title: response.text, type: 'warning', timer: 2000 });
                        break;
                    case 500:
                        $('#first_name').focus();
                        swal({ title: response.text, type: 'error', timer: 2000 });
                        break;
                }
            });
        },
        modifyForm: function modifyForm() {

            $('.save-form').css('display', '');
            $('.modify-form').css('display', 'none');
            $('.vue-chosen').prop('disabled', false).trigger("chosen:updated");
            $('.form-control').prop('disabled', false);

            $('#address_1').focus();
        },
        cancelForm: function cancelForm() {
            // retrieve original data since cancel button was pressed.
            this.queryDatabase();

            $('.save-form').css('display', 'none');
            $('.modify-form').css('display', '');
            $('.vue-chosen').prop('disabled', true).trigger("chosen:updated");
            $('.form-control').prop('disabled', true);
        },
        chosenProvinces: function chosenProvinces() {

            var self = this;

            // retrieve provinces
            $.ajax({ url: '/api/1.0/provinces', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.provinces_chosen = response.data;
                }
                self.province = self.employee.address_province_id;

                // watcher for chosen
                var provincesChosenWatcher = setInterval(function () {
                    if (self.employee.address_province_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        self.chosenCities();
                        clearInterval(provincesChosenWatcher);
                    }
                }, 1);
            });
        },
        chosenCountries: function chosenCountries() {

            var self = this;

            // retrieve countries
            $.ajax({ url: '/api/1.0/countries', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.countries_chosen = response.data;
                }
                self.country = self.employee.address_country_id;

                // watcher for chosen
                var countriesChosenWatcher = setInterval(function () {
                    if (self.employee.address_country_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        clearInterval(countriesChosenWatcher);
                    }
                }, 1);
            });
        },
        chosenCities: function chosenCities() {
            var self = this;

            // retrieve cities
            $.ajax({
                url: '/api/1.0/cities',
                method: 'GET',
                data: { 'province_id': self.employee.address_province_id }
            }).done(function (response) {
                if (response.data) {
                    self.cities_chosen = response.data;
                }
                self.city = self.employee.address_city_id;

                // watcher for chosen
                var citiesChosenWatcher = setInterval(function () {
                    if (self.employee.address_province_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        $('#address_city_id').trigger('chosen:open');
                        clearInterval(citiesChosenWatcher);
                    }
                }, 1);
            });
        }
    }
};

},{"./contact-details.html":11}],13:[function(require,module,exports){
module.exports = '<div class="row">\n    <navbar-static-profile-top></navbar-static-profile-top>\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Assigned Dependents</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n            <div class="ibox-content">\n\n                <div class="">\n                    <a id="add_dependent" v-if="has_access[permission + \'.create\']" v-on="click: toggleModal" href="javascript:void(0);" class="btn btn-primary btn-xs">Add a new row</a>\n                </div>\n                <div class="table-responsive">\n                    <table class="table table-striped">\n                        <thead>\n                        <tr>\n                            <th>Full Name</th>\n                            <th>Relationship</th>\n                            <th>Birth Date</th>\n                            <th class="fix-width">Action</th>\n                        </tr>\n                        </thead>\n\n                        <tbody id="dependents_body">\n\n                        <tr v-repeat="dependent in dependents" class="item-{{$index}}">\n                            {{$index}}\n                            <td>{{dependent.first_name + \' \' + dependent.last_name}}</td>\n                            <td>{{relationships[dependent.relationship_id]}}</td>\n                            <td>{{dependent.birth_date.substring(0, 10)}}</td>\n                            <td>\n                                <button rel="edit" id="edit_{{dependent.id}}" v-if="has_access[permission + \'.update\']" class="btn btn-primary btn-xs btn-warning" data-toggle="tooltip" data-placement="bottom" title="" type="button" v-on="click: editRecord(dependent, $index)" data-original-title="Edit"><i class="fa fa-edit"></i></button>\n                                <button rel="delete" id="delete_{{dependent.id}}" v-if="has_access[permission + \'.delete\']" class="btn btn-primary btn-xs btn-danger" data-toggle="tooltip" data-placement="bottom" title="" type="button" v-on="click: deleteRecord(dependent, $index)" data-original-title="Delete"><i class="fa fa-times"></i></button>\n                            </td>\n                        </tr>\n                        <tr v-if="dependents.length == 0">\n                            <td colspan="4">No dependents listed.</td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        </div>\n    </div>\n    <!-- Modal -->\n    <div class="modal fade" id="dependent_modal">\n        <div class="modal-dialog">\n            <div class="modal-content">\n                <div class="modal-header">\n                    <button class="close" data-dismiss="modal" type="button">&times;</button>\n\n                    <h4 class="modal-title" id="my_modal_label">Dependent Details</h4>\n                </div>\n\n                <div class="modal-body">\n                    <!--Add form-->\n                    <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal" id="dependentsForm">\n                        <input type="hidden" v-model="modal.dependent_id">\n                        <div class="form-group">\n                            <label for="first_name" class="col-md-3 control-label">First Name</label>\n                            <div class="col-md-9">\n                                <input class="form-control" required="required" v-model="modal.first_name" type="text" id="first_name">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="middle_name" class="col-md-3 control-label">Middle Name</label>\n                            <div class="col-md-9">\n                                <input class="form-control" v-model="modal.middle_name" type="text" id="middle_name">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="last_name" class="col-md-3 control-label">Last Name</label>\n                            <div class="col-md-9">\n                                <input class="form-control" required="required" v-model="modal.last_name" type="text" id="last_name">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="relationship_id" class="col-md-3 control-label">Relationship</label>\n                            <div class="col-md-9">\n                                <select v-model="modal.relationship" class="vue-chosen" options="modal.relationships_chosen" id="relationship_id" v-chosen="modal.relationship"></select>\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="birth_date" class="col-md-3 control-label">Birth Date</label>\n                            <div class="col-md-9" id="datepicker">\n                                <div class="input-group date">\n                                    <span class="input-group-addon"><i class="fa fa-calendar"></i></span>\n                                    <input class="form-control" data-mask="9999-99-99" v-model="modal.birth_date" type="text" id="birth_date">\n                                </div>\n                            </div>\n                        </div>\n\n                        <div class="modal-footer">\n                            <button class="btn btn-white btn-xs" data-dismiss="modal" type="button">Close</button>\n                            <input class="btn btn-primary btn-xs" type="submit" v-on="click: submitForm" value="Save changes">\n                        </div>\n\n                    </form><!--// form-->\n                </div>\n            </div><!-- /.modal-content -->\n        </div><!-- /.modal-dialog -->\n    </div><!-- /.modal -->\n</div>\n\n';
},{}],14:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./dependents.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Dependents';
    },
    data: function data() {
        return {
            editMode: false,
            employee_id: '',
            dependents: [],
            relationships: [],
            modal: {
                first_name: '',
                middle_name: '',
                last_name: '',
                relationship_id: '',
                relationships_chosen: [{}],
                relationship: '',
                birth_date: '',
                dependent_id: 0
            }
        };
    },

    ready: function ready() {

        var self = this;

        this.queryDatabase();
        this.chosenRelationships();
    },
    methods: {
        queryDatabase: function queryDatabase() {
            var self = this;

            if (this.$route.path.indexOf('/pim') > -1) {
                this.employee_id = this.$route.params.employee_id;
            } else {
                this.employee_id = localStorage.getItem('employee_id');
            }

            $.ajax({
                url: '/api/1.0/employee/get-by-employee-id',
                method: 'POST',
                data: { 'employee_id': this.employee_id },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                self.employee = response.data;
                self.employee.id = response.data.id;
                self.dependents = response.data.dependents;

                $.ajax({
                    url: '/api/1.0/relationships', method: 'GET', data: { 'table_view': true }
                }).done(function (response) {
                    self.relationships = response.data;
                });
            });
        },
        toggleModal: function toggleModal() {

            this.editMode = false;

            $('#first_name').val('');
            $('#middle_name').val('');
            $('#last_name').val('');
            $('#relationship_id').val(0);
            $('#birth_date').val('');

            // datepicker for birth_date
            $('.input-group.date').datepicker({
                format: 'yyyy-mm-dd',
                keyboardNavigation: false,
                forceParse: true,
                calendarWeeks: true,
                autoclose: true,
                clearBtn: true
            });

            $('#dependent_modal').modal('toggle');
            $('#dependent_modal').on('shown.bs.modal', function () {
                $('#first_name').focus();
            });
        },
        submitForm: function submitForm() {

            var self = this;

            // jasny bug work around
            $('#first_name').focus();

            self.modal.employee_id = self.employee.id;
            self.modal.relationship_id = self.modal.relationship;

            if (self.modal.birth_date != null) {
                self.modal.birth_date = self.modal.birth_date.substring(0, 10);
            }

            if (self.modal.relationship_id && self.modal.first_name && self.modal.last_name) {
                $.ajax({
                    url: '/api/1.0/profile/dependents',
                    method: self.editMode ? 'PATCH' : 'POST',
                    data: self.modal,
                    beforeSend: function beforeSend(xhr) {
                        xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                    }
                }).done(function (response) {
                    switch (response.code) {
                        case 200:
                            $('#dependent_modal').modal('toggle');
                            if (self.editMode) {
                                self.updateRowInTable();
                                swal({ title: response.text, type: 'success', timer: 2000 });
                            } else {
                                self.dependents.push(response.data.dependent);
                                swal({ title: response.data.text, type: 'success', timer: 2000 });
                            }
                            break;
                        case 500:
                            swal({ title: response.text, type: 'error', timer: 2000 });
                            break;
                    }
                });
            } else {
                $('#dependent_modal').on('shown.bs.modal', function () {
                    $('.vue-chosen', this).trigger('chosen:open');
                });
            }
        },
        updateRowInTable: function updateRowInTable() {
            this.dependents[this.editIndex].first_name = this.modal.first_name;
            this.dependents[this.editIndex].middle_name = this.modal.middle_name;
            this.dependents[this.editIndex].last_name = this.modal.last_name;
            this.dependents[this.editIndex].relationship_id = this.modal.relationship_id;
            this.dependents[this.editIndex].birth_date = this.modal.birth_date;
        },
        editRecord: function editRecord(dependent, index) {
            var self = this;

            this.editMode = true;
            this.editIndex = index;

            self.assignValuesToModal(dependent);

            $('#dependent_modal').modal('toggle');

            $('#dependent_modal').on('shown.bs.modal', function () {
                $('.vue-chosen', this).trigger('chosen:update');
            });

            $('#first_name').focus();
        },
        deleteRecord: function deleteRecord(dependent, index) {
            var self = this;

            var previousWindowKeyDown = window.onkeydown; // https://github.com/t4t5/sweetalert/issues/127
            swal({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record!',
                showCancelButton: true,
                cancelButtonColor: '#d33',
                type: 'warning',
                confirmButtonClass: 'confirm-class',
                cancelButtonClass: 'cancel-class',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                swal.disableButtons();
                window.onkeydown = previousWindowKeyDown; // https://github.com/t4t5/sweetalert/issues/127
                if (isConfirm) {
                    $.ajax({
                        url: '/api/1.0/profile/dependents',
                        method: 'DELETE',
                        data: { id: dependent.id },
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({ title: response.text, type: 'success', timer: 2000 });
                                self.dependents.splice(index, 1);
                                break;
                            case 500:
                                swal({ title: response.text, type: 'error', timer: 2000 });
                                break;
                        }
                    });
                } else {
                    swal('Cancelled', 'No record has been deleted', 'error');
                }
            });
        },
        assignValuesToModal: function assignValuesToModal(dependent) {
            this.modal.dependent_id = dependent.id;
            this.modal.first_name = dependent.first_name;
            this.modal.middle_name = dependent.middle_name;
            this.modal.last_name = dependent.last_name;
            this.modal.relationship_id = dependent.relationship_id;
            this.modal.relationship = dependent.relationship = this.modal.relationship_id;
            this.modal.birth_date = dependent.birth_date.substring(0, 10);
        },
        chosenRelationships: function chosenRelationships() {

            var self = this;

            // retrieve relationships
            $.ajax({ url: '/api/1.0/relationships', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.modal.relationships_chosen = response.data;
                }

                // watcher for chosen
                var relationshipsChosenWatcher = setInterval(function () {
                    $('.vue-chosen').trigger("chosen:updated");
                    clearInterval(relationshipsChosenWatcher);
                }, 1000);
            });
        }
    }
};

},{"./dependents.html":13}],15:[function(require,module,exports){
module.exports = '<div class="row">\n    <navbar-static-profile-top></navbar-static-profile-top>\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>In case of Emergency</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n            <div class="ibox-content">\n\n                <div class="">\n                    <a id="add_emergency_contact" v-if="has_access[permission + \'.create\']" v-on="click: toggleModal" href="javascript:void(0);" class="btn btn-primary btn-xs">Add a new row</a>\n                </div>\n                <div class="table-responsive">\n                    <table class="table table-striped">\n                        <thead>\n                        <tr>\n                            <th>Full Name</th>\n                            <th>Relationship</th>\n                            <th>Home Telephone</th>\n                            <th>Mobile</th>\n                            <th class="fix-width">Action</th>\n                        </tr>\n                        </thead>\n\n                        <tbody id="emergency_contacts_body">\n\n                        <tr v-repeat="emergency_contact in emergency_contacts" class="item-{{$index}}">\n                            {{$index}}\n                            <td>{{emergency_contact.first_name + \' \' + emergency_contact.last_name}}</td>\n                            <td>{{relationships[emergency_contact.relationship_id]}}</td>\n                            <td>{{emergency_contact.home_phone}}</td>\n                            <td>{{emergency_contact.mobile_phone}}</td>\n                            <td>\n                                <button rel="edit" id="edit_{{emergency_contact.id}}" v-if="has_access[permission + \'.update\']" class="btn btn-primary btn-xs btn-warning" data-toggle="tooltip" data-placement="bottom" title="" type="button" v-on="click: editRecord(emergency_contact, $index)" data-original-title="Edit"><i class="fa fa-edit"></i></button>\n                                <button rel="delete" id="delete_{{emergency_contact.id}}" v-if="has_access[permission + \'.delete\']" class="btn btn-primary btn-xs btn-danger" data-toggle="tooltip" data-placement="bottom" title="" type="button" v-on="click: deleteRecord(emergency_contact, $index)" data-original-title="Delete"><i class="fa fa-times"></i></button>\n                            </td>\n                        </tr>\n                        <tr v-if="emergency_contacts.length == 0">\n                            <td colspan="5">No emergency contacts listed</td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        </div>\n    </div>\n    <!-- Modal -->\n    <div class="modal fade" id="emergency_contact_modal">\n        <div class="modal-dialog">\n            <div class="modal-content">\n                <div class="modal-header">\n                    <button class="close" data-dismiss="modal" type="button">&times;</button>\n\n                    <h4 class="modal-title" id="my_modal_label">Emergency Contact Details</h4>\n                </div>\n\n                <div class="modal-body">\n                    <!--Add form-->\n                    <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal" id="emergencyContactsForm">\n                        <input type="hidden" v-model="modal.emergency_contact_id">\n                        <div class="form-group">\n                            <label for="first_name" class="col-md-3 control-label">First Name</label>\n                            <div class="col-md-9">\n                                <input class="form-control" required="required" v-model="modal.first_name" type="text" id="first_name">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="middle_name" class="col-md-3 control-label">Middle Name</label>\n                            <div class="col-md-9">\n                                <input class="form-control" v-model="modal.middle_name" type="text" id="middle_name">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="last_name" class="col-md-3 control-label">Last Name</label>\n                            <div class="col-md-9">\n                                <input class="form-control" required="required" v-model="modal.last_name" type="text" id="last_name">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="relationship_id" class="col-md-3 control-label">Relationship</label>\n                            <div class="col-md-9">\n                                <select v-model="modal.relationship" class="vue-chosen" options="modal.relationships_chosen" id="relationship_id" v-chosen="modal.relationship"></select>\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="mobile_phone" class="col-md-3 control-label">Mobile</label>\n                            <div class="col-md-9">\n                                <input class="form-control" data-mask="0999 999 9999" v-model="modal.mobile_phone" type="text" id="mobile_phone">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="home_phone" class="col-md-3 control-label">Home Telephone</label>\n                            <div class="col-md-9">\n                                <input class="form-control" data-mask="099 999 9999" v-model="modal.home_phone" type="text" id="home_phone">\n                            </div>\n                        </div>\n\n                        <div class="modal-footer">\n                            <button class="btn btn-white btn-xs" data-dismiss="modal" type="button">Close</button>\n                            <input class="btn btn-primary btn-xs" type="submit" v-on="click: submitForm" value="Save changes">\n                        </div>\n\n                    </form><!--// form-->\n                </div>\n            </div><!-- /.modal-content -->\n        </div><!-- /.modal-dialog -->\n    </div><!-- /.modal -->\n</div>\n\n';
},{}],16:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./emergency-contacts.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Emergency Contacts';
    },
    data: function data() {
        return {
            editMode: false,
            employee_id: '',
            emergency_contacts: [],
            relationships: [],
            modal: {
                first_name: '',
                middle_name: '',
                last_name: '',
                relationship_id: '',
                relationships_chosen: [{}],
                relationship: '',
                home_phone: '',
                mobile_phone: '',
                emergency_contact_id: 0
            }
        };
    },
    ready: function ready() {
        this.queryDatabase();
        this.chosenRelationships();

        $("#emergencyContactsForm").submit(function (e) {
            return false;
        });
    },
    methods: {
        queryDatabase: function queryDatabase() {
            var self = this;

            if (this.$route.path.indexOf('/pim') > -1) {
                this.employee_id = this.$route.params.employee_id;
            } else {
                this.employee_id = localStorage.getItem('employee_id');
            }

            $.ajax({
                url: '/api/1.0/employee/get-by-employee-id',
                method: 'POST',
                data: { 'employee_id': this.employee_id },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                self.employee = response.data;
                self.employee.id = response.data.id;
                self.emergency_contacts = response.data.emergency_contacts;

                $.ajax({
                    url: '/api/1.0/relationships', method: 'GET', data: { 'table_view': true }
                }).done(function (response) {
                    self.relationships = response.data;
                });
            });
        },
        toggleModal: function toggleModal() {

            this.editMode = false;

            $('#first_name').val('');
            $('#middle_name').val('');
            $('#last_name').val('');
            $('#relationship_id').val(0);
            $('#home_phone').val('');
            $('#mobile_phone').val('');

            $('#emergency_contact_modal').modal('toggle');
            $('#emergency_contact_modal').on('shown.bs.modal', function () {
                $('#first_name').focus();
            });
        },
        submitForm: function submitForm() {

            var self = this;

            // jasny bug work around
            $('#first_name').focus();

            self.modal.employee_id = self.employee.id;
            self.modal.relationship_id = self.modal.relationship;

            if (self.modal.relationship_id && self.modal.first_name && self.modal.last_name) {
                $.ajax({
                    url: '/api/1.0/profile/emergency-contacts',
                    method: self.editMode ? 'PATCH' : 'POST',
                    data: self.modal,
                    beforeSend: function beforeSend(xhr) {
                        xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                    }
                }).done(function (response) {
                    switch (response.code) {
                        case 200:
                            $('#emergency_contact_modal').modal('toggle');
                            if (self.editMode) {
                                self.updateRowInTable();
                                swal({ title: response.text, type: 'success', timer: 2000 });
                            } else {
                                self.emergency_contacts.push(response.data.emergency_contact);
                                swal({ title: response.data.text, type: 'success', timer: 2000 });
                            }
                            break;
                        case 500:
                            swal({ title: response.text, type: 'error', timer: 2000 });
                            break;
                    }
                });
            } else {
                $('#emergency_contact_modal').on('shown.bs.modal', function () {
                    $('.vue-chosen', this).trigger('chosen:open');
                });
            }
        },
        updateRowInTable: function updateRowInTable() {
            console.log(this.editIndex);
            console.log(this.emergency_contacts[0].first_name);
            //this.emergency_contacts[self.editIndex].id = this.modal.id;
            this.emergency_contacts[this.editIndex].first_name = this.modal.first_name;
            this.emergency_contacts[this.editIndex].middle_name = this.modal.middle_name;
            this.emergency_contacts[this.editIndex].last_name = this.modal.last_name;
            this.emergency_contacts[this.editIndex].relationship_id = this.modal.relationship_id;
            this.emergency_contacts[this.editIndex].home_phone = this.modal.home_phone;
            this.emergency_contacts[this.editIndex].mobile_phone = this.modal.mobile_phone;
        },
        editRecord: function editRecord(emergency_contact, index) {
            var self = this;

            this.editMode = true;
            this.editIndex = index;

            self.assignValuesToModal(emergency_contact);

            $('#emergency_contact_modal').modal('toggle');

            $('#emergency_contact_modal').on('shown.bs.modal', function () {
                $('.vue-chosen', this).trigger('chosen:update');
            });

            $('#first_name').focus();
        },
        deleteRecord: function deleteRecord(emergency_contact, index) {
            var self = this;

            var previousWindowKeyDown = window.onkeydown; // https://github.com/t4t5/sweetalert/issues/127
            swal({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record!',
                showCancelButton: true,
                cancelButtonColor: '#d33',
                type: 'warning',
                confirmButtonClass: 'confirm-class',
                cancelButtonClass: 'cancel-class',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                swal.disableButtons();
                window.onkeydown = previousWindowKeyDown; // https://github.com/t4t5/sweetalert/issues/127
                if (isConfirm) {
                    $.ajax({
                        url: '/api/1.0/profile/emergency-contacts',
                        method: 'DELETE',
                        data: { id: emergency_contact.id },
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({ title: response.text, type: 'success', timer: 2000 });
                                self.emergency_contacts.splice(index, 1);
                                break;
                            case 500:
                                swal({ title: response.text, type: 'error', timer: 2000 });
                                break;
                        }
                    });
                } else {
                    swal('Cancelled', 'No record has been deleted', 'error');
                }
            });
        },
        assignValuesToModal: function assignValuesToModal(emergency_contact) {
            this.modal.emergency_contact_id = emergency_contact.id;
            this.modal.first_name = emergency_contact.first_name;
            this.modal.middle_name = emergency_contact.middle_name;
            this.modal.last_name = emergency_contact.last_name;
            this.modal.relationship_id = emergency_contact.relationship_id;
            this.modal.relationship = emergency_contact.relationship = this.modal.relationship_id;
            this.modal.home_phone = emergency_contact.home_phone;
            this.modal.mobile_phone = emergency_contact.mobile_phone;
        },
        chosenRelationships: function chosenRelationships() {

            var self = this;

            // retrieve relationships
            $.ajax({ url: '/api/1.0/relationships', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.modal.relationships_chosen = response.data;
                }

                // watcher for chosen
                var relationshipsChosenWatcher = setInterval(function () {
                    $('.vue-chosen').trigger("chosen:updated");
                    clearInterval(relationshipsChosenWatcher);
                }, 1000);
            });
        }
    }
};

},{"./emergency-contacts.html":15}],17:[function(require,module,exports){
module.exports = '<div class="row">\n    <navbar-static-profile-top></navbar-static-profile-top>\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Job Details</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n            <div class="ibox-content">\n                <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal">\n                    <input name="employee_id" type="hidden" v-model="employee.id">\n\n                    <!-- Start - Job Details -->\n                    <div class="form-group">\n                        <label for="job_title_id" class="col-md-2 control-label">Job Title</label>\n                        <div class="col-sm-4">\n                            <select v-model="employee.job_history.job_title_id" class="vue-chosen" disabled="disabled" options="job_titles_chosen" id="job_title_id" v-chosen="employee.job_history.job_title_id"></select>\n                        </div>\n\n                        <label for="employment_status_id" class="col-md-2 control-label">Employment Status</label>\n                        <div class="col-sm-4">\n                            <select v-model="employee.job_history.employment_status_id" class="vue-chosen" disabled="disabled" options="employment_statuses_chosen" id="employment_status_id" v-chosen="employee.job_history.employment_status_id"></select>\n                        </div>\n                    </div>\n\n                    <div class="form-group">\n                        <label for="department_id" class="col-md-2 control-label">Department</label>\n                        <div class="col-sm-4">\n                            <select v-model="employee.job_history.department_id" class="vue-chosen" disabled="disabled" options="departments_chosen" id="department_id" v-chosen="employee.job_history.department_id"></select>\n                        </div>\n\n                        <label for="effective_date" class="col-md-2 control-label">Effective Date</label>\n                        <div class="col-sm-4" id="datepicker_effective_date">\n                            <div class="input-group date">\n                                <span class="input-group-addon"><i class="fa fa-calendar"></i></span><input class="form-control" data-mask="9999-99-99" disabled="disabled" name="effective_date" type="text" v-model="employee.job_history.effective_date" id="effective_date">\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class="form-group">\n                        <label for="location_id" class="col-md-2 control-label">Location</label>\n                        <div class="col-sm-4">\n                            <select v-model="employee.job_history.location_id" class="vue-chosen" disabled="disabled" options="locations_chosen" id="location_id" v-chosen="employee.job_history.location_id"></select>\n                        </div>\n                    </div>\n\n                    <div class="form-group">\n                        <label for="comments" class="col-md-2 control-label">Comments</label>\n                        <div class="col-sm-10">\n                            <textarea class="form-control form-fields" rows="3" disabled="disabled" style="resize:vertical;" name="comments" v-model="employee.job_history.comments" id="comments" cols="50"></textarea>\n                        </div>\n                    </div>\n                    <!-- End - Job Details -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Employment Commencement -->\n                    <h4>Employment Commencement</h4><br>\n                    <div class="form-group">\n                        <label for="joined_date" class="col-md-2 control-label">Joined Date</label>\n                        <div class="col-md-4" id="datepicker_joined_date">\n                            <div class="input-group date">\n                                <span class="input-group-addon"><i class="fa fa-calendar"></i></span><input class="form-control" data-mask="9999-99-99" disabled="disabled" name="joined_date" type="text" v-model="employee.joined_date" id="joined_date">\n                            </div>\n                        </div>\n\n                        <label for="probation_end_date" class="col-md-2 control-label">Probation End Date</label>\n                        <div class="col-md-4" id="datepicker_probation_end_date">\n                            <div class="input-group date">\n                                <span class="input-group-addon"><i class="fa fa-calendar"></i></span><input class="form-control" data-mask="9999-99-99" disabled="disabled" name="probation_end_date" type="text" v-model="employee.probation_end_date" id="probation_end_date">\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class="form-group">\n                        <label for="permanency_date" class="col-md-2 control-label">Date of Permanency</label>\n                        <div class="col-md-4" id="datepicker_permanency_date">\n                            <div class="input-group date">\n                                <span class="input-group-addon"><i class="fa fa-calendar"></i></span><input class="form-control" data-mask="9999-99-99" disabled="disabled" name="permanency_date" type="text" v-model="employee.permanency_date" id="permanency_date">\n                            </div>\n                        </div>\n                    </div>\n                    <!-- End - Employment Commencement -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Control Buttons -->\n                    <div class="form-group save-form" style="display:none;">\n                        <div class="col-sm-4 col-sm-offset-2">\n                            <a href="#0" class="btn btn-white btn-xs cancel-form" v-on="click: cancelForm">Cancel</a>\n                            <input class="btn btn-primary btn-xs" type="submit" v-on="click: submitForm" value="Save changes">\n                        </div>\n                    </div>\n                    <div class="form-group" v-if="has_access[permission + \'.update\']">\n                        <div class="col-sm-4 col-sm-offset-2">\n                            <a href="#0" class="btn btn-primary btn-xs modify-form" v-on="click: modifyForm">Modify</a>\n                        </div>\n                    </div>\n                    <!-- End - Control Buttons -->\n                </form>\n            </div>\n        </div>\n    </div>\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Job History</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n            <div class="ibox-content">\n\n                <div class="table-responsive">\n                    <table class="table table-striped">\n                        <thead>\n                        <tr>\n                            <th>Job Title</th>\n                            <th>Department</th>\n                            <th>Effective Date</th>\n                            <th>Employment Status</th>\n                            <th>Location</th>\n                            <th>Comments</th>\n                            <th class="fix-width">Action</th>\n                        </tr>\n                        </thead>\n\n                        <tbody id="job_histories_body">\n\n                        <tr v-repeat="job_history in job_histories" class="job_histories_list" id="job_history_1">\n\n                            <td v-if="job_titles_chosen[job_history.job_title_id-1]">{{job_titles_chosen[job_history.job_title_id-1].text}}</td>\n                            <td v-if="departments_chosen[job_history.department_id-1]">{{departments_chosen[job_history.department_id-1].text}}</td>\n                            <td>{{job_history.effective_date ? job_history.effective_date.slice(0,10) : \'\'}}</td>\n                            <td v-if="employment_statuses_chosen[job_history.employment_status_id-1]"><span class="label {{employment_statuses_chosen[job_history.employment_status_id-1].class}}">{{employment_statuses_chosen[job_history.employment_status_id-1].text}}</span></td>\n                            <td v-if="employment_statuses_chosen[job_history.location_id-1]">{{locations_chosen[job_history.location_id-1].text}}</td>\n                            <td>{{job_history.comments}}</td>\n                            <td>\n                                <button v-if="job_histories.length > 1" rel="delete" id="delete_{{job_history.id}}" v-if="has_access[permission + \'.delete\']" class="btn btn-primary btn-xs btn-danger" data-toggle="tooltip" data-placement="bottom" title="" type="button" v-on="click: deleteRecord(job_history, $index)" data-original-title="Delete"><i class="fa fa-times"></i></button>\n                            </td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n';
},{}],18:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./job.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Job Details';
    },
    data: function data() {
        return {
            id: '',
            job_title: '',
            job_titles_chosen: [{}],
            employment_status: '',
            employment_statuses_chosen: [{}],
            department: '',
            departments_chosen: [{}],
            location: '',
            locations_chosen: [{}],
            original_employee_id: '',
            job_histories: [{}]
        };
    },
    ready: function ready() {
        this.queryDatabase();
    },
    methods: {
        queryDatabase: function queryDatabase() {
            var self = this;

            if (this.$route.path.indexOf('/pim') > -1) {
                this.employee_id = this.$route.params.employee_id;
            } else {
                this.employee_id = localStorage.getItem('employee_id');
            }

            $.ajax({
                url: '/api/1.0/employee/get-by-employee-id',
                method: 'POST',
                data: { 'employee_id': this.employee_id },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                self.employee = response.data;
                self.original_employee_id = response.data.employee_id;

                self.job_histories = self.employee.job_histories;

                self.setDatepickerValues();
                self.chosenJobTitles();
                self.chosenEmploymentStatuses();
                self.chosenDepartments();
                self.chosenLocations();
            });
        },
        deleteRecord: function deleteRecord(job_history, index) {
            var self = this;

            var previousWindowKeyDown = window.onkeydown; // https://github.com/t4t5/sweetalert/issues/127
            swal({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record!',
                showCancelButton: true,
                cancelButtonColor: '#d33',
                type: 'warning',
                confirmButtonClass: 'confirm-class',
                cancelButtonClass: 'cancel-class',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                swal.disableButtons();
                window.onkeydown = previousWindowKeyDown; // https://github.com/t4t5/sweetalert/issues/127
                if (isConfirm) {
                    $.ajax({
                        url: '/api/1.0/profile/job',
                        method: 'DELETE',
                        data: { id: job_history.id },
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({ title: response.text, type: 'success', timer: 2000 });
                                self.job_histories.splice(index, 1);
                                self.setCurrentJobHistory();
                                break;
                            case 500:
                                swal({ title: response.text, type: 'error', timer: 2000 });
                                break;
                        }
                    });
                } else {
                    swal('Cancelled', 'No record has been deleted', 'error');
                }
            });
        },
        setCurrentJobHistory: function setCurrentJobHistory() {
            var self = this;

            var current_job_history = self.job_histories[0];

            self.employee.job_history.job_title_id = current_job_history.job_title_id;
            self.employee.job_history.department_id = current_job_history.department_id;
            self.employee.job_history.employment_status_id = current_job_history.employment_status_id;
            self.employee.job_history.work_shift_id = current_job_history.work_shift_id;
            self.employee.job_history.location_id = current_job_history.location_id;
            self.employee.job_history.effective_date = current_job_history.effective_date;
            self.employee.job_history.comments = current_job_history.comments;
        },
        setDatepickerValues: function setDatepickerValues() {

            if (this.employee.job_history.effective_date) {
                this.employee.job_history.effective_date = this.employee.job_history.effective_date.substring(0, 10);
            }

            if (this.employee.joined_date) {
                this.employee.joined_date = this.employee.joined_date.substring(0, 10);
            }

            if (this.employee.probation_end_date) {
                this.employee.probation_end_date = this.employee.probation_end_date.substring(0, 10);
            }

            if (this.employee.permanency_date) {
                this.employee.permanency_date = this.employee.permanency_date.substring(0, 10);
            }
        },
        modifyForm: function modifyForm() {

            $('.save-form').css('display', '');
            $('.modify-form').css('display', 'none');
            $('.vue-chosen').prop('disabled', false).trigger("chosen:updated");
            $('.form-control').prop('disabled', false);
            $('.i-checks').iCheck('enable');

            this.toggleDatepickers(true);

            $('#first_name').focus();
        },
        cancelForm: function cancelForm() {
            // retrieve original data since cancel button was pressed.
            this.queryDatabase();

            $('.save-form').css('display', 'none');
            $('.modify-form').css('display', '');
            $('.vue-chosen').prop('disabled', true).trigger("chosen:updated");
            $('.form-control').prop('disabled', true);

            this.toggleDatepickers(false);
        },
        chosenJobTitles: function chosenJobTitles() {
            var self = this;

            // retrieve job-titles
            $.ajax({ url: '/api/1.0/job-titles', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.job_titles_chosen = response.data;
                }
                self.job_title = self.employee.job_histories[0].job_title_id;

                // watcher for chosen
                var jobTitlesChosenWatcher = setInterval(function () {
                    if (self.employee.job_histories[0].job_title_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        clearInterval(jobTitlesChosenWatcher);
                    }
                }, 1);
            });
        },
        chosenEmploymentStatuses: function chosenEmploymentStatuses() {
            var self = this;

            // retrieve employment-statuses
            $.ajax({ url: '/api/1.0/employment-statuses', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.employment_statuses_chosen = response.data;
                }
                self.employment_status = self.employee.job_histories[0].employment_status_id;

                // watcher for chosen
                var employmentStatusesChosenWatcher = setInterval(function () {
                    if (self.employee.job_histories[0].employment_status_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        clearInterval(employmentStatusesChosenWatcher);
                    }
                }, 1);
            });
        },
        chosenDepartments: function chosenDepartments() {
            var self = this;

            // retrieve departments
            $.ajax({ url: '/api/1.0/departments', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.departments_chosen = response.data;
                }
                self.department = self.employee.job_histories[0].department_id;

                // watcher for chosen
                var departmentsChosenWatcher = setInterval(function () {
                    if (self.employee.job_histories[0].department_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        clearInterval(departmentsChosenWatcher);
                    }
                }, 1);
            });
        },
        chosenLocations: function chosenLocations() {
            var self = this;

            // retrieve locations
            $.ajax({ url: '/api/1.0/locations', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.locations_chosen = response.data;
                }
                self.location = self.employee.job_histories[0].location_id;

                // watcher for chosen
                var locationsChosenWatcher = setInterval(function () {
                    if (self.employee.job_histories[0].location_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        clearInterval(locationsChosenWatcher);
                    }
                }, 1);
            });
        },
        toggleDatepickers: function toggleDatepickers(enable) {

            if (enable) {
                $('.input-group.date').datepicker({
                    format: 'yyyy-mm-dd',
                    keyboardNavigation: false,
                    forceParse: true,
                    calendarWeeks: true,
                    autoclose: true,
                    clearBtn: true
                });

                $('#datepicker_effective_date .input-group.date').datepicker('update', this.employee.job_history.effective_date);
                $('#datepicker_joined_date .input-group.date').datepicker('update', this.employee.joined_date);
                $('#datepicker_probation_end_date .input-group.date').datepicker('update', this.employee.probation_end_date);
                $('#datepicker_permanency_date .input-group.date').datepicker('update', this.employee.permanency_date);
            } else {
                $('#datepicker_effective_date .input-group.date').datepicker('remove');
                $('#datepicker_joined_date .input-group.date').datepicker('remove');
                $('#datepicker_probation_end_date .input-group.date').datepicker('remove');
                $('#datepicker_permanency_date .input-group.date').datepicker('remove');
            }
        },
        submitForm: function submitForm() {
            var self = this;

            // jasny bug work around
            $('#comments').focus();

            if (!self.employee.job_history.effective_date) {
                swal({ title: 'Effective Date is a required field', type: 'error', timer: 2000 });
                //$('#effective_date').focus();
                return false;
            }

            $.ajax({
                url: '/api/1.0/profile/job',
                method: 'PATCH',
                data: { 'id': this.id, 'employee': this.employee },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                switch (response.code) {
                    case 200:
                        if (response.code.job_history) {
                            self.job_histories.unshift(response.code.job_history);
                        }
                        swal({ title: response.data.text, type: 'success', timer: 2000 });
                        self.cancelForm();
                        break;
                    case 405:
                        swal({ title: response.text, type: 'warning', timer: 2000 });
                        break;
                    case 500:
                        $('#first_name').focus();
                        swal({ title: response.text, type: 'error', timer: 2000 });
                        break;
                }
            });
        }
    }
};

},{"./job.html":17}],19:[function(require,module,exports){
module.exports = '<div class="row">\n    <navbar-static-profile-top></navbar-static-profile-top>\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Personal Details</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n            <div class="ibox-content">\n                <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal" id="personalDetailsForm">\n                    <input name="user[id]" type="hidden" v-model="employee.user.id">\n                    <input name="id" type="hidden" v-model="employee.id">\n                    <!-- Start - Full Name -->\n                    <div class="form-group">\n                        <label for="first_name" class="col-md-2 control-label">Full Name</label>\n                        <div class="col-md-4">\n                            <input class="form-control" disabled="disabled" type="text" v-model="employee.first_name" id="first_name" required="required">\n                            <span class="help-block m-b-none">First Name</span>\n                        </div>\n                        <div class="col-md-2">\n                            <input class="form-control" disabled="disabled" type="text" v-model="employee.middle_name" id="middle_name">\n                            <span class="help-block m-b-none">Middle Name</span>\n                        </div>\n                        <div class="col-md-4">\n                            <input class="form-control" disabled="disabled" type="text" v-model="employee.last_name" id="last_name" required="required">\n                            <span class="help-block m-b-none">Last Name</span>\n                        </div>\n                    </div>\n                    <!-- End - Full Name -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Employee Id & Face Id -->\n                    <div class="form-group">\n                        <label for="employee_id" class="col-md-2 control-label">Employee Id</label>\n                        <div class="col-sm-4">\n                            <input class="form-control" data-mask="HRis-9999" disabled="disabled" type="text" v-model="employee.employee_id" id="employee_id" required="required">\n                        </div>\n                        <label for="face_id" class="col-md-2 control-label">Face Id</label>\n                        <div class="col-sm-4">\n                            <input class="form-control" data-mask="999" disabled="disabled" type="text" v-model="employee.face_id" id="face_id">\n                        </div>\n                    </div>\n                    <!-- End - Employee Id & Face Id -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Gender & Marital Status -->\n                    <div class="form-group">\n                        <label for="gender[1]" class="col-md-2 control-label">Gender</label>\n                        <div class="col-sm-4">\n                            <label class="radio-inline i-checks">\n                                <input disabled="disabled" type="radio" name="gender" value="M" v-model="employee.gender" id="gender[1]"> Male\n                            </label>\n                            <label class="radio-inline i-checks">\n                                <input disabled="disabled" type="radio" name="gender" value="F" v-model="employee.gender" id="gender[2]"> Female\n                            </label>\n                        </div>\n                        <label for="marital_status_id" class="col-md-2 control-label">Marital Status</label>\n                        <div class="col-sm-4">\n                            <select v-model="employee.marital_status_id" class="vue-chosen" disabled="disabled" options="marital_statuses_chosen" id="marital_status_id" v-chosen="employee.marital_status_id"></select>\n                        </div>\n                    </div>\n                    <!-- End - Gender & Marital Status -->\n\n                    <!-- Start - Nationality & DOB -->\n                    <div class="form-group">\n                        <label for="nationality_id" class="col-md-2 control-label">Nationality</label>\n                        <div class="col-sm-4">\n                            <select v-model="employee.nationality_id" class="vue-chosen" disabled="disabled" options="nationalities_chosen" id="nationality_id" v-chosen="employee.nationality_id"></select>\n                        </div>\n                        <label for="birth_date" class="col-md-2 control-label">Date of Birth</label>\n                        <div class="col-sm-4" id="datepicker_birth_date">\n                            <div class="input-group date">\n                                <span class="input-group-addon"><i class="fa fa-calendar"></i></span><input class="form-control" data-mask="9999-99-99" disabled="disabled" name="birth_date" type="text" v-model="employee.birth_date" id="birth_date">\n                            </div>\n                        </div>\n                    </div>\n                    <!-- End - Nationality & DOB -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Social Security & Tax Identification -->\n                    <div class="form-group">\n                        <label for="social_security" class="col-md-2 control-label">Social Security</label>\n                        <div class="col-sm-4">\n                            <input class="form-control" data-mask="99-9999999-9" disabled="disabled" type="text" v-model="employee.social_security" id="social_security">\n                        </div>\n                        <label for="tax_identification" class="col-md-2 control-label">Tax Identification</label>\n                        <div class="col-sm-4">\n                            <input class="form-control" data-mask="999-999-999" disabled="disabled" type="text" v-model="employee.tax_identification" id="tax_identification">\n                        </div>\n                    </div>\n                    <!-- End - Social Security & Tax Identification -->\n\n                    <!-- Start - PhilHealth & PagIbig -->\n                    <div class="form-group">\n                        <label for="philhealth" class="col-md-2 control-label">PhilHealth</label>\n                        <div class="col-sm-4">\n                            <input class="form-control" data-mask="99-999999999-9" disabled="disabled" type="text" v-model="employee.philhealth" id="philhealth">\n                        </div>\n                        <label for="hdmf_pagibig" class="col-md-2 control-label">HDMF / PagIbig</label>\n                        <div class="col-sm-4">\n                            <input class="form-control" data-mask="9999 9999 9999" disabled="disabled" type="text" v-model="employee.hdmf_pagibig" id="hdmf_pagibig">\n                        </div>\n                    </div>\n                    <!-- End - PhilHealth & PagIbig -->\n\n                    <div class="hr-line-dashed"></div>\n\n                    <!-- Start - Control Buttons -->\n                    <div class="form-group save-form" style="display:none;">\n                        <div class="col-sm-4 col-sm-offset-2">\n                            <a href="#0" class="btn btn-white btn-xs cancel-form" v-on="click: cancelForm">Cancel</a>\n                            <input class="btn btn-primary btn-xs" type="submit" v-on="click: submitForm" value="Save changes">\n                        </div>\n                    </div>\n                    <div class="form-group" v-if="has_access[permission + \'.update\']">\n                        <div class="col-sm-4 col-sm-offset-2">\n                            <a href="#0" class="btn btn-primary btn-xs modify-form" v-on="click: modifyForm">Modify</a>\n                        </div>\n                    </div>\n                    <!-- End - Control Buttons -->\n                </form>\n            </div>\n        </div>\n    </div>\n</div>\n';
},{}],20:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./personal-details.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Personal Details';
    },
    data: function data() {
        return {
            id: '',
            nationality: '',
            nationalities_chosen: [{}],
            marital_status: '',
            marital_statuses_chosen: [{}],
            original_employee_id: ''
        };
    },
    ready: function ready() {
        this.queryDatabase();
    },
    methods: {
        queryDatabase: function queryDatabase() {
            var self = this;

            if (this.$route.path.indexOf('/pim') > -1) {
                this.employee_id = this.$route.params.employee_id;
            } else {
                this.employee_id = localStorage.getItem('employee_id');
            }

            $.ajax({
                url: '/api/1.0/employee/get-by-employee-id',
                method: 'POST',
                data: { 'employee_id': this.employee_id },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {

                self.employee = response.data;
                self.original_employee_id = response.data.employee_id;

                if (self.employee.birth_date != null) {
                    self.employee.birth_date = self.employee.birth_date.substring(0, 10);
                }

                self.chosenNationalities();
                self.chosenMaritalStatuses();

                // iCheck
                $('.i-checks').iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'
                });

                $('input[name="gender"]').on('ifChecked', function (event) {
                    self.employee.gender = this.value;
                });

                self.switchGender(self.employee.gender);
            });
        },
        submitForm: function submitForm() {
            var self = this;

            // jasny bug work around
            $('#first_name').focus();

            $.ajax({
                url: '/api/1.0/profile/personal-details',
                method: 'PATCH',
                data: { 'id': this.id, 'employee': this.employee },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                switch (response.code) {
                    case 200:

                        self.updateLocalStorage(response.data.employee.employee_id);

                        if (self.$route.path.indexOf('/pim') > -1) {
                            self.$route.router.go({
                                name: 'pim-employee-list-personal-details',
                                params: { employee_id: response.data.employee.employee_id }
                            });
                        }

                        self.$route.params.employee_id = response.data.employee.employee_id;
                        swal({ title: response.data.text, type: 'success', timer: 2000 });
                        self.cancelForm();
                        break;
                    case 405:
                        swal({ title: response.text, type: 'warning', timer: 2000 });
                        break;
                    case 500:
                        $('#first_name').focus();
                        swal({ title: response.text, type: 'error', timer: 2000 });
                        break;
                }
            });
        },
        modifyForm: function modifyForm() {

            $('.avatar').css('display', '');
            $('.job-title').css('display', 'none');

            $('.save-form').css('display', '');
            $('.modify-form').css('display', 'none');
            $('.vue-chosen').prop('disabled', false).trigger("chosen:updated");
            $('.form-control').prop('disabled', false);
            $('.i-checks').iCheck('enable');

            // datepicker for birth_date
            $('.input-group.date').datepicker({
                format: 'yyyy-mm-dd',
                keyboardNavigation: false,
                forceParse: true,
                calendarWeeks: true,
                autoclose: true,
                clearBtn: true
            }).datepicker('update', this.employee.birth_date);

            $('#first_name').focus();
        },
        cancelForm: function cancelForm() {
            // retrieve original data since cancel button was pressed.
            this.queryDatabase();

            $('.avatar').css('display', 'none');
            $('.job-title').css('display', '');

            $('.save-form').css('display', 'none');
            $('.modify-form').css('display', '');
            $('.vue-chosen').prop('disabled', true).trigger("chosen:updated");
            $('.form-control').prop('disabled', true);
            $('.i-checks').iCheck('disable');

            // datepicker for birth_date
            $('#datepicker_birth_date .input-group.date').datepicker('remove');
        },
        switchGender: function switchGender(gender) {
            switch (gender) {
                case 'M':
                    $('input[id="gender[1]"]').iCheck('check');
                    break;
                case 'F':
                    $('input[id="gender[2]"]').iCheck('check');
                    break;
            }
        },
        updateLocalStorage: function updateLocalStorage(new_employee_id) {
            var self = this;

            if (self.original_employee_id == localStorage.getItem('employee_id')) {
                localStorage.setItem('employee_id', new_employee_id);
            }
        },
        chosenNationalities: function chosenNationalities() {
            var self = this;

            // retrieve nationalities
            $.ajax({ url: '/api/1.0/nationalities', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.nationalities_chosen = response.data;
                }
                self.nationality = self.employee.nationality_id;

                // watcher for chosen
                var nationalitiesChosenWatcher = setInterval(function () {
                    if (self.employee.nationality_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        clearInterval(nationalitiesChosenWatcher);
                    }
                }, 1);
            });
        },
        chosenMaritalStatuses: function chosenMaritalStatuses() {
            var self = this;

            // retrieve marital status
            $.ajax({ url: '/api/1.0/marital-statuses', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.marital_statuses_chosen = response.data;
                }
                self.marital_status = self.employee.marital_status_id;

                // watcher for chosen
                var maritalStatusChosenWatcher = setInterval(function () {
                    if (self.employee.marital_status_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        clearInterval(maritalStatusChosenWatcher);
                    }
                }, 1);
            });
        }
    }
};

},{"./personal-details.html":19}],21:[function(require,module,exports){
module.exports = '<div class="row">\n    <navbar-static-profile-top></navbar-static-profile-top>\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Work Experience</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n\n            <div class="ibox-content">\n                <div class="">\n                    <a id="add_work_experience" v-if="has_access[permission + \'.work-experiences.create\']" v-on="click: toggleModal(\'work_experience\')" href="javascript:void(0);" class="btn btn-primary btn-xs">Add a new row</a>\n                </div>\n                <div class="table-responsive">\n                    <table class="table table-striped">\n                        <thead>\n                        <tr>\n                            <th>Company</th>\n                            <th>Job Title</th>\n                            <th>From</th>\n                            <th>To</th>\n                            <th>Comment</th>\n                            <th class="fix-width">Action</th>\n                        </tr>\n                        </thead>\n\n                        <tbody id="work_experiences_body">\n                        <tr v-repeat="work_experience in work_experiences" class="item-{{$index}}">\n                            {{$index}}\n                            <td>{{work_experience.company}}</td>\n                            <td>{{work_experience.job_title}}</td>\n                            <td v-if="work_experience.from_date">{{work_experience.from_date.substring(0, 10)}}</td>\n                            <td v-if="work_experience.to_date">{{work_experience.to_date.substring(0, 10)}}</td>\n                            <td>{{work_experience.comment}}</td>\n                            <td>\n                                <button rel="edit" id="edit_{{work_experience.id}}" v-if="has_access[permission + \'.work-experiences.update\']" class="btn btn-primary btn-xs btn-warning" data-toggle="tooltip" data-placement="bottom" title="" type="button" v-on="click: editWorkExperienceRecord(work_experience, $index)" data-original-title="Edit"><i class="fa fa-edit"></i></button>\n                                <button rel="delete" id="delete_{{work_experience.id}}" v-if="has_access[permission + \'.work-experiences.delete\']" class="btn btn-primary btn-xs btn-danger" data-toggle="tooltip" data-placement="bottom" title="" type="button" v-on="click: deleteWorkExperienceRecord(work_experience, $index)" data-original-title="Delete"><i class="fa fa-times"></i></button>\n                            </td>\n                        </tr>\n                        <tr v-if="work_experiences && work_experiences.length == 0">\n                            <td colspan="6">No work experiences listed</td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        </div>\n    </div>\n    <!-- Modal -->\n    <div class="modal fade" id="work_experience_modal" tabindex="-1">\n        <div class="modal-dialog">\n            <div class="modal-content">\n                <div class="modal-header">\n                    <button class="close" data-dismiss="modal" type="button">&times;</button>\n\n                    <h4 class="modal-title" id="my_modal_label">Work Experience Details</h4>\n                </div>\n\n                <div class="modal-body">\n                    <!--Add form-->\n                    <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal">\n                        <input name="employee_id" type="hidden" value="1">\n                        <input type="hidden" v-model="work_experience_modal.work_experience_id">\n                        <div class="form-group">\n                            <label for="company" class="col-md-3 control-label">Company</label>\n                            <div class="col-md-9">\n                                <input class="form-control" name="company" type="text" v-model=\'work_experience_modal.company\' id="company">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="job_title" class="col-md-3 control-label">Job Title</label>\n                            <div class="col-md-9">\n                                <input class="form-control" name="job_title" type="text" v-model=\'work_experience_modal.job_title\' id="job_title">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="work_experience_date_range" class="col-md-3 control-label">Year</label>\n                            <div class="col-md-9">\n                                <div class="input-daterange input-group input-full-width" id="work_experience_date_range">\n                                    <input class="input-sm form-control" data-mask="9999-99-99" id="work_experience_from_date" name="from_date" v-model=\'work_experience_modal.from_date\' type="text">\n                                    <span class="input-group-addon">to</span>\n                                    <input class="input-sm form-control" data-mask="9999-99-99" id="work_experience_to_date" name="to_date" v-model=\'work_experience_modal.to_date\' type="text">\n                                </div>\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="comment" class="col-md-3 control-label">Comment</label>\n                            <div class="col-md-9">\n                                <textarea class="form-control" name="comment" cols="30" rows="5" v-model=\'work_experience_modal.comment\' id="comment"></textarea>\n                            </div>\n                        </div>\n\n                        <div class="modal-footer">\n                            <button class="btn btn-white btn-xs" data-dismiss="modal" type="button">Close</button>\n                            <input class="btn btn-primary btn-xs" type="submit" v-on="click: submitWorkExperienceForm" value="Save changes">\n                        </div>\n                    </form><!--// form-->\n                </div>\n            </div><!-- /.modal-content -->\n        </div><!-- /.modal-dialog -->\n    </div><!-- /.modal -->\n</div>\n<div class="row">\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Education</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n\n            <div class="ibox-content">\n                <div class="">\n                    <a id="add_education" v-if="has_access[permission + \'.educations.create\']" v-on="click: toggleModal(\'education\')" href="javascript:void(0);" class="btn btn-primary btn-xs">Add a new row</a>\n                </div>\n                <div class="table-responsive">\n                    <table class="table table-striped">\n                        <thead>\n                        <tr>\n                            <th>Level</th>\n                            <th>Year</th>\n                            <th>GPA/Score</th>\n                            <th class="fix-width">Action</th>\n                        </tr>\n                        </thead>\n\n                        <tbody id="educations_body">\n                        <tr>\n                            <td colspan="4">No educations listed</td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        </div>\n    </div>\n    <!-- Modal -->\n    <div class="modal fade" id="education_modal" tabindex="-1">\n        <div class="modal-dialog">\n            <div class="modal-content">\n                <div class="modal-header">\n                    <button class="close" data-dismiss="modal" type="button">&times;</button>\n\n                    <h4 class="modal-title">Education Details</h4>\n                </div>\n\n                <div class="modal-body">\n                    <!--Add form-->\n                    <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal">\n                        <input name="employee_id" type="hidden" value="1">\n                        <input id="education_id" name="education_id" type="hidden" value="">\n                        <input id="education_form" name="_method" type="hidden" value="POST">\n\n                        <div class="form-group">\n                            <label for="education_level_id" class="col-md-3 control-label">Level</label>\n                            <div class="col-md-9">\n                                <select v-model="education_modal.education_level" class="vue-chosen" options="education_modal.education_levels" id="education_level_id" v-chosen="education_modal.education_level"></select>\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="institute" class="col-md-3 control-label">Institute</label>\n                            <div class="col-md-9">\n                                <input class="form-control" name="institute" type="text" id="institute">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="major_specialization" class="col-md-3 control-label">Major/Specialization</label>\n                            <div class="col-md-9">\n                                <input class="form-control" name="major_specialization" type="text" id="major_specialization">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="educationDateRange" class="col-md-3 control-label">Year</label>\n                            <div class="col-md-9">\n                                <div class="input-daterange input-group input-full-width" id="datepicker">\n                                    <input class="input-sm form-control" data-mask="9999-99-99" id="education_from_date" name="from_date" type="text">\n                                    <span class="input-group-addon">to</span>\n                                    <input class="input-sm form-control" data-mask="9999-99-99" id="education_to_date" name="to_date" type="text">\n                                </div>\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="gpa_score" class="col-md-3 control-label">GPA/Score</label>\n                            <div class="col-md-9">\n                                <input class="form-control" name="gpa_score" type="text" id="gpa_score">\n                            </div>\n                        </div>\n\n                        <div class="modal-footer">\n                            <button class="btn btn-white btn-xs" data-dismiss="modal" type="button">Close</button>\n                            <input class="btn btn-primary btn-xs" type="submit" value="Save changes">\n                        </div>\n                    </form><!--// form-->\n                </div>\n            </div><!-- /.modal-content -->\n        </div><!-- /.modal-dialog -->\n    </div><!-- /.modal -->\n</div>\n<div class="row">\n    <div class="col-lg-12">\n        <div class="ibox float-e-margins">\n            <div class="ibox-title">\n                <h5>Skills</h5>\n                <div class="ibox-tools">\n                    <a class="collapse-link">\n                        <i class="fa fa-chevron-up"></i>\n                    </a>\n                </div>\n            </div>\n\n            <div class="ibox-content">\n                <div class="">\n                    <a id="add_skill" v-if="has_access[permission + \'.skills.create\']" v-on="click: toggleModal(\'skill\')" href="javascript:void(0);" class="btn btn-primary btn-xs">Add a new row</a>\n                </div>\n                <div class="table-responsive">\n                    <table class="table table-striped">\n                        <thead>\n                        <tr>\n                            <th>Skill</th>\n                            <th>Years of Experience</th>\n                            <th class="fix-width">Action</th>\n                        </tr>\n                        </thead>\n\n                        <tbody id="skills_body">\n                        <tr>\n                            <td colspan="3">No skills listed</td>\n                        </tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        </div>\n    </div>\n    <!-- Modal -->\n    <div class="modal fade" id="skill_modal" tabindex="-1">\n        <div class="modal-dialog">\n            <div class="modal-content">\n                <div class="modal-header">\n                    <button class="close" data-dismiss="modal" type="button">&times;</button>\n\n                    <h4 class="modal-title" id="my_model_label">Skill Details</h4>\n                </div>\n\n                <div class="modal-body">\n                    <!--Add form-->\n                    <form method="POST" onsubmit="return false;" accept-charset="UTF-8" class="form-horizontal">\n                        <input name="id" type="hidden" value="1">\n                        <input id="employee_skill_id" name="employee_skill_id" type="hidden" value="">\n                        <input id="skillForm" name="_method" type="hidden" value="POST">\n                        <div class="form-group">\n                            <label for="skill_id" class="col-md-3 control-label">Skill</label>\n                            <div class="col-md-9">\n                                <select data-placeholder="--- Select ---" class="form-control chosen-select" id="skill_id" name="skill_id"></select>\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="years_of_experience" class="col-md-3 control-label">Years Experience</label>\n                            <div class="col-md-9">\n                                <input class="form-control" name="years_of_experience" type="text" id="years_of_experience">\n                            </div>\n                        </div>\n\n                        <div class="form-group">\n                            <label for="skill_comment" class="col-md-3 control-label">Comments</label>\n                            <div class="col-md-9">\n                                <textarea class="form-control" name="skill_comment" cols="30" rows="5" id="skill_comment"></textarea>\n                            </div>\n                        </div>\n\n                        <div class="modal-footer">\n                            <button class="btn btn-white btn-xs" data-dismiss="modal" type="button">Close</button>\n                            <input class="btn btn-primary btn-xs" type="submit" value="Save changes">\n                        </div>\n                    </form><!--// form-->\n                </div>\n            </div><!-- /.modal-content -->\n        </div><!-- /.modal-dialog -->\n    </div><!-- /.modal -->\n</div>\n';
},{}],22:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./qualifications.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Qualifications';
    },
    data: function data() {
        return {
            work_experiences: [{}],
            work_experience_modal: {
                work_experience_id: 0,
                company: '',
                job_title: '',
                from_date: '',
                to_date: '',
                comment: ''
            },
            education_modal: {
                education_level: '',
                education_levels: [{}]
            }
        };
    },
    ready: function ready() {
        this.queryDatabase();
        this.chosenEducationLevels();
    },
    methods: {
        queryDatabase: function queryDatabase() {
            var self = this;

            if (this.$route.path.indexOf('/pim') > -1) {
                this.employee_id = this.$route.params.employee_id;
            } else {
                this.employee_id = localStorage.getItem('employee_id');
            }

            $.ajax({
                url: '/api/1.0/employee/get-by-employee-id',
                method: 'POST',
                data: { 'employee_id': this.employee_id },
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                self.employee = response.data;
                self.employee.id = response.data.id;
                self.work_experiences = self.employee.work_experiences;
            });
        },

        chosenEducationLevels: function chosenEducationLevels() {

            var self = this;

            // retrieve education levels
            $.ajax({ url: '/api/1.0/education-levels', method: 'GET' }).done(function (response) {
                if (response.data) {
                    self.education_modal.education_levels = response.data;
                }

                // watcher for chosen
                var educationLevelsChosenWatcher = setInterval(function () {
                    $('.vue-chosen').trigger("chosen:updated");
                    clearInterval(educationLevelsChosenWatcher);
                }, 1000);
            });
        },
        toggleModal: function toggleModal(type) {

            this.editMode = false;

            switch (type) {
                case 'work_experience':
                    $('#company').val('');
                    $('#job_title').val('');
                    $('#work_experience_from_date').val('');
                    $('#work_experience_to_date').val('');
                    $('#comment').val('');
                    break;
            }

            // Date picker
            $('.input-daterange').datepicker({
                format: 'yyyy-mm-dd',
                keyboardNavigation: false,
                forceParse: false,
                autoclose: true,
                clearBtn: true
            });

            $('#' + type + '_modal').modal('toggle');
            $('#' + type + '_modal').on('shown.bs.modal', function () {
                if (type == 'work_experience') {
                    $('#company').focus();
                }
            });
        },
        submitWorkExperienceForm: function submitWorkExperienceForm() {
            var self = this;

            // jasny bug work around
            $('#company').focus();

            self.work_experience_modal.employee_id = self.employee.id;

            if (self.work_experience_modal.from_date != null) {
                self.work_experience_modal.from_date = self.work_experience_modal.from_date.substring(0, 10);
            }

            if (self.work_experience_modal.to_date != null) {
                self.work_experience_modal.to_date = self.work_experience_modal.to_date.substring(0, 10);
            }

            $.ajax({
                url: '/api/1.0/profile/qualifications/work-experiences',
                method: self.editMode ? 'PATCH' : 'POST',
                data: self.work_experience_modal,
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                switch (response.code) {
                    case 200:
                        $('#work_experience_modal').modal('toggle');
                        if (self.editMode) {
                            self.updateRowInTable();
                            swal({ title: response.text, type: 'success', timer: 2000 });
                        } else {
                            self.work_experiences.push(response.data.work_experience);
                            swal({ title: response.data.text, type: 'success', timer: 2000 });
                        }
                        break;
                    case 500:
                        swal({ title: response.text, type: 'error', timer: 2000 });
                        break;
                }
            });
        },
        editWorkExperienceRecord: function editWorkExperienceRecord(work_experience, index) {
            var self = this;

            this.editMode = true;
            this.editIndex = index;

            self.assignValuesToWorkExperienceModal(work_experience);

            $('#work_experience_modal').modal('toggle');

            $('#work_experience_modal').on('shown.bs.modal', function () {
                $('.vue-chosen', this).trigger('chosen:update');
            });

            $('#company').focus();
        },
        deleteWorkExperienceRecord: function deleteWorkExperienceRecord(work_experience, index) {
            var self = this;

            var previousWindowKeyDown = window.onkeydown; // https://github.com/t4t5/sweetalert/issues/127
            swal({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record!',
                showCancelButton: true,
                cancelButtonColor: '#d33',
                type: 'warning',
                confirmButtonClass: 'confirm-class',
                cancelButtonClass: 'cancel-class',
                confirmButtonText: 'Yes, delete it!',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                swal.disableButtons();
                window.onkeydown = previousWindowKeyDown; // https://github.com/t4t5/sweetalert/issues/127
                if (isConfirm) {
                    $.ajax({
                        url: '/api/1.0/profile/qualifications/work-experiences',
                        method: 'DELETE',
                        data: { id: work_experience.id },
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({ title: response.text, type: 'success', timer: 2000 });
                                self.work_experiences.splice(index, 1);
                                break;
                            case 500:
                                swal({ title: response.text, type: 'error', timer: 2000 });
                                break;
                        }
                    });
                } else {
                    swal('Cancelled', 'No record has been deleted', 'error');
                }
            });
        },
        updateRowInTable: function updateRowInTable() {
            this.work_experiences[this.editIndex].company = this.work_experience_modal.company;
            this.work_experiences[this.editIndex].job_title = this.work_experience_modal.job_title;
            this.work_experiences[this.editIndex].from_date = this.work_experience_modal.from_date;
            this.work_experiences[this.editIndex].to_date = this.work_experience_modal.to_date;
            this.work_experiences[this.editIndex].comment = this.work_experience_modal.comment;
        },
        assignValuesToWorkExperienceModal: function assignValuesToWorkExperienceModal(work_experience) {
            this.work_experience_modal.work_experience_id = work_experience.id;
            this.work_experience_modal.company = work_experience.company;
            this.work_experience_modal.job_title = work_experience.job_title;
            this.work_experience_modal.from_date = work_experience.from_date.substring(0, 10);
            this.work_experience_modal.to_date = work_experience.to_date.substring(0, 10);
            this.work_experience_modal.comment = work_experience.comment;

            // Date picker
            $('.input-daterange').datepicker({
                format: 'yyyy-mm-dd',
                keyboardNavigation: false,
                forceParse: false,
                autoclose: true,
                clearBtn: true
            });
        }
    }
};

},{"./qualifications.html":21}],23:[function(require,module,exports){
module.exports = '<div class="row">\n    <navbar-static-profile-top></navbar-static-profile-top>\n\n</div>\n\n';
},{}],24:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./salary.html'),
    props: ['page_title', 'has_access', 'permission'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Salary';
    }
};

},{"./salary.html":23}],25:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}],26:[function(require,module,exports){
'use strict';

module.exports = {
    template: require('./work-shifts.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function compiled() {
        this.page_title = (this.$route.path.indexOf('pim') > -1 ? 'Employee\'s ' : 'My ') + 'Work Shifts';
    }
};

},{"./work-shifts.html":25}],27:[function(require,module,exports){
module.exports = '<div class="col-sm-6">\n    <div class="profile-img">\n\n        <img id="profile-image" alt="avatar" src="/images/profile/default/0.png"/>\n        <div class="profile-details">\n\n            <h2>{{employee.first_name}} {{employee.last_name}}</h2>\n            <h3>{{job_titles[employee.job_history.job_title_id]}}</h3>\n\n            <h4 class="avatar" style="display: none;"><span id="add_avatar" class="label label-primary">Edit Avatar</span></h4>\n            <h4 class="job-title"><span v-if="employment_statuses[employee.job_history.employment_status_id]" class="label {{employment_statuses[employee.job_history.employment_status_id].class}}">{{employment_statuses[employee.job_history.employment_status_id].name}}</span></h4>\n        </div>\n    </div>\n</div>\n';
},{}],28:[function(require,module,exports){
module.exports = '<!--\n ___.   ________\n \\_ |__ \\_____  \\__________  ___\n   | __ \\  _(__  <_  __ \\  \\/  /\n   | \\_\\ \\/       \\  | \\/>    <\n   |___  /______  /__|  /__/\\_ \\\n       \\/       \\/ Studios    \\/\n-->\n';
},{}],29:[function(require,module,exports){
module.exports = '<div class="footer fixed">\n    <div class="pull-right">\n        10GB of <strong>250GB</strong> Free.\n    </div>\n    <div>\n        <strong>Copyright</strong> b3 Studios &copy; 2014\n    </div>\n</div>\n';
},{}],30:[function(require,module,exports){
module.exports = '<div class="col-lg-12 top-nav-b">\n    <div class="btn-group top-nav-li">\n        <ul>\n            <li v-class="active: $route.path.indexOf(\'/profile/personal-details\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/personal-details\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-personal-details\'}">\n                    <i class="fa fa-file-text-o  m-right-a"></i>\n                    Personal Details\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-personal-details\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-file-text-o  m-right-a"></i>\n                    Personal Details\n                </a>\n            </li>\n            <li v-class="active: $route.path.indexOf(\'/profile/contact-details\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/contact-details\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-contact-details\'}">\n                    <i class="fa fa-phone-square m-right-a"></i>\n                    Contact Details\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-contact-details\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-phone-square m-right-a"></i>\n                    Contact Details\n                </a>\n            </li>\n            <li v-class="active: $route.path.indexOf(\'/profile/emergency-contacts\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/emergency-contacts\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-emergency-contacts\'}">\n                    <i class="fa fa-plus-square  m-right-a"></i>\n                    Emergency Contacts\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-emergency-contacts\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-plus-square  m-right-a"></i>\n                    Emergency Contacts\n                </a>\n            </li>\n            <li v-class="active: $route.path.indexOf(\'/profile/dependents\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/dependents\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-dependents\'}">\n                    <i class="fa fa-child m-right-a"></i>\n                    Dependents\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-dependents\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-child m-right-a"></i>\n                    Dependents\n                </a>\n            </li>\n            <li v-class="active: $route.path.indexOf(\'/profile/job\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/job\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-job\'}">\n                    <i class="fa fa-briefcase m-right-a"></i>\n                    Job\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-job\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-briefcase m-right-a"></i>\n                    Job\n                </a>\n            </li>\n            <li v-class="active: $route.path.indexOf(\'/profile/work-shifts\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/work-shifts\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-work-shifts\'}">\n                    <i class="fa fa-clock-o m-right-a"></i>\n                    Work Shifts\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-work-shifts\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-clock-o m-right-a"></i>\n                    Work Shifts\n                </a>\n            </li>\n            <li v-class="active: $route.path.indexOf(\'/profile/salary\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/salary\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-salary\'}">\n                    <i class="fa fa-money m-right-a"></i>\n                    Salary\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-salary\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-money m-right-a"></i>\n                    Salary\n                </a>\n            </li>\n            <li v-class="active: $route.path.indexOf(\'/profile/qualifications\') > -1 || $route.path.indexOf(\'/pim/employee-list/\'+$route.params.employee_id+\'/qualifications\') > -1, navy: $route.path.indexOf(\'/pim\') > -1">\n                <a v-if="$route.path.indexOf(\'/profile\') > -1" v-link="{name : \'profile-qualifications\'}">\n                    <i class="fa fa-bookmark m-right-a"></i>\n                    Qualifications\n                </a>\n                <a v-if="$route.path.indexOf(\'/pim\') > -1" v-link="{name : \'pim-employee-list-qualifications\', params: {employee_id: $route.params.employee_id}}">\n                        <i class="fa fa-bookmark m-right-a"></i>\n                    Qualifications\n                </a>\n            </li>\n        </ul>\n    </div>\n</div>\n';
},{}],31:[function(require,module,exports){
module.exports = '<li v-repeat="navlink in navlinks" data="\'/{{navlink.href}}\'" v-class="active: $route.path.indexOf(\'/\'+navlink.href) == 0, navy: navlink.href.indexOf(\'pim\') == 0 || navlink.href.indexOf(\'admin\') == 0">\n    <a v-link="{name: navlink.route}">\n        <i class="fa {{navlink.icon}}"></i>\n        <span class="nav-label">{{navlink.name}}</span>\n        <span v-if="navlink.children.length" class="fa arrow"></span>\n    </a>\n    <ul class="nav nav-second-level collapse" v-class="in: $route.path.indexOf(\'/\'+navlink.href) == 0" v-if="navlink.children.length">\n        <li v-repeat="child in navlink.children" v-class="active: $route.path.indexOf(\'/\'+child.href) == 0, navy: child.href.indexOf(\'pim\') == 0 || child.href.indexOf(\'admin\') == 0">\n            <a v-link="{name : child.route}">\n                <i class="fa {{child.icon}}"></i>\n                <span class="nav-label">{{child.name}}</span>\n                <span v-if="child.children.length" class="fa arrow"></span>\n            </a>\n            <ul class="nav nav-third-level collapse" v-class="in: $route.path.indexOf(\'/\'+child.href) == 0" v-if="child.children.length">\n                <li v-repeat="grandchild in child.children" v-class="active: $route.path.indexOf(\'/\'+grandchild.href) == 0, navy: grandchild.href.indexOf(\'pim\') == 0 || grandchild.href.indexOf(\'admin\') == 0">\n                    <a v-link="{name : grandchild.route}">\n                        <i class="fa {{grandchild.icon}}"></i>\n                        <span class="nav-label">{{grandchild.name}}</span>\n                        <span v-if="grandchild.children.length" class="fa arrow"></span>\n                    </a>\n                </li>\n            </ul>\n        </li>\n    </ul>\n</li>\n';
},{}],32:[function(require,module,exports){
module.exports = '<nav class="navbar navbar-static-top  " role="navigation" style="margin-bottom: 0">\n    <div class="navbar-header">\n        <a class="navbar-minimalize minimalize-styl-2 btn btn-ghost" href="#">\n            <span></span>\n            <span></span>\n            <span></span>\n        </a>\n        <form role="search" class="navbar-form-custom" method="post" action="search_results.html">\n            <div class="form-group">\n                <input type="text" placeholder="Search for something..." class="form-control" name="top-search" id="top-search">\n            </div>\n        </form>\n    </div>\n    <ul class="nav navbar-top-links navbar-right">\n        <li>\n            <span class="m-r-sm text-muted welcome-message visible-md-block visible-lg-block">Welcome to HRis.</span>\n        </li>\n        <li class="dropdown">\n            <a class="dropdown-toggle count-info" data-toggle="dropdown" href="#">\n                <i class="fa fa-envelope"></i>  <span class="label label-warning">16</span>\n            </a>\n            <ul class="dropdown-menu dropdown-messages">\n                <li>\n                    <div class="dropdown-messages-box">\n                        <a href="profile.html" class="pull-left">\n                            <img alt="image" class="img-circle" src="/img/a7.jpg">\n                        </a>\n                        <div class="media-body">\n                            <small class="pull-right">46h ago</small>\n                            <strong>Mike Loreipsum</strong> started following <strong>Monica Smith</strong>. <br>\n                            <small class="text-muted">3 days ago at 7:58 pm - 10.06.2014</small>\n                        </div>\n                    </div>\n                </li>\n                <li class="divider"></li>\n                <li>\n                    <div class="dropdown-messages-box">\n                        <a href="profile.html" class="pull-left">\n                            <img alt="image" class="img-circle" src="/img/a4.jpg">\n                        </a>\n                        <div class="media-body ">\n                            <small class="pull-right text-navy">5h ago</small>\n                            <strong>Chris Johnatan Overtunk</strong> started following <strong>Monica Smith</strong>. <br>\n                            <small class="text-muted">Yesterday 1:21 pm - 11.06.2014</small>\n                        </div>\n                    </div>\n                </li>\n                <li class="divider"></li>\n                <li>\n                    <div class="dropdown-messages-box">\n                        <a href="profile.html" class="pull-left">\n                            <img alt="image" class="img-circle" src="/img/profile.jpg">\n                        </a>\n                        <div class="media-body ">\n                            <small class="pull-right">23h ago</small>\n                            <strong>Monica Smith</strong> love <strong>Kim Smith</strong>. <br>\n                            <small class="text-muted">2 days ago at 2:30 am - 11.06.2014</small>\n                        </div>\n                    </div>\n                </li>\n                <li class="divider"></li>\n                <li>\n                    <div class="text-center link-block">\n                        <a href="mailbox.html">\n                            <i class="fa fa-envelope"></i> <strong>Read All Messages</strong>\n                        </a>\n                    </div>\n                </li>\n            </ul>\n        </li>\n        <li class="dropdown">\n            <a class="dropdown-toggle count-info" data-toggle="dropdown" href="#">\n                <i class="fa fa-bell"></i>  <span class="label label-primary">8</span>\n            </a>\n            <ul class="dropdown-menu dropdown-alerts">\n                <li>\n                    <a href="mailbox.html">\n                        <div>\n                            <i class="fa fa-envelope fa-fw"></i> You have 16 messages\n                            <span class="pull-right text-muted small">4 minutes ago</span>\n                        </div>\n                    </a>\n                </li>\n                <li class="divider"></li>\n                <li>\n                    <a href="profile.html">\n                        <div>\n                            <i class="fa fa-twitter fa-fw"></i> 3 New Followers\n                            <span class="pull-right text-muted small">12 minutes ago</span>\n                        </div>\n                    </a>\n                </li>\n                <li class="divider"></li>\n                <li>\n                    <a href="grid_options.html">\n                        <div>\n                            <i class="fa fa-upload fa-fw"></i> Server Rebooted\n                            <span class="pull-right text-muted small">4 minutes ago</span>\n                        </div>\n                    </a>\n                </li>\n                <li class="divider"></li>\n                <li>\n                    <div class="text-center link-block">\n                        <a href="notifications.html">\n                            <strong>See All Alerts</strong>\n                            <i class="fa fa-angle-right"></i>\n                        </a>\n                    </div>\n                </li>\n            </ul>\n        </li>\n\n\n        <li>\n            <a v-on="click: doLogout">\n                <i class="fa fa-sign-out"></i> Log out\n            </a>\n        </li>\n    </ul>\n\n</nav>\n';
},{}]},{},[1]);
