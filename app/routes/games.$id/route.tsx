import type { Route } from "./+types/route";
import { type } from "arktype";
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
    "artworks?": type({
      id: "number",
      image_id: "string",
    }).array(),
  });

  const data = await client.getGameById(params.id, [
    "game_localizations.name",
    "game_localizations.region",
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

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.name}</h1>

      <section className="grid grid-flow-col overflow-x-auto">
        {loaderData?.artworks?.map(
          (artwork, index) =>
            typeof artwork === "object" && (
              <div key={artwork.id}>
                <img
                  src={getIgdbImageUrl(artwork.image_id)}
                  alt={`Artwork ${index + 1}`}
                  className="artwork-image"
                />
              </div>
            ),
        )}
      </section>
    </div>
  );
}
