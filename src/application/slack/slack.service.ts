import { WebClient, UsersProfileGetResponse } from '@slack/web-api';

import Config from '../../config/Config';
import { GameResult } from '../games/model/games.model';

class SlackService {
  private slackClient: WebClient;

  constructor() {
    this.slackClient = new WebClient(Config.getConfig().SLACK_BOT_CONFIG.BOT_TOKEN);
  }

  public getUserProfile = async (userId: string): Promise<UsersProfileGetResponse> => {
    const getUserProfileResponse = await this.slackClient.users.profile.get({ user: userId });

    return getUserProfileResponse;
  };

  public sendAuthTokenMessage = async (player: { playerId: string, displayName: string }, oneTimeToken: string): Promise<boolean> => {
    await this.slackClient.chat.postMessage({
      channel: player.playerId,
      blocks: [
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Hi ${player.displayName}!*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "*Here's your [TakGG] Auth secret key!*",
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `> *SecretKey: *\`${oneTimeToken}\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Good luck with your future games! :table_tennis_paddle_and_ball:*',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "_If you don't have the [TakGG] Application, DM Hoon!_",
          },
        },
        {
          type: 'divider',
        },
      ],
    });

    return true;
  }

  public sendGameValidateMessage = async (
    gameId: number,
    gameResult: Array<GameResult>,
    senderDisplayName: string,
    receiver: {
      playerId: string,
      displayName: string,
    },
  ): Promise<boolean> => {
    const receiverScore = gameResult[0].playerId === receiver.playerId ? gameResult[0].score : gameResult[1].score;
    const senderScore = gameResult[0].playerId !== receiver.playerId ? gameResult[0].score : gameResult[1].score;

    await this.slackClient.chat.postMessage({
      channel: receiver.playerId,
      blocks: [
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Hi ${receiver.displayName}!* \nYou had a new game! \n:arrow_down: *Here's your game result* :arrow_down:`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*[${receiver.displayName}]*\n *=== \`${receiverScore}\` Score ===*`,
            },
            {
              type: 'mrkdwn',
              text: `*[${senderDisplayName}]*\n *=== \`${senderScore}\` Score ===*`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '>*Please answer with button, Is this the game you played?*',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Yes, I played this game :table_tennis_paddle_and_ball:',
              },
              style: 'primary',
              value: `${gameId}`,
              action_id: 'validatedGame',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: "No, I didn't play this game :no_entry_sign:",
              },
              style: 'danger',
              value: `${gameId}`,
              action_id: 'invalidGame',
            },
          ],
        },
        {
          type: 'divider',
        },
      ],
    });

    return true;
  }

  public sendSuccessCallbackMessage = async (playerId: string): Promise<boolean> => {
    await this.slackClient.chat.postMessage({
      channel: playerId,
      blocks: [
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Applied successfully.*\n *Thanks for the response:smile:*',
          },
        },
        {
          type: 'divider',
        },
      ],
    });
    return true;
  }

  public sendErrorMessage = async (playerId: string, errorMessage: string): Promise<boolean> => {
    await this.slackClient.chat.postMessage({
      channel: playerId,
      blocks: [
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Sorry something has wrong:face_with_head_bandage:*\n\`Message: ${errorMessage}\`\n> Try again later or continue to run into issues, Please report to Hoon with DM.`,
          },
        },
        {
          type: 'divider',
        },
      ],
    });
    return true;
  }
}

export default SlackService;
