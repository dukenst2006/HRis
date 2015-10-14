module.exports = {
    template: require('./salary.html'),
    props: ['page_title', 'has_access', 'permission'],
    compiled: function () {
        this.page_title = ((this.$route.path.indexOf('pim') > -1) ? 'Employee\'s ' : 'My ') + 'Salary';
    },
}
