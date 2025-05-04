/**
 * IGDB API認証ヘルパー
 *
 * IGDB APIはTwitch APIを通じて認証されます。
 * まずTwitchで開発者アカウントを作成し、アプリケーションを登録する必要があります。
 */
export class IgdbAuthHelper {
  private readonly twitchAuthUrl: string = "https://id.twitch.tv/oauth2/token";
  private readonly clientId: string;
  private readonly clientSecret: string;

  /**
   * 初期化
   * @param clientId - Twitch Developer ClientID
   * @param clientSecret - Twitch Developer Client Secret
   */
  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * IGDBアクセストークンを取得
   * @returns アクセストークン情報
   */
  public async getAccessToken(): Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }> {
    try {
      const url = new URL(this.twitchAuthUrl);
      url.searchParams.append("client_id", this.clientId);
      url.searchParams.append("client_secret", this.clientSecret);
      url.searchParams.append("grant_type", "client_credentials");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `認証エラー: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("IGDBトークン取得エラー:", error);
      throw error;
    }
  }
}
