import { ChartType } from './saas.model';

const earningLineChart: ChartType = {
    series: [{
        name: 'series1',
        data: [31, 40, 36, 51, 49, 72, 69, 56, 68, 82, 68, 76]
    }],
    chart: {
        height: 288,
        type: 'line',
        toolbar: 'false',
        dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 8,
            opacity: 0.2
        },
    },
    dataLabels: {
        enabled: false
    },
    colors: ['#556ee6'],
    stroke: {
        curve: 'smooth',
        width: 3,
    },
};

const salesAnalyticsDonutChart: ChartType = {
    series: [56, 38, 26],
    chart: {
        type: 'donut',
        height: 240,
    },
    labels: ['Series A', 'Series B', 'Series C'],
    colors: ['#556ee6', '#34c38f', '#f46a6a'],
    legend: {
        show: false,
    },
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
            }
        }
    }
};

const ChatData = [
    {
        name: 'Dr. Sarah Jones',
        message: 'Good morning, have we reviewed the lab reports for Mr. Smith?',
        time: '09:00',
    },
    {
        align: 'right',
        name: 'Nurse Emily Carter',
        message: 'Good morning, Dr. Jones. Yes, the reports came in an hour ago. Everything looks stable.',
        time: '09:05',
    },
    {
        name: 'Dr. Sarah Jones',
        message: 'Great, please schedule a follow-up for tomorrow afternoon.',
        time: '09:10',
    },
    {
        align: 'right',
        name: 'Nurse Emily Carter',
        message: 'Understood, I’ll confirm the appointment and update the system.',
        time: '09:12',
    },
    {
        name: 'Dr. Sarah Jones',
        message: 'Thanks, Emily. Let me know if anything changes.',
        time: '09:15',
    },
];


export { earningLineChart, salesAnalyticsDonutChart, ChatData };
