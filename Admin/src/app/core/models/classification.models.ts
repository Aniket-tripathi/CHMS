// export interface classification {
//     clinic_id: number,
//     classification: string,
//     clfcolor: string,
//     clfimg: string,
//     addtime: string,
//     adddate: string
// }

// export interface ClassificationResponse {
//     classifications: classification[];
// }


//Avni
export interface classification {
    id: number,
    clinic_id: number,
    classification: string,
    clfcolor: string,
    clfimg: string,
    addtime: string,
    adddate: string
}


export interface classificationResponse {

    classifications: any;
    classification: classification[];

}