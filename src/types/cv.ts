export interface Experience {
  company: string;
  start: string;
  end?: string | null;
  title: string;
  location?: string;
  description?: string;
}

export interface Education {
  school: string;
  start: string;
  end?: string | null;
  degree: string;
  location?: string;
  description?: string;
}

export interface Skill {
  title: string;
  description: string;
}

export function isExperience(
  element: Experience | Education,
): element is Experience {
  return 'title' in element && 'company' in element;
}

export function isEducation(
  element: Education | Experience,
): element is Education {
  return 'school' in element && 'degree' in element;
}
