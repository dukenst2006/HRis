module.exports = {
    template: require('./employee-list.html'),
    props: ['page_title', 'has_access', 'permission'],
    data: function () {
        return {
            employees: [{}]
        }
    },
    compiled: function() {
        this.page_title = 'Employee List';
    },
    ready: function() {
        this.getEmployeeList();
    },
    methods: {
        getEmployeeList: function () {

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
}
