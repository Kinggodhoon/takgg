export enum SlackActionType {
  GET_AUTH_TOKEN = 'getAuthToken',
}

export interface SlackEventParams {
  type: string,
  user: {
    id: string,
    username: string,
    name: string,
    team_id: string,
  },
  token: string,
  actions: Array<{
    action_id: string,
    block_id: string,
    text: Array<Object>,
    value: SlackActionType,
    type: string,
    action_ts: string,
  }>
}
