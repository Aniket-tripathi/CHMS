import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARD.TEXT',
        link: '/dashboards/saas',
        icon: 'bx-home-circle',
    },
    {
        id: 10,
        icon: 'bx bxs-layer',
        label: 'MENUITEMS.RECEPTIONMANAGEMENT.TEXT',
        subItems: [
            {
                id: 11,
                label: 'MENUITEMS.RECEPTIONMANAGEMENT.LIST.APPOINTMENT',
                link: '/appointment',
                parentId: 10
            },
            {
                id: 12,
                label: 'MENUITEMS.RECEPTIONMANAGEMENT.LIST.QUEUE',
                link: '',
                subItems: [
                    {
                        id: 13,
                        label: 'MENUITEMS.RECEPTIONMANAGEMENT.LIST.MANUALTOKEN',
                        link: '/token',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.RECEPTIONMANAGEMENT.LIST.DISPLAYADMINISTRATION',
                        link: '/display-administration',
                        parentId: 12
                    },
                    {
                        id: 15,
                        label: 'MENUITEMS.RECEPTIONMANAGEMENT.LIST.DISPLAYPHARMACY',
                        link: '/display-pharmacy',
                        parentId: 12
                    },
                    {
                        id: 16,
                        label: 'MENUITEMS.RECEPTIONMANAGEMENT.LIST.MANUALTOKENPHARMACY',
                        link: '/token/token-pharmacy',
                        parentId: 12
                    }
                ],
                parentId: 10
            }
        ]
    },
    {
        id: 12,
        icon: 'bx bxs-clinic',
        label: 'MENUITEMS.CLINICALSERVICES.TEXT',
        subItems: [
            {
                id: 13,
                label: 'MENUITEMS.CLINICALSERVICES.LIST.VITALS',
                link: '/vital/add',
                parentId: 14
            },
            {
                id: 15,
                label: 'MENUITEMS.CLINICALSERVICES.LIST.PATIENTCARE',
                link: '/patientCare/outpatients',
                parentId: 12
            }
        ]
    },
    {
        id: 10,
        icon: 'bx bxs-capsule',
        label: 'MENUITEMS.PHARMACY.TEXT',
        subItems: [
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.CATALOGUE',
                link: '/tables/basic',
                parentId: 10
            },
            {
                id: 12,
                label: 'MENUITEMS.PHARMACY.LIST.CREATEORDER',
                link: '/tables/advanced',
                subItems: [
                    {
                        id: 13,
                        label: 'MENUITEMS.PHARMACY.LIST.PURCHASEORDER',
                        link: '/queue/manual-token',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.PHARMACY.LIST.REQUISITION',
                        link: '/queue/manual-token',
                        parentId: 12
                    }
                ],
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.DEMANDER',
                link: '/tables/basic',
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.SUPLIERS',
                link: '/tables/basic',
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.STOCKTRANSFER',
                link: '/tables/basic',
                subItems: [
                    {
                        id: 13,
                        label: 'MENUITEMS.PHARMACY.LIST.STOCKTAKE',
                        link: '/queue/manual-token',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.PHARMACY.LIST.INTERNALSTOCK',
                        link: '/queue/manual-token',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.PHARMACY.LIST.ROOMSTOCK',
                        link: '/queue/manual-token',
                        parentId: 12
                    }
                ],
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.DISPENSING',
                link: '/tables/basic',
                parentId: 10
            },
        ]
    },

    {
        id: 10,
        icon: 'bx bxs-cog',
        label: 'MENUITEMS.SYSTEMSETTING.TEXT',
        subItems: [
            {
                id: 12,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.CLINIC',
                link: '',
                subItems: [
                    {
                        id: 121,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ADDCLINIC',
                        link: '/clinic/add',
                        parentId: 12,
                    },
                    {
                        id: 122,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.CLINICLIST',
                        link: '/clinic/list',
                        parentId: 12,
                    },
                    {
                        id: 123,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.CLINICSCHEDULE',
                        link: '/clinic/schedule',
                        parentId: 12,
                    }
                ],
                parentId: 10,
            },
            {
                id: 13,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.STAFF',
                link: '',
                subItems: [
                    {
                        id: 131,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ADDSTAFF',
                        link: '/staff/add',
                        parentId: 13,
                    },
                    {
                        id: 132,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.STAFFLIST',
                        link: '/staff/list',
                        parentId: 13,
                    }
                ],
                parentId: 10,
            },
            {
                id: 14,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.REASON',
                link: '/tables/basic',
                subItems: [
                    {
                        id: 141,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.APPOINTMENTREASON',
                        link: '/appointment-reason',
                        parentId: 14,
                    }
                ],
                parentId: 10,
            },
            {
                id: 15,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.STREAMALLOCATION',
                link: '',
                subItems: [
                    {
                        id: 151,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.STREAMS',
                        link: '/streams',
                        parentId: 15,
                    },
                    {
                        id: 152,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.STREAMCLASSIFICATION',
                        link: '/streams/classification',
                        parentId: 15,
                    }
                ],
                parentId: 10,
            },
            {
                id: 16,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.ALLERGIES',
                link: '/tables/basic',
                subItems: [
                    {
                        id: 161,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ALLERGYGROUP',
                        link: '/queue/manual-token',
                        parentId: 16,
                    },
                    {
                        id: 162,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ALLERGY',
                        link: '/queue/manual-token',
                        parentId: 16,
                    }
                ],
                parentId: 10,
            },
            {
                id: 17,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.SETTINGS',
                link: '',
                subItems: [
                    {
                        id: 171,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ROLE',
                        link: '/roles',
                        parentId: 17,
                    },
                    {
                        id: 172,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.DEPARTMENT',
                        link: '/department',
                        parentId: 17,
                    },
                    {
                        id: 173,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.DESIGNATION',
                        link: '/designation',
                        parentId: 17,
                    },
                    {
                        id: 174,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.REGION',
                        link: '/region',
                        parentId: 17,
                    },
                    {
                        id: 175,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.WARD',
                        link: '/ward',
                        parentId: 17,
                    },
                    {
                        id: 176,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ASSIGNMENU',
                        link: '/assign/menu',
                        parentId: 17,
                    }
                ],
                parentId: 10,
            },
        ]
    },
];

