module.exports = {
    template: require('./emergency-contacts.html'),
    props: ['page_title', 'has_access', 'permission', 'employee', 'job_titles', 'employment_statuses'],
    compiled: function () {
        this.page_title = ((this.$route.path.indexOf('pim') > -1) ? 'Employee\'s ' : 'My ') + 'Emergency Contacts';
    },
    data: function () {
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
                emergency_contact_id: 0,
            }
        }
    },
    ready: function () {
        this.queryDatabase();
        this.chosenRelationships();

        $("#emergencyContactsForm").submit(function(e){
            return false;
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
                self.employee.id = response.data.id;
                self.emergency_contacts = response.data.emergency_contacts;

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
            $('#home_phone').val('');
            $('#mobile_phone').val('');

            $('#emergency_contact_modal').modal('toggle');
            $('#emergency_contact_modal').on('shown.bs.modal', function () {
                $('#first_name').focus();
            });
        },
        submitForm: function () {

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
                                swal({title: response.text, type: 'success', timer: 2000});
                            }
                            else {
                                self.emergency_contacts.push(response.data.emergency_contact);
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
                $('#emergency_contact_modal').on('shown.bs.modal', function () {
                    $('.vue-chosen', this).trigger('chosen:open');
                });
            }
        },
        updateRowInTable: function () {
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
        editRecord: function (emergency_contact, index) {
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
        deleteRecord: function (emergency_contact, index) {
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
                        data: {id: emergency_contact.id},
                        beforeSend: function beforeSend(xhr) {
                            xhr.setRequestHeader("Authorization", Cookies.get('auth'));
                        }
                    }).done(function (response) {
                        switch (response.code) {
                            case 200:
                                swal({title: response.text, type: 'success', timer: 2000});
                                self.emergency_contacts.splice(index, 1);
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
        assignValuesToModal: function (emergency_contact) {
            this.modal.emergency_contact_id = emergency_contact.id;
            this.modal.first_name = emergency_contact.first_name;
            this.modal.middle_name = emergency_contact.middle_name;
            this.modal.last_name = emergency_contact.last_name;
            this.modal.relationship_id = emergency_contact.relationship_id;
            this.modal.relationship = emergency_contact.relationship = this.modal.relationship_id;
            this.modal.home_phone = emergency_contact.home_phone;
            this.modal.mobile_phone = emergency_contact.mobile_phone;
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
