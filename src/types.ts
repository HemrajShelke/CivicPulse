export interface Comment {
  author: string;
  text: string;
  date: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: "Road Infrastructure" | "Sewage & Water" | "Electricity" | "Garbage & Waste" | "Traffic & Transit" | "Health & Sanitation";
  severity: "Critical" | "Medium" | "Low";
  department: string;
  status: "Reported" | "In Progress" | "Resolved";
  address: string;
  lat: number;
  lng: number;
  reporterName: string;
  reporterEmail: string;
  votes: number;
  comments: Comment[];
  createdAt: string;
  slaTime: string;
  karmaPoints: number;
  ward: string;
  image?: string | null;
  imageURL?: string | null;
  voice?: string | null;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  ward?: string;
  city?: string;
  karmaPoints: number;
  streak: number;
  reportedCount: number;
}

export interface Squad {
  id: string;
  name: string;
  city: string;
  memberCount: number;
  points: number;
  completedTasks: number;
  description: string;
}
