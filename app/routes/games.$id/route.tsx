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
  });

  const data = await client.getGameById(params.id, [
    "game_localizations.name",
    "game_localizations.region",
    "cover.image_id",
    "artworks.image_id",
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
    name: japanLocalization.name,
  };

  return result;
}

export function meta({ data }: Route.MetaArgs): MetaDescriptor[] {
  return [
    {
      title: data.name,
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
    <div className="prose dark:prose-invert mx-auto">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent"
      >
        <MoveLeft />
        戻る
      </button>

      <h1 className="text-2xl font-bold text-balance">{loaderData.name}</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3">
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
      </div>

      {loaderData?.artworks?.length && loaderData.artworks.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">アートワーク</h2>
          {/* grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {loaderData.artworks?.map(
              (artwork, index) =>
                typeof artwork === "object" && (
                  <div
                    key={artwork.id}
                    className="bg-background min-w-[280px] snap-start overflow-hidden rounded-lg shadow-md"
                  >
                    <img
                      src={getIgdbImageUrl(artwork.image_id)}
                      alt={`Artwork ${index + 1}`}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ),
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
