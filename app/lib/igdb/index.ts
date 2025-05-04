import { IgdbAuthHelper } from "./igdb-auth-helper";
import { IgdbClient } from "./igdb-client";
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

export async function initializeIgdbClient(): Promise<IgdbClient> {
  // Twitchデベロッパーポータルで取得したクレデンシャル
  const clientId = process.env.IGDB_API_CLIENT_ID;
  const clientSecret = process.env.IGDB_API_CLIENT_SECRET;

  try {
    if (!clientId || !clientSecret) {
      throw new Error("IGDB APIのクレデンシャルが設定されていません。");
    }
    // 認証ヘルパーを作成
    const authHelper = new IgdbAuthHelper(clientId, clientSecret);
    // アクセストークンを取得
    const tokenData = await authHelper.getAccessToken();

    // IGDBクライアントを初期化して返す
    return new IgdbClient({
      clientId: clientId,
      accessToken: tokenData.access_token,
    });
  } catch (error) {
    console.error("IGDB認証エラー:", error);
    throw error;
  }
}

// ref: https://api-docs.igdb.com/#images
type Size =
  | "cover_small"
  | "screenshot_med"
  | "cover_big"
  | "logo_med"
  | "screenshot_big"
  | "screenshot_huge"
  | "thumb"
  | "micro"
  | "720p"
  | "1080p";

/**
 * 画像URLを生成
 * @param imageId 画像ID
 * @param size 画像サイズ（デフォルト: cover_big）
 * @returns 画像URL
 */
export function getIgdbImageUrl(
  imageId: string,
  size: Size = "cover_big",
): string {
  const baseUrl = "https://images.igdb.com";
  const url = new URL(`/igdb/image/upload/t_${size}/${imageId}.jpg`, baseUrl);
  return url.toString();
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
