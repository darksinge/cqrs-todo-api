export type Priority = 'low' | 'medium' | 'high'

export type Todo = {
  id: number
  text: string
  priority: Priority
  done?: boolean
  archived?: boolean
}
