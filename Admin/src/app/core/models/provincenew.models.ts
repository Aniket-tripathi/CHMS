export interface provincenew {
  provinceId: number;
  countryId: number;
  provinceName: string;

  addDate: string;
  addTime: string;
  Status: string;
}

export interface ProvinceResponse {
  provinces: provincenew[];
}
