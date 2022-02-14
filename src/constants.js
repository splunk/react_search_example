export const formInputTypes = ['relative'];

export const presets = [
    { label: 'Today', earliest: '@d', latest: 'now' },
    { label: 'Week to date', earliest: '@w0', latest: 'now' },
    { label: 'Business week to date', earliest: '@w1', latest: 'now' },
    { label: 'Month to date', earliest: '@mon', latest: 'now' },
    { label: 'Year to date', earliest: '@y', latest: 'now' },
    { label: 'Yesterday', earliest: '-1d@d', latest: '@d' },
    { label: 'Previous week', earliest: '-7d@w0', latest: '@w0' },
    { label: 'Previous business week', earliest: '-6d@w1', latest: '-1d@w6' },
    { label: 'Previous month', earliest: '-1mon@mon', latest: '@mon' },
    { label: 'Previous year', earliest: '-1y@y', latest: '@y' },
    { label: 'Last 15 minutes', earliest: '-15m', latest: 'now' },
    { label: 'Last 60 minutes', earliest: '-60m@m', latest: 'now' },
    { label: 'Last 4 hours', earliest: '-4h@m', latest: 'now' },
    { label: 'Last 24 hours', earliest: '-24h@h', latest: 'now' },
    { label: 'Last 7 days', earliest: '-7d@h', latest: 'now' },
    { label: 'Last 30 days', earliest: '-30d@d', latest: 'now' },
    { label: 'All time', earliest: '0', latest: '' },
];