export const profile = {
  fullName: 'Eric J. South',
  title: 'PhD Candidate',
  institute: 'Boston University',
  author_name: 'Eric J. South', // used to highlight your name in papers
  // Short homepage blurb (used in Hero)
  about:
    "PhD Candidate in the Dunlop Lab at Boston University's Biological Design Center. I develop genetic circuits, high-throughput functional assays, and DNA sequence‑to‑expression models to steer cell physiology for synthetic biology applications. Previously: Imperial College London; James Madison University.",
  // Shown on /research and in the left nav
  research_areas: [
    {
      title: 'Systems & Synthetic Biology',
      description:
        'Designing and tuning genetic circuits to steer cell physiology; transcriptional control; biosensors.',
      field: 'biology',
      image: '/images/research/EJS.png',
    },
    {
      title: 'Computational Regulatory Genomics',
      description:
        'DNA sequence-to-expression modeling; promoter design; CNNs for TF binding and expression prediction.',
      field: 'computer-science',
    },
    {
      title: 'High-Throughput Screening',
      description:
        'Pooled library design, robotics-driven assays, and NGS analysis to explore large design spaces.',
      field: 'engineering',
    },
    {
      title: 'Microbial Communities & Metabolism',
      description:
        'Cross-feeding yeast communities; pathway balancing for bioproduction.',
      field: 'biology',
    },
  ],
};

// Set an empty string to hide any icon you don’t want to display
export const social = {
  email: 'esouth@bu.edu',
  linkedin: 'https://www.linkedin.com/in/eric-south-xyz/',
  x: '',
  github: 'https://github.com/e-south',
  gitlab: '',
  scholar: '', // add your Google Scholar URL when ready
  inspire: '',
  arxiv: '',
  orcid: '',
};

const basePath = import.meta.env.PUBLIC_BASE_PATH;
if (basePath === undefined) {
  throw new Error(
    'PUBLIC_BASE_PATH is required (use "" for root deploys). Set it in .env.',
  );
}

export const template = {
  menu_left: false,
  transitions: true,
  lightTheme: 'light',
  darkTheme: 'dark',
  excerptLength: 200,
  postPerPage: 5,
  base: basePath, // e.g., '/personal-site' if you deploy to GitHub Pages
};

export const seo = {
  default_title: 'Eric J. South — Systems & Synthetic Biology',
  default_description:
    "PhD Candidate at Boston University's Biological Design Center. Genetic circuits, high-throughput assays, and sequence-to-expression models.",
  default_image: '/images/astro-academia.png',
};
