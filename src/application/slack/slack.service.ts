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

  public publishAppHome = async (playerId: string): Promise<boolean> => {
    await this.slackClient.views.publish({
      user_id: playerId,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: "Hey :wave: I'm a PlayDapp pingpong manager!:table_tennis_paddle_and_ball:",
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: "You can use the rating system and search the player's match history! \nFollow the instructions below if you want to use it!",
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:one: *If you don't have TakGG mobile application?*\n>Request <@${Config.getConfig().SLACK_BOT_CONFIG.ADMIN_USER_ID}> for a mobile application in DM!`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':two: *Get Authentication key and login to TakGG Application!*\n>Log in to TakGG using Authentication key!\n>Identification is based on the user information of Slack.',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '>*If you need a Authentication key?*\n>*Click right button* :arrow_right:',
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Get Auth Token :unlock:',
              },
              value: 'getAuthToken',
              action_id: 'getAuthToken',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':three: *Edit your profile in App!*\n>Customize your profile!\n>You can edit and show your paddle style, racket, and rubber to everyone!',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':four: *Start up your pingpong career!*\n>Start games and submit your game results!\n>Try to go higher!\n>Good Luck Have Fun :fire:',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_TakGG team always supports your victory._',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `:eyes: If you have any Complaints, Ideas, Bug or Player Reports? DM <@${Config.getConfig().SLACK_BOT_CONFIG.ADMIN_USER_ID}>\n`,
              },
            ],
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*<https://www.buymeacoffee.com/dodongdang|Buy coffee for TakGG team>*\nPlease help TakGG team pay for the server cost, and develop better!',
            },
            accessory: {
              type: 'image',
              image_url: 'https://media4.giphy.com/media/TDQOtnWgsBx99cNoyH/giphy.gif',
              alt_text: 'Buy coffee for TakGG team thumbnail',
            },
          },
          {
            type: 'divider',
          },
        ],
      },
    });
    return true;
  }
}

export default SlackService;
