import { IgdbAuthHelper } from "./igdb-auth-helper";
import { IgdbClient } from "./igdb-client";

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
type _Size =
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

type Size = _Size | `${_Size}_2x`;

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
