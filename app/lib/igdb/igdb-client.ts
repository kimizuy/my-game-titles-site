import type {
  AgeRating,
  AlternativeName,
  Artwork,
  Collection,
  Cover,
  ExternalGame,
  Franchise,
  Game,
  GameEngine,
  GameLocalization,
  GameMode,
  GameStatus,
  GameType,
  GameVideo,
  Genre,
  InvolvedCompany,
  Keyword,
  LanguageSupport,
  MultiplayerMode,
  Platform,
  PlayerPerspective,
  ReleaseDate,
  Screenshot,
  Theme,
  Website,
} from "igdb-api-types";

// クライアントの設定オプション型
interface IgdbClientOptions {
  clientId: string;
  accessToken: string;
  baseUrl?: string;
}

// クエリオプション型
interface IgdbQueryOptions {
  fields?: GameFieldKey[];
  limit?: number;
  offset?: number;
  search?: string;
  where?: string[];
  sort?: string;
}

/**
 * IGDB APIクライアントクラス
 */
export class IgdbClient {
  private clientId: string;
  private accessToken: string;
  private baseUrl: string;

  /**
   * コンストラクタ
   * @param options クライアント設定オプション
   */
  constructor(options: IgdbClientOptions) {
    this.clientId = options.clientId;
    this.accessToken = options.accessToken;
    this.baseUrl = options.baseUrl || "https://api.igdb.com";
  }

  /**
   * ゲーム情報を取得
   * @param options クエリオプション
   * @returns ゲームの配列のPromise
   */
  public async getGames(options: IgdbQueryOptions = {}): Promise<Game[]> {
    return this.query<Game>("games", options);
  }

  /**
   * IDからゲーム詳細を取得するメソッド
   * @param id 取得したいゲームのID
   * @param fields 取得したいフィールド（省略可）
   * @returns ゲーム情報のPromise
   */
  public async getGameById(
    id: string,
    fields?: IgdbQueryOptions["fields"],
  ): Promise<Game | null> {
    try {
      const options: IgdbQueryOptions = {
        where: [`id = ${id}`],
        fields,
        limit: 1,
      };

      const results = await this.query<Game>("games", options);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`ゲーム取得エラー (ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 一般的なクエリメソッド
   * @param endpoint APIエンドポイント
   * @param options クエリオプション
   * @returns レスポンスデータの配列のPromise
   */
  public async query<T>(
    endpoint: string,
    options: IgdbQueryOptions = {},
  ): Promise<T[]> {
    try {
      // クエリ文字列の構築
      let queryString = "";

      // フィールドの指定
      if (options.fields && options.fields.length > 0) {
        queryString += `fields ${options.fields.join(",")};`;
      } else {
        queryString += "fields *;";
      }

      // 検索条件
      if (options.search) {
        queryString += ` search "${options.search}";`;
      }

      // WHEREの条件
      if (options.where && options.where.length > 0) {
        queryString += ` where ${options.where.join(" & ")};`;
      }

      // ソート条件
      if (options.sort) {
        queryString += ` sort ${options.sort};`;
      }

      // 結果の制限
      if (options.limit) {
        queryString += ` limit ${options.limit};`;
      }

      // オフセット
      if (options.offset) {
        queryString += ` offset ${options.offset};`;
      }

      const pathnames = ["v4", encodeURIComponent(endpoint)];
      const url = new URL(pathnames.join("/"), this.baseUrl);

      // API呼び出し
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Client-ID": this.clientId,
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: queryString,
      });

      // レスポンスのチェック
      if (!response.ok) {
        throw new Error(
          `IGDB API エラー: ${response.status} ${response.statusText}`,
        );
      }

      // JSONパース
      return (await response.json()) as T[];
    } catch (error) {
      console.error(`IGDB API クエリエラー (${endpoint}):`, error);
      throw error;
    }
  }
}

export type GameFieldKey = NestedKeyOf<
  Game & {
    age_ratings: AgeRating;
    alternative_names: AlternativeName;
    artworks: Artwork;
    collections: Collection;
    cover: Cover;
    external_games: ExternalGame;
    franchise: Franchise;
    franchises: Franchise;
    game_engines: GameEngine;
    game_localizations: GameLocalization;
    game_modes: GameMode;
    game_status: GameStatus;
    game_type: GameType;
    genres: Genre;
    involved_companies: InvolvedCompany;
    keywords: Keyword;
    language_supports: LanguageSupport;
    multiplayer_modes: MultiplayerMode;
    parent_game: Game;
    platforms: Platform;
    player_perspectives: PlayerPerspective;
    release_dates: ReleaseDate;
    screenshots: Screenshot;
    similar_games: Game;
    themes: Theme;
    version_parent: Game;
    videos: GameVideo;
    websites: Website;
  }
>;

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
