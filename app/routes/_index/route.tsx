import type { Route } from "./+types/route";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "My Game Titles Site" },
    {
      name: "description",
      content: "A site to explore and manage your favorite game titles!",
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <div>Home</div>;
}
