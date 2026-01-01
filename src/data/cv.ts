import type { Education, Experience, Skill } from '@/types/cv';

export const experiences = [
  {
    company: 'Boston University — Biological Design Center',
    start: '2020-09-01',
    end: null,
    title: 'PhD Candidate',
    location: 'Boston, MA, USA',
    description:
      'Developing genetic circuits, high-throughput functional assays, and DNA sequence-to-expression models to steer cell physiology for synthetic biology applications.',
  },
  {
    company: 'LanzaTech — Synthetic Biology & Host Strain Engineering',
    start: '2022-05-01',
    end: '2022-08-01',
    title: 'Engineering Biology Research Consortium Intern',
    location: 'Chicago, IL, USA',
    description:
      'Contributed to genetic tool development for gas-fermenting strains. Helped establish experimental + computational workflows for pooled DNA libraries, high-throughput screening, NGS, and biosensors.',
  },
  {
    company:
      'Imperial College London — Centre for Synthetic Biology (with The Francis Crick Institute)',
    start: '2018-08-01',
    end: '2020-07-01',
    title: 'Postgraduate Researcher (MRes)',
    location: 'London, UK',
    description:
      'Built a robotics-enabled, high-throughput wet-lab workflow to study metabolic cross-feeding in yeast; developed R pipelines to identify synergistic co-growth pairs (led to co-first authorship in Nat. Chem. Biol.).',
  },
  {
    company: 'Science Entrepreneur Club',
    start: '2019-03-01',
    end: '2019-12-01',
    title: 'Outreach Manager',
    location: 'London, UK',
    description:
      'Partner engagement, event execution, and digital content highlighting early-stage life-science startups.',
  },
  {
    company: 'SRI International — Center for Macromolecular Bioscience',
    start: '2017-06-01',
    end: '2018-08-01',
    title: 'Student Associate',
    location: 'Shenandoah Valley, VA, USA',
    description:
      'Analyzed peptide drug-candidate internalization in mammalian cells (flow cytometry, Western blotting) and supported development of cell-type-specific cancer therapies.',
  },
  {
    company: 'James Madison University — School of Integrated Sciences',
    start: '2014-01-01',
    end: '2017-12-31',
    title: 'Undergraduate Researcher (REU)',
    location: 'Harrisonburg, VA, USA',
    description:
      'Characterized human Uba1 enzyme; purified ubiquitin-like proteins from E. coli (SEC, ion-exchange chromatography).',
  },
] satisfies Experience[];

export const education = [
  {
    school: 'Boston University',
    start: '2020-09-01',
    end: null,
    degree:
      'PhD Candidate, Molecular Biology, Cell Biology, and Biochemistry (MCBB)',
    location: 'Boston, MA, USA',
    description:
      'Advisor: Mary J. Dunlop. Thesis: “Molecular Sequence Design for Interfacing with Gene Regulatory Networks.”',
  },
  {
    school: 'Imperial College London',
    start: '2018-01-01',
    end: '2019-12-31',
    degree: 'MRes, Systems & Synthetic Biology (Distinction)',
    location: 'London, UK',
    description:
      'Outstanding Student award; coursework across experimental & theoretical systems biology and synthetic biology. Advisors: Rodrigo Ledesma-Amaro (primary), Markus Ralser. Thesis: “A Screening Platform to Identify Synthetic Microbial Communities.”',
  },
  {
    school: 'James Madison University',
    start: '2014-01-01',
    end: '2018-12-31',
    degree: 'B.S., Biotechnology (Magna Cum Laude, GPA 3.72)',
    location: 'Harrisonburg, VA, USA',
    description:
      'President, Biotechnology Association; Executive board, Tri-Beta Biological Honor Society.',
  },
] satisfies Education[];

export const skills = [
  {
    title: 'Computational Biology',
    description:
      'Python, R, Git; pandas, NumPy, scikit-learn, PyTorch, TensorBoard; ggplot2, dplyr; Jupyter, VS Code.',
  },
  {
    title: 'Systems & Synthetic Biology',
    description:
      'DNA assembly, genetic circuit design, genomic integration, metabolic engineering; biosensor development.',
  },
  {
    title: 'High-Throughput Screening & NGS',
    description:
      'Pooled variant library design; automated liquid handlers and colony pickers; assay design; amplicon sequencing.',
  },
  {
    title: 'Microbiology & Bioprocess',
    description:
      'E. coli, S. cerevisiae, C. auto; cloning, transformations, conjugations; anaerobic chambers and gas fermentation.',
  },
  {
    title: 'Cell Biology & Biochemistry',
    description:
      'Mammalian tissue culture, protein purification, ELISAs, Western blotting.',
  },
  {
    title: 'Teaching & Mentorship',
    description:
      'Teaching Fellow, BU BE 209 (Sp2021 eval 4.92/5.00; Fa2023 eval 4.53/5.00); supervised grad rotations & undergrad team projects.',
  },
  {
    title: 'Leadership & Service',
    description:
      'BDC SPIN organizer; EBRC industry liaison; Science Entrepreneur Club outreach; JMU Biotech Assoc. president; Tri-Beta exec board.',
  },
] satisfies Skill[];
