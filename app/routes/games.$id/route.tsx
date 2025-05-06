import type { Route } from "./+types/route";
import { type } from "arktype";
import { MoveLeft } from "lucide-react";
import { useNavigate, useViewTransitionState } from "react-router";
import type { MetaDescriptor } from "react-router";
import { JAPAN_REGION_ID } from "~/lib/constants";
import { getIgdbImageUrl, initializeIgdbClient } from "~/lib/igdb";
import type { NestedKeyOf } from "~/lib/igdb/igdb-client";

export async function loader({ params }: Route.LoaderArgs) {
  const client = await initializeIgdbClient();

  const Game = type({
    id: "number",
    name: "string",
    game_localizations: type({
      id: "number",
      name: "string",
      region: "number",
    }).array(),
    cover: {
      id: "number",
      image_id: "string",
    },
    "artworks?": type({
      id: "number",
      image_id: "string",
    }).array(),
    summary: "string",
  });

  const data = await client.getGameById(params.id, [
    "name",
    "game_localizations.name",
    "game_localizations.region",
    "cover.image_id",
    "artworks.image_id",
    "summary",
  ] satisfies NestedKeyOf<typeof Game.infer>[]);

  const validated = Game(data);

  if (validated instanceof type.errors) {
    throw new Error("Invalid game data");
  }

  const { game_localizations, ...rest } = validated;
  const japanLocalization = game_localizations.find(
    (localization) => localization.region === JAPAN_REGION_ID,
  );

  if (!japanLocalization) {
    throw new Error("No Japanese localization found");
  }

  const result = {
    ...rest,
    japanName: japanLocalization.name,
  };

  return result;
}

export function meta({ data }: Route.MetaArgs): MetaDescriptor[] {
  return [
    {
      title: data.japanName,
    },
  ];
}

export default function GameDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const backPath = "/";
  const isTransitioning = useViewTransitionState(backPath);

  // Linkだとスクロール位置がリセットされてしまうためブラウザバックでホームに戻る
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <article className="prose dark:prose-invert mx-auto">
      <h1>{loaderData.japanName}</h1>
      <p className="text-xl font-semibold">{loaderData.name}</p>

      <div className="md:w-1/2">
        {loaderData.cover && (
          <img
            src={getIgdbImageUrl(loaderData.cover.image_id, "cover_big_2x")}
            alt={loaderData.name}
            style={{
              viewTransitionName: isTransitioning
                ? `game-cover-${loaderData.id}`
                : "",
            }}
            className="w-full rounded-lg shadow-lg"
          />
        )}
      </div>

      {loaderData?.artworks?.length && loaderData.artworks.length > 0 ? (
        <section>
          <h2>Artworks</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {loaderData.artworks?.map(
              (artwork, index) =>
                typeof artwork === "object" && (
                  <div key={artwork.id}>
                    <img
                      src={getIgdbImageUrl(artwork.image_id)}
                      alt={`Artwork ${index + 1}`}
                      loading="lazy"
                    />
                  </div>
                ),
            )}
          </div>
        </section>
      ) : null}

      <section>
        <h2>Summary</h2>
        <p>{loaderData.summary}</p>
      </section>

      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent text-blue-400"
        >
          <MoveLeft />
          戻る
        </button>
      </div>
    </article>
  );
}
