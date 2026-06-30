export type Cohort = {
  id: string;
  name: string;
  join_code: string;
  active_session_id: number | null;
  chat_enabled: boolean;
  is_archived: boolean;
  created_at: string;
};

export type Team = {
  id: string;
  code: string;
  name: string;
  emoji: string | null;
  cohort_id: string;
  created_at: string;
};

export type Student = {
  id: string;
  team_id: string | null;
  cohort_id: string;
  display_name: string;
  email: string;
  created_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  student_id: string;
  joined_at: string;
};

export type Achievement = {
  id: string;
  cohort_id: string;
  slug: string;
  session_number: number;
  block_number: number;
  title: string;
  description: string;
  xp: number;
  proof_type: string;
  proof_config: Record<string, unknown>;
  is_secret: boolean;
  is_active: boolean;
  is_unlocked: boolean;
};

export type Submission = {
  id: string;
  team_id: string;
  student_id: string;
  achievement_id: string;
  proof_data: Record<string, unknown>;
  screenshot_url: string | null;
  status: "auto_approved" | "pending" | "approved" | "rejected";
  xp_awarded: number;
  submitted_at: string;
  reviewed_at: string | null;
};

export type Session = {
  id: number;
  title: string;
};

export type InstructorAction = {
  id: string;
  instructor_email: string;
  submission_id: string | null;
  team_id: string | null;
  action: string;
  xp_delta: number;
  note: string | null;
  created_at: string;
};

export type ManualXpGrant = {
  id: string;
  team_id: string;
  xp: number;
  reason: string;
  granted_by: string;
  created_at: string;
};
