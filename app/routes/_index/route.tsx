import type { Route } from "./+types/route";
import { type } from "arktype";
import { getIgdbImageUrl, initializeIgdbClient } from "~/lib/igdb";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "My Game Titles Site" },
    {
      name: "description",
      content: "A site to explore and manage your favorite game titles!",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const client = await initializeIgdbClient();
  const games = await client.getGames({
    fields: ["cover.image_id", "game_localizations.name"],
    where: ["platforms = 130", "category = 0", "game_localizations.region = 3"],
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

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Home</h1>

      <section>
        {loaderData.map((game) => (
          <div key={game.id}>
            <h2>{game.game_localizations[0].name}</h2>
            <img
              src={getIgdbImageUrl(game.cover.image_id)}
              alt={game.game_localizations[0].name}
            />
            <p>Game ID: {game.id}</p>
            <p>Cover ID: {game.cover.image_id}</p>
            <p>Localization Name: {game.game_localizations[0].name}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
