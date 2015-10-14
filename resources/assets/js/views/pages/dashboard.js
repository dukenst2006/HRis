module.exports = {
    template: require('./dashboard.html'),
    props: ['page_title', 'has_access', 'permission'],
    compiled: function () {
        this.page_title = 'Dashboard';
    },
}
