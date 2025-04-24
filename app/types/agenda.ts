export type SectionContent = {
  id: string,
  type: 'section'
  title: string
  summary: string
}

export type TopicContent = {
  id: string,
  type: 'topic'
  title: string
  description: string
}

export type ObjectiveContent = {
  id: string,
  type: 'objective'
  title: string
  progress: number
}

export type ActionItemContent = {
  id: string,
  type: 'action-item'
  title: string
}

export type BlockContent =
  | SectionContent
  | TopicContent
  | ObjectiveContent
  | ActionItemContent

