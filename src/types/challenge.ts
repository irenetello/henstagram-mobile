export type ChallengeStatus = "active" | "ended";

export type Challenge = {
  id: string;
  title: string;
  prompt: string;
  createdByUid: string;
  createdByName?: string | null;
  startAt: any; // Timestamp
  endAt: any; // Timestamp
  status: ChallengeStatus;
  coverImageUrl?: string | null;
  createdAt?: any; // Timestamp
};
