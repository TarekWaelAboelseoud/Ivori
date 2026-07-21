/**
 * Admin portfolio references — public pages use selected-work.ts
 */
export {
  selectedWork as caseStudies,
  getSelectedWork as getCaseStudy,
  getFeaturedWork as getFeaturedCaseStudies,
  disciplineLabels,
  type SelectedWork as CaseStudy,
  type WorkDiscipline as CaseStudyService,
} from './selected-work'

export type CaseStudyKind = 'selected' | 'concept'
