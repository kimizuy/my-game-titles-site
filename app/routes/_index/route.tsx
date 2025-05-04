import type { Route } from "./+types/route";
import { initializeIgdbClient } from "~/lib/igdb";

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
  const _example = await client.getGames({
    fields: ["name"],
    limit: 10,
  });

  console.log(_example);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <div>Home</div>;
}
