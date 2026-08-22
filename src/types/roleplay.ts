export type ScenarioCategory = 'restaurant' | 'airport' | 'interview' | 'hotel' | 'shopping' | 'travel';
export type ScenarioDifficulty = 'easy' | 'medium' | 'hard';

export interface DialogueTurn {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  ipa?: string;
  meaningVi: string;
  hint?: string;
  acceptableAlternatives?: string[];
}

export interface CharacterProfile {
  name: string;
  role: string;
  avatar: string;
  voiceGender?: 'male' | 'female';
}

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  difficulty: ScenarioDifficulty;
  icon: string;
  color: string;
  location: string;
  xpReward: number;
  aiCharacter: CharacterProfile;
  userRole: CharacterProfile;
  dialogue: DialogueTurn[];
}

export interface RoleplayTurnResult {
  turnId: string;
  score: number;
  transcript: string;
  isPassed: boolean;
}

export interface RoleplaySessionResult {
  scenarioId: string;
  totalScore: number;
  earnedXP: number;
  passedTurns: number;
  totalTurns: number;
  stars: 1 | 2 | 3;
}
