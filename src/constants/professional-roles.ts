export const PROFESSIONAL_ROLES = [
  // Tech
  { value: "software_developer", label: "Software Developer" },
  { value: "data_ai_engineer", label: "Data / AI Engineer" },
  { value: "devops_cloud_engineer", label: "DevOps / Cloud Engineer" },
  { value: "solutions_architect", label: "Solutions Architect" },
  { value: "qa_security_engineer", label: "QA / Security Engineer" },
  { value: "tech_lead", label: "Tech Lead / Engineering Manager" },
  { value: "cto_vp_engineering", label: "CTO / VP of Engineering" },

  // Product & Design
  { value: "product_manager", label: "Product Manager" },
  { value: "ux_product_designer", label: "UX / Product Designer" },

  // Marketing & Comms
  { value: "marketing_manager", label: "Marketing Manager" },
  { value: "communications_pr", label: "Communications / PR Specialist" },
  { value: "content_creator", label: "Content Creator / Copywriter" },

  // Finance & Legal
  { value: "finance_manager", label: "Finance Manager / Controller" },
  { value: "accountant", label: "Accountant" },
  { value: "lawyer_legal", label: "Lawyer / Legal Counsel" },

  // Other roles
  { value: "project_manager", label: "Project Manager" },
  { value: "hr_people_manager", label: "HR / People Manager" },
  { value: "startup_founder", label: "Startup Founder / CEO" },
  { value: "freelancer_consultant", label: "Freelancer / Consultant" },
  { value: "developer_advocate", label: "Developer Advocate" },
  { value: "technical_writer", label: "Technical Writer" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" },
] as const;

export type ProfessionalRoleValue = (typeof PROFESSIONAL_ROLES)[number]["value"];

export const PROFESSIONAL_ROLE_VALUES = PROFESSIONAL_ROLES.map((r) => r.value);
