module.exports = {
    template: require('./contact-details.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function () {
        this.page_title = ((this.$route.path.indexOf('pim') > -1) ? 'Employee\'s ' : 'My ') + 'Contact Details';
    },
    data: function () {
        return {
            id: '',
            city: '',
            cities_chosen: [{}],
            province: '',
            provinces_chosen: [{}],
            country: '',
            countries_chosen: [{}],
        }
    },
    ready: function () {
        var self = this;
        this.queryDatabase();

        $("#address_province_id").change(function () {
            self.chosenCities();
        });
    },
    methods: {
        queryDatabase: function () {
            var self = this;

            if (this.$route.path.indexOf('/pim') > -1) {
                this.employee_id = this.$route.params.employee_id;
            } else {
                this.employee_id = localStorage.getItem('employee_id');
            }

            $.ajax({
                url: '/api/1.0/employee/get-by-employee-id',
                method: 'POST',
                data: {'employee_id': this.employee_id},
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                self.employee = response.data;

                self.chosenProvinces();
                self.chosenCountries();
            });
        },
        submitForm: function () {
            var self = this;

            // jasny bug work around
            $('#address_1').focus();

            $.ajax({
                url: '/api/1.0/profile/contact-details',
                method: 'PATCH',
                data: {'id': this.id, 'employee': this.employee},
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                switch (response.code) {
                    case 200:

                        if (self.$route.path.indexOf('/pim') > -1) {
                            self.$route.router.go({
                                name: 'pim-employee-list-contact-details',
                                params: {employee_id: response.data.employee.employee_id}
                            });
                        }

                        swal({title: response.data.text, type: 'success', timer: 2000});
                        self.cancelForm();
                        break;
                    case 405:
                        swal({title: response.text, type: 'warning', timer: 2000});
                        break;
                    case 500:
                        $('#first_name').focus();
                        swal({title: response.text, type: 'error', timer: 2000});
                        break;
                }

            });
        },
        modifyForm: function () {

            $('.save-form').css('display', '');
            $('.modify-form').css('display', 'none');
            $('.vue-chosen').prop('disabled', false).trigger("chosen:updated");
            $('.form-control').prop('disabled', false);

            $('#address_1').focus();
        },
        cancelForm: function () {
            // retrieve original data since cancel button was pressed.
            this.queryDatabase();

            $('.save-form').css('display', 'none');
            $('.modify-form').css('display', '');
            $('.vue-chosen').prop('disabled', true).trigger("chosen:updated");
            $('.form-control').prop('disabled', true);
        },
        chosenProvinces: function () {

            var self = this;

            // retrieve provinces
            $.ajax({url: '/api/1.0/provinces', method: 'GET'}).done(function (response) {
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
        chosenCountries: function () {

            var self = this;

            // retrieve countries
            $.ajax({url: '/api/1.0/countries', method: 'GET'}).done(function (response) {
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
        chosenCities: function () {
            var self = this;

            // retrieve cities
            $.ajax({
                url: '/api/1.0/cities',
                method: 'GET',
                data: {'province_id': self.employee.address_province_id}
            }).done(function (response) {
                if (response.data) {
                    self.cities_chosen = response.data;
                }
                self.city = self.employee.address_city_id;

                // watcher for chosen
                var citiesChosenWatcher = setInterval(function () {
                    if (self.employee.address_province_id != null) {
                        $('.vue-chosen').trigger("chosen:updated");
                        $('#address_city_id').trigger('chosen:open')
                        clearInterval(citiesChosenWatcher);
                    }
                }, 1);
            });
        },
    },
}
