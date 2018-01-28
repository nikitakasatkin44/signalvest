const formatter = new Intl.DateTimeFormat("ru", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
});

exports.curDate = function(mongoDate) {
    const t = formatter.format(mongoDate).split(' ');
    return t[2] + '.' + t[1].replace('M', '') + '.' + t[0] + ' ' + t[3];
};