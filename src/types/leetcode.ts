export interface LeetcodeAboutResponse {
  about: string;
}

export interface LeetcodeProfileResponse {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  submissionCalendar: Record<string, number>;
}

export interface LeetcodeContestResponse {
  contestAttend: number;
  contestRating: number;
  contestGlobalRanking: number;
  totalParticipants: number;
  contestTopPercentage: number;
}

export interface LeetcodeContestHistoryItem {
  attended: boolean;
  trendDirection?: string;
  problemsSolved?: number;
  totalProblems?: number;
  finishTimeInSeconds?: number;
  rating: number;
  ranking: number;
  contest: {
    title: string;
    startTime: number;
  };
}

export interface LeetcodeContestHistoryResponse {
  count: number;
  contestHistory: LeetcodeContestHistoryItem[];
}
