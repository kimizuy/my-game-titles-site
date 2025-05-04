import type { Game } from "igdb-api-types";

// クライアントの設定オプション型
interface IgdbClientOptions {
  clientId: string;
  accessToken: string;
  baseUrl?: string;
}

// クエリオプション型
interface IgdbQueryOptions {
  fields?: string[];
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
