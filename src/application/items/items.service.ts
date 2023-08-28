import { Database } from '../../database/database';
import { Racket, Rubber } from './model/items.model';

class ItemsService {
  public getAllRackets = async (): Promise<Array<Racket>> => {
    // Insert player
    const query = `
      SELECT
        *
      FROM rackets
      ORDER BY name ASC
    `;

    const racketList = await Database.prepareExcute<Racket>({
      query,
    });

    if (!racketList) return [];
    return racketList;
  };

  public getAllRubbers = async (): Promise<Array<Rubber>> => {
    // Insert player
    const query = `
      SELECT
        *
      FROM rubbers
      ORDER BY name ASC
    `;

    const rubberList = await Database.prepareExcute<Rubber>({
      query,
    });

    if (!rubberList) return [];
    return rubberList;
  };
}

export default ItemsService;
