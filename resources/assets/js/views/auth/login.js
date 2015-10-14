module.exports = {
    template: require('./login.html'),
    props: ['page_title'],
    data: function () {
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
        }
    },
    watch: {
        page_title: {
            immediate: true,
            handler: function (page_title) {
                document.title = 'HRis | ' + page_title;
            }
        }
    },
    methods: {
        doLogin: function () {

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
                        self.$route.router.go({name: 'dashboard'});
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
        validate: function () {
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
