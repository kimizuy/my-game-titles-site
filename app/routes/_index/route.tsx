import type { Route } from "./+types/route";
import { type } from "arktype";
import { motion } from "framer-motion";
import { useState } from "react";
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

interface GameCardProps {
  game: Route.ComponentProps["loaderData"][number];
}

function GameCard({ game }: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const to = `/games/${game.id}`;
  const isTransitioning = useViewTransitionState(to);

  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] },
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] },
    },
  };

  return (
    <Link
      to={to}
      viewTransition
      className="h-96 w-72 cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      style={{ perspective: "1000px" }}
      prefetch="intent" // カーソルホバー時にプリフェッチする
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={isFlipped ? "back" : "front"}
        variants={flipVariants}
      >
        {/* カード表面 */}
        <div
          className="absolute flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* 二行だけ表示する */}
          <h2 className="line-clamp-2 text-center text-2xl font-bold text-white">
            {game.summary}
          </h2>
        </div>

        {/* カード裏面 */}
        <div
          className="absolute h-full w-full overflow-hidden rounded-xl shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            viewTransitionName: isTransitioning ? `game-cover-${game.id}` : "",
          }}
        >
          <img
            src={getIgdbImageUrl(game.cover.image_id, "cover_big_2x")}
            alt={game.name}
            className="h-full w-full object-contain"
          />
        </div>
      </motion.div>
    </Link>
  );
}
