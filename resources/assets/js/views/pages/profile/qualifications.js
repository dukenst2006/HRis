module.exports = {
    template: require('./qualifications.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function () {
        this.page_title = ((this.$route.path.indexOf('pim') > -1) ? 'Employee\'s ' : 'My ') + 'Qualifications';
    },
    data: function () {
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
                education_levels: [{}],
            },
        }
    },
    ready: function () {
        this.queryDatabase();
        this.chosenEducationLevels();
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
                self.employee.id = response.data.id;
                self.work_experiences = self.employee.work_experiences;
            });
        },

        chosenEducationLevels: function () {

            var self = this;

            // retrieve education levels
            $.ajax({url: '/api/1.0/education-levels', method: 'GET'}).done(function (response) {
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
        toggleModal: function (type) {

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
                clearBtn: true,
            });

            $('#' + type + '_modal').modal('toggle');
            $('#' + type + '_modal').on('shown.bs.modal', function () {
                if (type == 'work_experience') {
                    $('#company').focus();
                }
            });
        },
        submitWorkExperienceForm: function () {
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
                            swal({title: response.text, type: 'success', timer: 2000});
                        }
                        else {
                            self.work_experiences.push(response.data.work_experience);
                            swal({title: response.data.text, type: 'success', timer: 2000});
                        }
                        break;
                    case 500:
                        swal({title: response.text, type: 'error', timer: 2000});
                        break;
                }
            });

        },
        editWorkExperienceRecord: function (work_experience, index) {
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
        deleteWorkExperienceRecord: function (work_experience, index) {
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
                        data: {id: work_experience.id},
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({title: response.text, type: 'success', timer: 2000});
                                self.work_experiences.splice(index, 1);
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
        updateRowInTable: function () {
            this.work_experiences[this.editIndex].company = this.work_experience_modal.company;
            this.work_experiences[this.editIndex].job_title = this.work_experience_modal.job_title;
            this.work_experiences[this.editIndex].from_date = this.work_experience_modal.from_date;
            this.work_experiences[this.editIndex].to_date = this.work_experience_modal.to_date;
            this.work_experiences[this.editIndex].comment = this.work_experience_modal.comment;
        },
        assignValuesToWorkExperienceModal: function (work_experience) {
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
                clearBtn: true,
            });
        },
    }
}
