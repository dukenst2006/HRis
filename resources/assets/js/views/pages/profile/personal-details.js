module.exports = {
    template: require('./personal-details.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function () {
        this.page_title = ((this.$route.path.indexOf('pim') > -1) ? 'Employee\'s ' : 'My ') + 'Personal Details';
    },
    data: function () {
        return {
            id: '',
            nationality: '',
            nationalities_chosen: [{}],
            marital_status: '',
            marital_statuses_chosen: [{}],
            original_employee_id: '',
        }

    },
    ready: function () {
        this.queryDatabase();
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
        submitForm: function () {
            var self = this;

            // jasny bug work around
            $('#first_name').focus();

            $.ajax({
                url: '/api/1.0/profile/personal-details',
                method: 'PATCH',
                data: {'id': this.id, 'employee': this.employee},
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
                                params: {employee_id: response.data.employee.employee_id}
                            });
                        }

                        self.$route.params.employee_id = response.data.employee.employee_id;
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
                clearBtn: true,
            }).datepicker('update', this.employee.birth_date);

            $('#first_name').focus();
        },
        cancelForm: function () {
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
        switchGender: function (gender) {
            switch (gender) {
                case 'M' :
                    $('input[id="gender[1]"]').iCheck('check');
                    break;
                case 'F' :
                    $('input[id="gender[2]"]').iCheck('check');
                    break;
            }
        },
        updateLocalStorage: function (new_employee_id) {
            var self = this;

            if (self.original_employee_id == localStorage.getItem('employee_id')) {
                localStorage.setItem('employee_id', new_employee_id);
            }
        },
        chosenNationalities: function () {
            var self = this;

            // retrieve nationalities
            $.ajax({url: '/api/1.0/nationalities', method: 'GET'}).done(function (response) {
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
        chosenMaritalStatuses: function () {
            var self = this;

            // retrieve marital status
            $.ajax({url: '/api/1.0/marital-statuses', method: 'GET'}).done(function (response) {
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
}
