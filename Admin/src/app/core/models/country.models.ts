export interface country {
    countryId: number;
    ISO: string;
    countryName: string;
    numCode: string;
    phoneCode: number;

    addDate: string;
    addTime: string;
}

export interface CountryResponse {
    countrys: country[];
}
