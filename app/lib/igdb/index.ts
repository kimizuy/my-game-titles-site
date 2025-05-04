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
    console.log(
      "アクセストークンを取得しました。有効期限:",
      tokenData.expires_in,
      "秒",
    );

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
