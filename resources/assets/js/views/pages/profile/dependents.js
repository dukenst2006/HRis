module.exports = {
    template: require('./dependents.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function () {
        this.page_title = ((this.$route.path.indexOf('pim') > -1) ? 'Employee\'s ' : 'My ') + 'Dependents';
    },
    data: function () {
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
                dependent_id: 0,
            }
        }
    },

    ready: function () {

        var self = this;

        this.queryDatabase();
        this.chosenRelationships();
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
                self.dependents = response.data.dependents;

                $.ajax({
                    url: '/api/1.0/relationships', method: 'GET', data: {'table_view': true},
                }).done(function (response) {
                    self.relationships = response.data;
                });

            });
        },
        toggleModal: function () {

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
                clearBtn: true,
            });

            $('#dependent_modal').modal('toggle');
            $('#dependent_modal').on('shown.bs.modal', function () {
                $('#first_name').focus();
            });
        },
        submitForm: function () {

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
                                swal({title: response.text, type: 'success', timer: 2000});
                            }
                            else {
                                self.dependents.push(response.data.dependent);
                                swal({title: response.data.text, type: 'success', timer: 2000});
                            }
                            break;
                        case 500:
                            swal({title: response.text, type: 'error', timer: 2000});
                            break;
                    }
                });
            }
            else {
                $('#dependent_modal').on('shown.bs.modal', function () {
                    $('.vue-chosen', this).trigger('chosen:open');
                });
            }
        },
        updateRowInTable: function () {
            this.dependents[this.editIndex].first_name = this.modal.first_name;
            this.dependents[this.editIndex].middle_name = this.modal.middle_name;
            this.dependents[this.editIndex].last_name = this.modal.last_name;
            this.dependents[this.editIndex].relationship_id = this.modal.relationship_id;
            this.dependents[this.editIndex].birth_date = this.modal.birth_date;
        },
        editRecord: function (dependent, index) {
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
        deleteRecord: function (dependent, index) {
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
                        data: {id: dependent.id},
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({title: response.text, type: 'success', timer: 2000});
                                self.dependents.splice(index, 1);
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
        assignValuesToModal: function (dependent) {
            this.modal.dependent_id = dependent.id;
            this.modal.first_name = dependent.first_name;
            this.modal.middle_name = dependent.middle_name;
            this.modal.last_name = dependent.last_name;
            this.modal.relationship_id = dependent.relationship_id;
            this.modal.relationship = dependent.relationship = this.modal.relationship_id;
            this.modal.birth_date = dependent.birth_date.substring(0, 10);
        },
        chosenRelationships: function () {

            var self = this;

            // retrieve relationships
            $.ajax({url: '/api/1.0/relationships', method: 'GET'}).done(function (response) {
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
}
