export interface level {
  levelId: number;
  levelName: string;

  addDate: string;
  addTime: string;
  status: string;
}

export interface LevelResponse {
  levels: level[];
}
