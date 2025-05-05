import type { Route } from "./+types/route";
import { type } from "arktype";
import type { MetaDescriptor } from "react-router";
import { JAPAN_REGION_ID } from "~/lib/constants";
import { getIgdbImageUrl, initializeIgdbClient } from "~/lib/igdb";

export async function loader({ params }: Route.LoaderArgs) {
  const client = await initializeIgdbClient();
  const game = await client.getGameById(params.id, [
    "game_localizations.name",
    "game_localizations.region",
    "artworks.image_id",
  ]);

  const Result = type({
    id: "number",
    game_localizations: type({
      id: "number",
      name: "string",
      region: "number",
    }).array(),
    artworks: type({
      id: "number",
      image_id: "string",
    }).array(),
  });

  if (Result(game) instanceof type.errors) {
    throw new Error("Invalid game data");
  }

  const validGame = game as typeof Result.infer;

  const result = {
    ...validGame,
    game_localizations: validGame.game_localizations.filter(
      (localization) => localization.region === JAPAN_REGION_ID,
    ),
  };

  return result;
}

export function meta({ data }: Route.MetaArgs): MetaDescriptor[] {
  return [
    {
      title: data.game_localizations[0].name,
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.game_localizations[0].name}</h1>

      <section className="grid grid-flow-col">
        {loaderData?.artworks?.map(
          (artwork) =>
            typeof artwork === "object" && (
              <div key={artwork.id}>
                <img
                  src={getIgdbImageUrl(artwork.image_id)}
                  alt={artwork.image_id}
                  className="artwork-image"
                />
              </div>
            ),
        )}
      </section>
    </div>
  );
}
