$(document).ready(function() {
    $('.barIcon').click(function() {
        $('.sidebar').toggleClass('sidebarClosed');
        $('.plotter, #directoryTree').toggle();
        $('.custom-header').toggleClass('headerClosed');
        $('.content').toggleClass('contentClosed');

    });
});