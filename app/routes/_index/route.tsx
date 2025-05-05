import type { Route } from "./+types/route";
import { type } from "arktype";
import {
  Link,
  useViewTransitionState,
  type MetaDescriptor,
} from "react-router";
import { JAPAN_REGION_ID } from "~/lib/constants";
import { getIgdbImageUrl, initializeIgdbClient } from "~/lib/igdb";
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
  }).array();

  const data = await client.getGames({
    fields: [
      "game_localizations.name",
      "game_localizations.region",
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
      <section className="columns-2 gap-0 md:columns-3 lg:columns-4 xl:columns-5">
        {loaderData.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </section>
    </div>
  );
}

function GameCard({
  game,
}: {
  game: Route.ComponentProps["loaderData"][number];
}) {
  const to = `/games/${game.id}`;
  const isTransitioning = useViewTransitionState(to);

  return (
    <Link
      to={to}
      viewTransition
      className="relative block rounded-lg transition-all duration-300 hover:z-10 hover:scale-125"
      prefetch="intent" // カーソルホバー時にプリフェッチする
    >
      <div className="relative rounded-lg">
        <img
          src={getIgdbImageUrl(game.cover.image_id, "cover_big_2x")}
          alt={game.name}
          style={{
            viewTransitionName: isTransitioning ? `game-cover-${game.id}` : "",
          }}
          className="h-auto w-full rounded-lg"
        />
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <h2 className="text-sm font-medium text-white">{game.name}</h2>
        </div>
      </div>
    </Link>
  );
}
