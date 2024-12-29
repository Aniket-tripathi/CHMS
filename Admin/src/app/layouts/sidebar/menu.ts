import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.MENU.TEXT',
        isTitle: true
    },
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARD.TEXT',
        link: '/dashboards/saas',
        icon: 'bx-home-circle',
    },
    {
        id: 8,
        isLayout: true
    },
    {
        id: 9,
        label: 'MENUITEMS.APPS.TEXT',
        isTitle: true
    },



    {
        id: 10,
        icon: 'bx bxs-layer',
        label: 'MENUITEMS.RECEPTIONMANAGEMENT.TEXT',
        subItems: [
            {
                id: 11,
                label: 'MENUITEMS.RECEPTIONMANAGEMENT.LIST.APPOINTMENT',
                link: '/addappointment',
                parentId: 10
            },
            {
                id: 10,
                label: 'MENUITEMS.CALENDAR.TEXT',
                icon: 'bx-calendar',
                link: '/calendar',
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
        id: 11,
        icon: 'bx bxs-user-plus',
        label: 'MENUITEMS.PATIENTREGISTRATION.TEXT',
        subItems: [
            {
                id: 11,
                label: 'MENUITEMS.PATIENTREGISTRATION.LIST.ADDNEWPATIENT',
                link: '/patient/add',
                parentId: 10
            },
            {
                id: 12,
                label: 'MENUITEMS.PATIENTREGISTRATION.LIST.ADDNEWVISIT',
                link: '/visit/add',
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
                link: 'pages/starter',
                parentId: 10
            },
            {
                id: 12,
                label: 'MENUITEMS.PHARMACY.LIST.CREATEORDER',
                link: 'pages/starter',
                subItems: [
                    {
                        id: 13,
                        label: 'MENUITEMS.PHARMACY.LIST.PURCHASEORDER',
                        link: 'pages/starter',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.PHARMACY.LIST.REQUISITION',
                        link: 'pages/starter',
                        parentId: 12
                    }
                ],
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.DEMANDER',
                link: 'pages/starter',
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.SUPLIERS',
                link: 'pages/starter',
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.STOCKTRANSFER',
                link: 'pages/starter',
                subItems: [
                    {
                        id: 13,
                        label: 'MENUITEMS.PHARMACY.LIST.STOCKTAKE',
                        link: 'pages/starter',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.PHARMACY.LIST.INTERNALSTOCK',
                        link: 'pages/starter',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.PHARMACY.LIST.ROOMSTOCK',
                        link: 'pages/starter',
                        parentId: 12
                    }
                ],
                parentId: 10
            },
            {
                id: 11,
                label: 'MENUITEMS.PHARMACY.LIST.DISPENSING',
                link: 'pages/starter',
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
                link: 'pages/starter',
                subItems: [
                    {
                        id: 161,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ALLERGYGROUP',
                        link: 'pages/starter',
                        parentId: 16,
                    },
                    {
                        id: 162,
                        label: 'MENUITEMS.SYSTEMSETTING.LIST.ALLERGY',
                        link: 'pages/starter',
                        parentId: 16,
                    }
                ],
                parentId: 10,
            },
            {
                id: 16,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.COUNTER',
                link: '/counter',
                parentId: 10,
            },
            {
                id: 17,
                label: 'MENUITEMS.SYSTEMSETTING.LIST.AUDITTRIAL',
                link: '/audittrial',
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
                        label: "MENUITEMS.SYSTEMSETTING.LIST.PROVINCE",
                        link: "/province",
                        parentId: 17,
                    },
                    {
                        id: 177,
                        label: "MENUITEMS.SYSTEMSETTING.LIST.LEVEL",
                        link: "/level",
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














    // {
    //     id: 91,
    //     label: 'MENUITEMS.COMPONENTS.TEXT',
    //     isTitle: true
    // },
    // {
    //     id: 82,
    //     label: 'MENUITEMS.UTILITY.TEXT',
    //     icon: 'bx-file',
    //     subItems: [
    //         {
    //             id: 83,
    //             label: 'MENUITEMS.UTILITY.LIST.STARTER',
    //             link: '/pages/starter',
    //             parentId: 82
    //         },
    //         {
    //             id: 84,
    //             label: 'MENUITEMS.UTILITY.LIST.starter',
    //             link: '/pages/starter',
    //             parentId: 82
    //         },
    //         {
    //             id: 85,
    //             label: 'Coming Soon',
    //             link: '/pages/coming-soon',
    //             parentId: 82
    //         },
    //         {
    //             id: 86,
    //             label: 'MENUITEMS.UTILITY.LIST.TIMELINE',
    //             link: '/pages/timeline',
    //             parentId: 82
    //         },
    //         {
    //             id: 87,
    //             label: 'MENUITEMS.UTILITY.LIST.FAQS',
    //             link: '/pages/faqs',
    //             parentId: 82
    //         },
    //         {
    //             id: 88,
    //             label: 'MENUITEMS.UTILITY.LIST.PRICING',
    //             link: '/pages/pricing',
    //             parentId: 82
    //         },
    //         {
    //             id: 89,
    //             label: 'MENUITEMS.UTILITY.LIST.ERROR404',
    //             link: '/pages/404',
    //             parentId: 82
    //         },
    //         {
    //             id: 90,
    //             label: 'MENUITEMS.UTILITY.LIST.ERROR500',
    //             link: '/pages/500',
    //             parentId: 82
    //         },
    //     ]
    // },
    // {
    //     id: 92,
    //     label: 'MENUITEMS.UIELEMENTS.TEXT',
    //     icon: 'bx-tone',
    //     subItems: [
    //         {
    //             id: 93,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.ALERTS',
    //             link: '/ui/alerts',
    //             parentId: 92
    //         },
    //         {
    //             id: 94,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.BUTTONS',
    //             link: '/ui/buttons',
    //             parentId: 92
    //         },
    //         {
    //             id: 95,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.CARDS',
    //             link: '/ui/cards',
    //             parentId: 92
    //         },
    //         {
    //             id: 96,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.CAROUSEL',
    //             link: '/ui/carousel',
    //             parentId: 92
    //         },
    //         {
    //             id: 97,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.DROPDOWNS',
    //             link: '/ui/dropdowns',
    //             parentId: 92
    //         },
    //         {
    //             id: 98,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.GRID',
    //             link: '/ui/grid',
    //             parentId: 92
    //         },
    //         {
    //             id: 99,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.IMAGES',
    //             link: '/ui/images',
    //             parentId: 92
    //         },
    //         {
    //             id: 100,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.LIGHTBOX',
    //             link: '/ui/lightbox',
    //             parentId: 92
    //         },
    //         {
    //             id: 101,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.MODALS',
    //             link: '/ui/modals',
    //             parentId: 92
    //         },
    //         {
    //             id: 102,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.RANGESLIDER',
    //             link: '/ui/rangeslider',
    //             parentId: 92
    //         },
    //         {
    //             id: 103,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.PROGRESSBAR',
    //             link: '/ui/progressbar',
    //             parentId: 92
    //         },
    //         {
    //             id: 104,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.PLACEHOLDER',
    //             link: '/ui/placeholder',
    //             parentId: 92
    //         },
    //         {
    //             id: 105,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.SWEETALERT',
    //             link: '/ui/sweet-alert',
    //             parentId: 92
    //         },
    //         {
    //             id: 106,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.TABS',
    //             link: '/ui/tabs-accordions',
    //             parentId: 92
    //         },
    //         {
    //             id: 107,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.TYPOGRAPHY',
    //             link: '/ui/typography',
    //             parentId: 92
    //         },
    //         {
    //             id: 108,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.TOASTS',
    //             link: '/ui/toasts',
    //             parentId: 92
    //         },
    //         {
    //             id: 109,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.VIDEO',
    //             link: '/ui/video',
    //             parentId: 92
    //         },
    //         {
    //             id: 110,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.GENERAL',
    //             link: '/ui/general',
    //             parentId: 92
    //         },
    //         {
    //             id: 111,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.COLORS',
    //             link: '/ui/colors',
    //             parentId: 92
    //         },
    //         {
    //             id: 112,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.RATING',
    //             link: '/ui/rating',
    //             parentId: 92
    //         },
    //         {
    //             id: 113,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.NOTIFICATION',
    //             link: '/ui/notification',
    //             parentId: 92
    //         },
    //         {
    //             id: 114,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.UTILITIES',
    //             link: '/ui/utilities',
    //             parentId: 92
    //         },
    //         {
    //             id: 115,
    //             label: 'MENUITEMS.UIELEMENTS.LIST.CROPPER',
    //             link: '/ui/image-crop',
    //             parentId: 92
    //         },
    //     ]
    // },
    // {
    //     id: 116,
    //     label: 'MENUITEMS.FORMS.TEXT',
    //     icon: 'bxs-eraser',
    //     badge: {
    //         variant: 'danger',
    //         text: 'MENUITEMS.FORMS.BADGE',
    //     },
    //     subItems: [
    //         {
    //             id: 117,
    //             label: 'MENUITEMS.FORMS.LIST.ELEMENTS',
    //             link: '/form/elements',
    //             parentId: 116
    //         },
    //         {
    //             id: 118,
    //             label: 'MENUITEMS.FORMS.LIST.LAYOUTS',
    //             link: '/form/layouts',
    //             parentId: 116
    //         },
    //         {
    //             id: 119,
    //             label: 'MENUITEMS.FORMS.LIST.VALIDATION',
    //             link: '/form/validation',
    //             parentId: 116
    //         },
    //         {
    //             id: 120,
    //             label: 'MENUITEMS.FORMS.LIST.ADVANCED',
    //             link: '/form/advanced',
    //             parentId: 116
    //         },
    //         {
    //             id: 121,
    //             label: 'MENUITEMS.FORMS.LIST.EDITOR',
    //             link: '/form/editor',
    //             parentId: 116
    //         },
    //         {
    //             id: 122,
    //             label: 'MENUITEMS.FORMS.LIST.FILEUPLOAD',
    //             link: '/form/uploads',
    //             parentId: 116
    //         },
    //         {
    //             id: 123,
    //             label: 'MENUITEMS.FORMS.LIST.REPEATER',
    //             link: '/form/repeater',
    //             parentId: 116
    //         },
    //         {
    //             id: 124,
    //             label: 'MENUITEMS.FORMS.LIST.WIZARD',
    //             link: '/form/wizard',
    //             parentId: 116
    //         },
    //         {
    //             id: 125,
    //             label: 'MENUITEMS.FORMS.LIST.MASK',
    //             link: '/form/mask',
    //             parentId: 116
    //         }
    //     ]
    // },
    // {
    //     id: 126,
    //     icon: 'bx-list-ul',
    //     label: 'MENUITEMS.TABLES.TEXT',
    //     subItems: [
    //         {
    //             id: 127,
    //             label: 'MENUITEMS.TABLES.LIST.BASIC',
    //             link: '/tables/basic',
    //             parentId: 126
    //         },
    //         {
    //             id: 128,
    //             label: 'MENUITEMS.TABLES.LIST.DataTables',
    //             link: '/tables/advanced',
    //             parentId: 126
    //         }
    //     ]
    // },

    // {
    //     id: 135,
    //     label: 'MENUITEMS.ICONS.TEXT',
    //     icon: 'bx-aperture',
    //     subItems: [
    //         {
    //             id: 136,
    //             label: 'MENUITEMS.ICONS.LIST.BOXICONS',
    //             link: '/icons/boxicons',
    //             parentId: 135
    //         },
    //         {
    //             id: 137,
    //             label: 'MENUITEMS.ICONS.LIST.MATERIALDESIGN',
    //             link: '/icons/materialdesign',
    //             parentId: 135
    //         },
    //         {
    //             id: 138,
    //             label: 'MENUITEMS.ICONS.LIST.DRIPICONS',
    //             link: '/icons/dripicons',
    //             parentId: 135
    //         },
    //         {
    //             id: 139,
    //             label: 'MENUITEMS.ICONS.LIST.FONTAWESOME',
    //             link: '/icons/fontawesome',
    //             parentId: 135
    //         },
    //     ]
    // },


];

