import { Database } from '../../database/database';
import { RankingData } from './model/rank.model';

class RankService {
  public getRanking = async (): Promise<Array<RankingData>> => {
    // Insert player
    const query = `
      SELECT
        r.rank as "rank"
        ,p.player_id as "playerId"
        ,p.display_name as "displayName"
        ,p.profile_image as "profileImage"
        ,pp.rating_point as "ratingPoint"
      FROM ranking r
      JOIN player p ON (p.player_id = r.player_id)
      JOIN player_profile pp ON (pp.player_id = r.player_id)
      LIMIT 100
    `;

    const rankList = await Database.prepareExcute<RankingData>({
      query,
    });

    return rankList || [];
  };
}

export default RankService;
