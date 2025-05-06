import type { Route } from "./+types/route";
import { GameCard } from "./components/game-card";
import { type } from "arktype";
import type { MetaDescriptor } from "react-router";
import { JAPAN_REGION_ID } from "~/lib/constants";
import { initializeIgdbClient } from "~/lib/igdb";
import type { NestedKeyOf } from "~/lib/igdb/igdb-client";

export async function loader(_: Route.LoaderArgs) {
  const client = await initializeIgdbClient();

  const Games = type({
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
    summary: "string",
  }).array();

  const data = await client.getGames({
    fields: [
      "game_localizations.name",
      "game_localizations.region",
      "summary",
      "cover.image_id",
    ] satisfies NestedKeyOf<(typeof Games.infer)[number]>[],
    where: [
      "platforms = 130", // Nintendo Switch
      "category = 0", // Main Game
      `game_localizations.region = ${JAPAN_REGION_ID}`,
    ],
    limit: 30,
  });

  const validated = Games(data);

  if (validated instanceof type.errors) {
    throw new Error("Invalid game data");
  }

  const result = validated.map((v) => {
    const { game_localizations, ...rest } = v;
    const japanLocalization = game_localizations.find(
      (localization) => localization.region === JAPAN_REGION_ID,
    );

    if (!japanLocalization) {
      throw new Error("No Japanese localization found");
    }

    return {
      ...rest,
      name: japanLocalization.name,
    };
  });

  return result;
}

export function meta(_: Route.MetaArgs): MetaDescriptor[] {
  return [
    { title: "My Game Titles Site" },
    {
      name: "description",
      content: "A site to explore and manage your favorite game titles!",
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="container mx-auto">
      <section className="flex flex-wrap gap-4">
        {loaderData.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </section>
    </div>
  );
}
