import {
  ValidateBy,
  buildMessage,
} from 'class-validator';
import { GameResult } from '../application/games/model/games.model';

export const IsValidGameResult = () => ValidateBy({
  name: 'IsValidGameResult',
  validator: {
    validate(resultList: Array<GameResult>) {
      if (
        resultList[0].playerId === resultList[1].playerId // same user request
        || resultList[0].score === resultList[1].score // same score request
        || (resultList[0].score < 10 && resultList[1].score < 10) // unfinished game request
        || (Math.abs(resultList[0].score - resultList[1].score) < 2) // invalid deuce rull
      ) {
        return false;
      }
      return true;
    },
    defaultMessage: buildMessage((eachPrefix) => `${eachPrefix} $property is invalid takgg game result`),
  },
});
