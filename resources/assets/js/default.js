var app = Vue.extend({});

Vue.config.debug = true;

var default_page = Vue.extend({
    template: require('./views/master/default.html'),
    data: function () {
        return {
            logged: {
                avatar: '',
                id: null,
                employee: {
                    first_name: '',
                    last_name: '',
                    job_histories: [
                        'job_title_id'
                    ]
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
                job_histories: [
                    'job_title_id',
                    'employment_status_id'
                ],
                job_history: [],
            },
            job_titles: [],
            employment_statuses: [{}]
        }
    },
    watch: {
        page_title: {
            immediate: true,
            handler: function (page_title) {

                var route = [];
                var route_path = this.$route.path.substr(1);
                var route_segments = route_path.split('/');

                var route_name = route_segments[0];
                for (var i = 0; i < route_segments.length; i++) {

                    if (i && route_segments[i].indexOf('HRis') != 0) {              // TODO: get employee_id_prefix from config
                        route_name += '-' + route_segments[i];
                    }

                    if (route_segments[i] == 'pim') {
                        route_segments[i] = 'PIM';
                        continue;
                    } else if (route_segments[i].indexOf('HRis') != 0) {            // TODO: get employee_id_prefix from config
                        route_segments[i] = route_segments[i].replace('-', ' ');
                        route_segments[i] = this.toTitleCase(route_segments[i]);
                    }

                    if (route_segments[i].indexOf('HRis') == 0) {                   // TODO: get employee_id_prefix from config
                        route.push({
                            'segment': route_segments[i],
                            'name': route_name + '-personal-details',
                            'params': {'employee_id': route_segments[i]}
                        });
                    } else {
                        route.push({
                            'segment': route_segments[i],
                            'name': route_name,
                            'params': {'employee_id': route_segments[i - 1]}
                        });
                    }
                }

                this.routes = route;
                this.preparePermission();

                document.title = 'HRis | ' + page_title;                             // TODO: get appname from config
            }
        },
        employee: {
            immediate: true,
            handler: function (employee) {
                var self = this;
                this.employee = employee;

                $.ajax({
                    url: '/api/1.0/job-titles',
                    method: 'GET',
                    data: {'table_view': true}
                }).done(function (response) {
                    self.job_titles = response.data;
                });

                $.ajax({
                    url: '/api/1.0/employment-statuses',
                    method: 'GET',
                    data: {'table_view': true}
                }).done(function (response) {
                    var employee_status = response.data;

                    for (var i = 0; i < employee_status.length; i++) {
                        var e = employee_status[i];
                        self.employment_statuses[e.id] = {};
                        self.employment_statuses[e.id] = {name: e.name, class: e.class};
                    }
                });
            }

        }
    },

    methods: {
        toTitleCase: function (str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },
        preparePermission: function () {
            var route_path = this.$route.path.substr(1); // removes the first character ('/') in the path
            var route_dotted = route_path.replace('/', '.');
            var route_segment = route_path.split('/');
            var route_is_pim = route_segment[0] == 'profile' ? false : true;

            this.permission = route_dotted;
            if (route_is_pim) {
                route_segment = route_segment[route_segment.length - 1];
                this.permission = 'pim.' + route_segment;
            }

            this.route = {'path': route_path, 'dotted': route_dotted, 'segment': route_segment, 'pim': route_is_pim};

            this.has_access = JSON.parse(atob(localStorage.getItem('permissions')));
        },
    },
    compiled: function () {
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
    ready: function () {
        $('#side-menu').metisMenu();
    },
    data: function () {
        return {
            navlinks: ''
        }
    },
    compiled: function () {
        this.navlinks = JSON.parse(localStorage.getItem('sidebar'));
    }
});

Vue.component('navbar-static-profile-top', {
    template: require('./views/partials/navbar-static-profile-top.html'),
});

Vue.component('navbar-static-top', {
    template: require('./views/partials/navbar-static-top.html'),
    methods: {
        doLogout: function () {
            var self = this;
            $.ajax({
                url: '/api/1.0/signout',
                method: 'GET',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).always(function () {
                localStorage.removeItem('auth');
                localStorage.removeItem('remember');
                localStorage.removeItem('avatar');
                localStorage.removeItem('logged');
                localStorage.removeItem('permissions');
                Cookies.expire('auth');
                self.$route.router.go({name: 'login'});
            });
        },
    }
});

Vue.component('footer', {
    template: require('./views/partials/footer.html')
});

// Admin Router
var router = new VueRouter({
    history: true,
    saveScrollPosition: true,
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
                        auth: true,
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
                            },
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
                    },
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
                            },
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
                            },
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
                    },
                }
            },
        }
    },
    '/login': {
        name: 'login',
        component: require('./views/auth/login'),
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
                    beforeSend: function (xhr) {
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
