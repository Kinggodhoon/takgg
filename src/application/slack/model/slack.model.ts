export enum SlackActionType {
  GET_AUTH_TOKEN = 'getAuthToken',
  INVALID_GAME = 'invalidGame',
  VALIDATED_GAME = 'validatedGame',
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
    action_id: SlackActionType,
    block_id: string,
    text: Array<Object>,
    value: string,
    type: string,
    action_ts: string,
  }>
}
