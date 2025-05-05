import type { Route } from "./+types/route";
import { type } from "arktype";
import { Link, type MetaDescriptor } from "react-router";
import { JAPAN_REGION_ID } from "~/lib/constants";
import { getIgdbImageUrl, initializeIgdbClient } from "~/lib/igdb";

export async function loader(_: Route.LoaderArgs) {
  const client = await initializeIgdbClient();
  const games = await client.getGames({
    fields: ["cover.image_id", "game_localizations.name"],
    where: [
      "platforms = 130", // Nintendo Switch
      "category = 0", // Main Game
      `game_localizations.region = ${JAPAN_REGION_ID}`,
    ],
    limit: 300,
  });

  const Result = type({
    id: "number",
    game_localizations: type({
      id: "number",
      name: "string",
    }).array(),
    cover: {
      id: "number",
      image_id: "string",
    },
  });

  const result = games.filter(
    (game): game is typeof Result.infer =>
      !(Result(game) instanceof type.errors),
  );

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
    <div>
      <h1>Home</h1>

      <section className="columns-2 gap-0 md:columns-3 lg:columns-4 xl:columns-5">
        {loaderData.map((game) => (
          <Link to={`/games/${game.id}`} key={game.id}>
            <img
              src={getIgdbImageUrl(game.cover.image_id, "cover_big_2x")}
              alt={game.game_localizations[0].name}
            />
          </Link>
        ))}
      </section>
    </div>
  );
}
