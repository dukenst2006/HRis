module.exports = {
    template: require('./job.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function () {
        this.page_title = ((this.$route.path.indexOf('pim') > -1) ? 'Employee\'s ' : 'My ') + 'Job Details';
    },
    data: function () {
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

                self.job_histories = self.employee.job_histories;


                self.setDatepickerValues();
                self.chosenJobTitles();
                self.chosenEmploymentStatuses();
                self.chosenDepartments();
                self.chosenLocations();
            });
        },
        deleteRecord: function (job_history, index) {
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
                        data: {id: job_history.id},
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({title: response.text, type: 'success', timer: 2000});
                                self.job_histories.splice(index, 1);
                                self.setCurrentJobHistory();
                                break;
                            case 500:
                                swal({title: response.text, type: 'error', timer: 2000});
                                break;
                        }
                    });
                } else {
                    swal('Cancelled', 'No record has been deleted', 'error');
                }
            });
        },
        setCurrentJobHistory: function () {
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
        setDatepickerValues: function () {

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
        modifyForm: function () {

            $('.save-form').css('display', '');
            $('.modify-form').css('display', 'none');
            $('.vue-chosen').prop('disabled', false).trigger("chosen:updated");
            $('.form-control').prop('disabled', false);
            $('.i-checks').iCheck('enable');

            this.toggleDatepickers(true);

            $('#first_name').focus();
        },
        cancelForm: function () {
            // retrieve original data since cancel button was pressed.
            this.queryDatabase();

            $('.save-form').css('display', 'none');
            $('.modify-form').css('display', '');
            $('.vue-chosen').prop('disabled', true).trigger("chosen:updated");
            $('.form-control').prop('disabled', true);

            this.toggleDatepickers(false);
        },
        chosenJobTitles: function () {
            var self = this;

            // retrieve job-titles
            $.ajax({url: '/api/1.0/job-titles', method: 'GET'}).done(function (response) {
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
        chosenEmploymentStatuses: function () {
            var self = this;

            // retrieve employment-statuses
            $.ajax({url: '/api/1.0/employment-statuses', method: 'GET'}).done(function (response) {
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
        chosenDepartments: function () {
            var self = this;

            // retrieve departments
            $.ajax({url: '/api/1.0/departments', method: 'GET'}).done(function (response) {
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
        chosenLocations: function () {
            var self = this;

            // retrieve locations
            $.ajax({url: '/api/1.0/locations', method: 'GET'}).done(function (response) {
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
        toggleDatepickers: function (enable) {

            if (enable) {
                $('.input-group.date').datepicker({
                    format: 'yyyy-mm-dd',
                    keyboardNavigation: false,
                    forceParse: true,
                    calendarWeeks: true,
                    autoclose: true,
                    clearBtn: true,
                });

                $('#datepicker_effective_date .input-group.date').datepicker('update', this.employee.job_history.effective_date);
                $('#datepicker_joined_date .input-group.date').datepicker('update', this.employee.joined_date);
                $('#datepicker_probation_end_date .input-group.date').datepicker('update', this.employee.probation_end_date);
                $('#datepicker_permanency_date .input-group.date').datepicker('update', this.employee.permanency_date);
            }
            else {
                $('#datepicker_effective_date .input-group.date').datepicker('remove');
                $('#datepicker_joined_date .input-group.date').datepicker('remove');
                $('#datepicker_probation_end_date .input-group.date').datepicker('remove');
                $('#datepicker_permanency_date .input-group.date').datepicker('remove');
            }
        },
        submitForm: function () {
            var self = this;

            // jasny bug work around
            $('#comments').focus();

            if (!self.employee.job_history.effective_date) {
                swal({title: 'Effective Date is a required field', type: 'error', timer: 2000});
                //$('#effective_date').focus();
                return false;
            }

            $.ajax({
                url: '/api/1.0/profile/job',
                method: 'PATCH',
                data: {'id': this.id, 'employee': this.employee},
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                }
            }).done(function (response) {
                switch (response.code) {
                    case 200:
                        if (response.code.job_history) {
                            self.job_histories.unshift(response.code.job_history);
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
    }
}
